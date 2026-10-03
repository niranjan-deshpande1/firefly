"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, toJson } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorize, ForbiddenError, requireRoleForAction } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { deleteStoredFile } from "@/lib/storage";
import { formatDate } from "@/lib/format/date";
import { commentSchema, isBeforeDeadline, postingProblems, projectInputSchema, type ProjectInput } from "./schema";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Turns a ForbiddenError into a result the client can show beside the control. */
async function guarded<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
}

function zodResult(error: z.ZodError): { ok: false; error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, error: error.issues[0]?.message ?? "something in the form is not valid, check each step.", fieldErrors };
}

function deadlineError(deadline: Date) {
  return `the posting deadline passed on ${formatDate(deadline)}, changes are closed.`;
}

function revalidateProject(projectId: string, slug: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/edit`);
  revalidatePath(`/hackathons/${slug}/projects`);
}

/** Creates or updates a project, as a draft or posted. Posting sends `submissionReceived` to every member. */
export async function saveProject(raw: ProjectInput): Promise<ActionResult<{ projectId: string; status: string }>> {
  return guarded(async () => {
    const parsed = projectInputSchema.safeParse(raw);
    if (!parsed.success) return zodResult(parsed.error);
    const input = parsed.data;
    const user = await requireRoleForAction("CANDIDATE");

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: input.hackathonId },
      select: { id: true, slug: true, title: true, submissionDeadline: true },
    });
    if (!hackathon) return { ok: false, error: "that hackathon no longer exists, open the hackathon list." };
    if (!isBeforeDeadline(hackathon.submissionDeadline)) return { ok: false, error: deadlineError(hackathon.submissionDeadline) };

    let existing: { id: string; status: string; submittedAt: Date | null; hackathonId: string } | null = null;
    if (input.projectId) {
      await authorize(user, "project.edit", { projectId: input.projectId });
      existing = await prisma.project.findUnique({
        where: { id: input.projectId },
        select: { id: true, status: true, submittedAt: true, hackathonId: true },
      });
      if (!existing || existing.hackathonId !== hackathon.id) {
        return { ok: false, error: "that project is not part of this hackathon, open it from your dashboard." };
      }
    } else {
      const registration = await prisma.registration.findUnique({
        where: { hackathonId_userId: { hackathonId: hackathon.id, userId: user.id } },
      });
      if (!registration || registration.status === "WITHDRAWN") {
        return { ok: false, error: "you are not registered for this hackathon, register first." };
      }
      const already = await prisma.project.findFirst({
        where: { hackathonId: hackathon.id, OR: [{ ownerId: user.id }, { team: { members: { some: { userId: user.id } } } }] },
        select: { id: true },
      });
      if (already) return { ok: false, error: "you already have a project in this hackathon, open it to keep editing." };
    }

    if (input.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: input.teamId, hackathonId: hackathon.id, members: { some: { userId: user.id } } },
        select: { id: true },
      });
      if (!team) return { ok: false, error: "you are not on that team, choose your own team in the team step.", fieldErrors: { teamId: "choose your own team." } };
      const clash = await prisma.project.findFirst({
        where: { teamId: team.id, NOT: existing ? { id: existing.id } : undefined },
        select: { id: true },
      });
      if (clash) return { ok: false, error: "your team already has a project, open it from the gallery or your dashboard.", fieldErrors: { teamId: "your team already has a project." } };
    }

    const wantsPost = input.intent === "post" || existing?.status === "SUBMITTED"; // posted projects stay posted
    if (wantsPost) {
      const problems = postingProblems(input);
      if (problems.length > 0) return { ok: false, error: problems[0] };
    }
    const newlyPosted = wantsPost && existing?.status !== "SUBMITTED";

    const data = {
      title: input.title,
      tagline: input.tagline,
      story: input.story,
      builtWith: toJson(input.builtWith),
      links: toJson(input.links),
      repoUrl: input.repoUrl,
      videoUrl: input.videoUrl,
      teamId: input.teamId,
      status: wantsPost ? "SUBMITTED" : "DRAFT",
      submittedAt: wantsPost ? (existing?.submittedAt ?? new Date()) : null,
    };

    const project = existing
      ? await prisma.project.update({ where: { id: existing.id }, data, select: { id: true } })
      : await prisma.project.create({ data: { ...data, hackathonId: hackathon.id, ownerId: user.id }, select: { id: true } });

    if (newlyPosted) await announcePosting(project.id, hackathon.id, input.title);

    revalidateProject(project.id, hackathon.slug);
    revalidatePath("/dashboard");
    return { ok: true, data: { projectId: project.id, status: data.status } };
  });
}

/** Emails every member and marks their registrations as posted. */
async function announcePosting(projectId: string, hackathonId: string, title: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      owner: { select: { id: true, name: true, email: true } },
      team: { select: { members: { select: { user: { select: { id: true, name: true, email: true } } } } } },
    },
  });
  if (!project) return;
  const people = new Map([project.owner, ...(project.team?.members.map((m) => m.user) ?? [])].map((u) => [u.id, u]));
  await prisma.registration.updateMany({
    where: { hackathonId, userId: { in: [...people.keys()] }, status: "REGISTERED" },
    data: { status: "SUBMITTED" },
  });
  for (const u of people.values()) {
    if (u.email) await sendEmail(u.email, "submissionReceived", { name: u.name ?? "there", project: title }, { projectId });
  }
}

const idSchema = z.object({ id: z.string().min(1) });

export async function removeProjectImage(raw: { id: string }): Promise<ActionResult> {
  return guarded(async () => {
    const parsed = idSchema.safeParse(raw);
    if (!parsed.success) return zodResult(parsed.error);
    const user = await getCurrentUser();
    const image = await prisma.projectImage.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, url: true, projectId: true, project: { select: { hackathon: { select: { slug: true, submissionDeadline: true } } } } },
    });
    if (!image) return { ok: false, error: "that image is already gone, reload the page." };
    await authorize(user, "project.edit", { projectId: image.projectId });
    const { slug, submissionDeadline } = image.project.hackathon;
    if (!isBeforeDeadline(submissionDeadline)) return { ok: false, error: deadlineError(submissionDeadline) };
    await prisma.projectImage.delete({ where: { id: image.id } });
    const fileId = image.url.match(/^\/api\/files\/([^/?#]+)$/)?.[1];
    if (fileId) await deleteStoredFile(fileId).catch(() => undefined); // the row is gone either way; a missing file is fine
    revalidateProject(image.projectId, slug);
    return { ok: true };
  });
}

export async function toggleLike(raw: { id: string }): Promise<ActionResult<{ liked: boolean }>> {
  return guarded(async () => {
    const parsed = idSchema.safeParse(raw);
    if (!parsed.success) return zodResult(parsed.error);
    const projectId = parsed.data.id;
    const user = await getCurrentUser();
    await authorize(user, "project.like", { projectId });
    const where = { projectId_userId: { projectId, userId: user!.id } };
    const existing = await prisma.projectLike.findUnique({ where });
    if (existing) await prisma.projectLike.delete({ where });
    else await prisma.projectLike.create({ data: { projectId, userId: user!.id } });
    revalidatePath(`/projects/${projectId}`);
    return { ok: true, data: { liked: !existing } };
  });
}

export async function postComment(raw: { projectId: string; body: string }): Promise<ActionResult> {
  return guarded(async () => {
    const parsed = commentSchema.safeParse(raw);
    if (!parsed.success) return zodResult(parsed.error);
    const user = await getCurrentUser();
    await authorize(user, "comment.create", { projectId: parsed.data.projectId });
    await prisma.comment.create({ data: { projectId: parsed.data.projectId, authorId: user!.id, body: parsed.data.body } });
    revalidatePath(`/projects/${parsed.data.projectId}`);
    return { ok: true };
  });
}

/** Organizers of the project's hackathon and admins can hide a comment. Audited as COMMENT_HIDDEN. */
export async function hideComment(raw: { id: string }): Promise<ActionResult> {
  return guarded(async () => {
    const parsed = idSchema.safeParse(raw);
    if (!parsed.success) return zodResult(parsed.error);
    const user = await getCurrentUser();
    const comment = await prisma.comment.findUnique({ where: { id: parsed.data.id }, select: { id: true, projectId: true, authorId: true, hidden: true } });
    if (!comment) return { ok: false, error: "that comment no longer exists, reload the page." };
    await authorize(user, "comment.moderate", { projectId: comment.projectId });
    if (!comment.hidden) {
      await prisma.comment.update({ where: { id: comment.id }, data: { hidden: true, hiddenById: user!.id } });
      await audit({
        actorId: user!.id,
        action: "COMMENT_HIDDEN",
        resourceType: "Comment",
        resourceId: comment.id,
        subjectUserId: comment.authorId,
        metadata: { projectId: comment.projectId },
      });
    }
    revalidatePath(`/projects/${comment.projectId}`);
    return { ok: true };
  });
}
