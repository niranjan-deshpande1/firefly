"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, INTERVIEW_MODELS, INTERVIEW_MODES, INTERVIEW_OUTCOMES, INTERVIEW_SECTIONS } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorize, ForbiddenError, requireRoleForAction } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/format/date";
import { blindProjectIds, canRunInterview, isAdvanced } from "./queries";
import { completionError, interviewerError, isValidTimeZone, scoringError, zonedTimeToUtc } from "./rules";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

function errorText(e: unknown): string {
  if (e instanceof ForbiddenError) return e.message;
  throw e;
}

const scheduleSchema = z
  .object({
    projectId: z.string().min(1),
    model: z.enum(INTERVIEW_MODELS),
    mode: z.enum(INTERVIEW_MODES),
    localTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "that time is not complete, choose a date and a time."),
    timeZone: z.string().refine(isValidTimeZone, "that timezone does not match an IANA zone, choose one from the list."),
    durationMin: z.coerce.number().int().min(15).max(240),
    roleId: z.string().optional(),
    location: z.string().trim().max(300).optional(),
    videoLink: z.string().trim().max(500).optional(),
    interviewerIds: z.array(z.string().min(1)).max(10),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "IN_PERSON" && !v.location) ctx.addIssue({ code: "custom", path: ["location"], message: "the location is empty, add the address of the room." });
    if (v.mode === "VIDEO" && !/^https:\/\/\S+$/.test(v.videoLink ?? ""))
      ctx.addIssue({ code: "custom", path: ["videoLink"], message: "that video link is not an https link, paste the full meeting link." });
    if (v.model !== "WE_RUN" && !v.roleId) ctx.addIssue({ code: "custom", path: ["roleId"], message: "no role is chosen, pick the role this interview is for." });
  });

export type ScheduleInput = z.input<typeof scheduleSchema>;

export async function scheduleInterview(input: ScheduleInput): Promise<ActionResult<{ id: string }>> {
  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;

  try {
    const user = await requireRoleForAction("ORGANIZER");
    await authorize(user, "interview.schedule", { projectId: v.projectId });

    const project = await prisma.project.findUnique({
      where: { id: v.projectId },
      select: { id: true, title: true, ownerId: true, hackathonId: true, owner: { select: { name: true, email: true } } },
    });
    if (!project || !(await isAdvanced(project.id))) return { ok: false, error: "this project has not advanced, schedule interviews for advanced projects only." };

    const role = v.roleId
      ? await prisma.role.findFirst({
          where: { id: v.roleId, enrollments: { some: { hackathonId: project.hackathonId } } },
          select: { id: true, companyId: true, company: { select: { members: { select: { userId: true } } } } },
        })
      : null;
    if (v.roleId && !role) return { ok: false, error: "that role is not enrolled in this cohort, pick one from the list." };

    const reviewerRows = await prisma.user.findMany({ where: { id: { in: v.interviewerIds }, role: "REVIEWER" }, select: { id: true } });
    const reviewerIds = new Set(reviewerRows.map((r) => r.id));
    const memberIds = new Set(role?.company.members.map((m) => m.userId) ?? []);
    const panelError = interviewerError(v.model, [...new Set(v.interviewerIds)], reviewerIds, memberIds);
    if (panelError) return { ok: false, error: panelError };

    const scheduledAt = zonedTimeToUtc(v.localTime, v.timeZone);
    if (!scheduledAt) return { ok: false, error: "that time is not valid, choose a date and a time." };
    if (scheduledAt.getTime() <= Date.now()) return { ok: false, error: "that time has already passed, choose a time in the future." };

    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({
        data: {
          projectId: project.id,
          candidateId: project.ownerId,
          roleId: role?.id ?? null,
          model: v.model,
          mode: v.mode,
          scheduledAt,
          timeZone: v.timeZone,
          durationMin: v.durationMin,
          location: v.mode === "IN_PERSON" ? v.location : null,
          videoLink: v.mode === "VIDEO" ? v.videoLink : null,
          interviewers: { create: [...new Set(v.interviewerIds)].map((userId) => ({ userId })) },
        },
        select: { id: true },
      });
      if (role) {
        await tx.interviewRequest.updateMany({
          where: { roleId: role.id, candidateId: project.ownerId, status: "PENDING" },
          data: { status: "SCHEDULED" },
        });
      }
      return created;
    });

    if (project.owner.email) {
      await sendEmail(
        project.owner.email,
        "interviewScheduled",
        {
          name: project.owner.name ?? "there",
          when: formatDateTime(scheduledAt, v.timeZone),
          where: v.mode === "IN_PERSON" ? v.location! : `this video link: ${v.videoLink}`,
          minutes: v.durationMin,
        },
        { interviewId: interview.id, projectId: project.id },
      );
    }

    revalidatePath("/interviews");
    revalidatePath("/company", "layout");
    return { ok: true, data: { id: interview.id } };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

/** Loads an interview the current user may run; throws ForbiddenError otherwise. */
async function loadRunnable(interviewId: string) {
  const user = await getCurrentUser();
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { interviewers: { select: { userId: true } }, scores: { select: { section: true } } },
  });
  if (!interview || !(await canRunInterview(user, interview))) throw new ForbiddenError();
  if ((await blindProjectIds(user!.id, [interview.projectId])).size > 0) {
    throw new ForbiddenError("post your review and reveal the builder before you run this defense.");
  }
  return { user: user!, interview };
}

const idSchema = z.object({ interviewId: z.string().min(1) });

export async function confirmIdentity(input: { interviewId: string }): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "that interview was not found, return to your interviews." };
  try {
    const { user, interview } = await loadRunnable(parsed.data.interviewId);
    if (interview.status === "COMPLETED" || interview.status === "CANCELLED") return { ok: false, error: "this interview is closed, return to your interviews." };
    if (!interview.identityCheckedAt) {
      // Records only who checked and when. Never a copy or photo of the ID (verification.md 2.4).
      await prisma.interview.update({
        where: { id: interview.id },
        data: { identityCheckedById: user.id, identityCheckedAt: new Date(), status: "IN_PROGRESS" },
      });
    }
    revalidatePath(`/interviews/${interview.id}`);
    revalidatePath("/interviews");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

const scoreSchema = z.object({
  interviewId: z.string().min(1),
  section: z.enum(INTERVIEW_SECTIONS),
  score: z.coerce.number().int().min(1, "no score is chosen, pick a level from 1 to 4.").max(4),
  notes: z.string().trim().min(1, "the notes are empty, write what you saw that supports the score.").max(4000),
});

export async function saveSectionScore(input: z.input<typeof scoreSchema>): Promise<ActionResult> {
  const parsed = scoreSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  try {
    const { user, interview } = await loadRunnable(v.interviewId);
    const locked = scoringError(interview);
    if (locked) return { ok: false, error: locked };
    await prisma.interviewScore.upsert({
      where: { interviewId_section_scoredById: { interviewId: interview.id, section: v.section, scoredById: user.id } },
      create: { interviewId: interview.id, section: v.section, score: v.score, notes: v.notes, scoredById: user.id },
      update: { score: v.score, notes: v.notes },
    });
    revalidatePath(`/interviews/${interview.id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

const completeSchema = z.object({
  interviewId: z.string().min(1),
  outcome: z.enum(INTERVIEW_OUTCOMES, { message: "no outcome is chosen, pick pass or fail." }),
  notes: z.string().trim().min(1, "the outcome notes are empty, write why the panel reached this outcome.").max(4000),
});

export async function completeInterview(input: z.input<typeof completeSchema>): Promise<ActionResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  try {
    const { user, interview } = await loadRunnable(v.interviewId);
    const blocked = completionError(interview, interview.scores);
    if (blocked) return { ok: false, error: blocked };

    const now = new Date();
    // Conditional close: if another panelist completed it a moment ago, this one changes nothing.
    const closed = await prisma.$transaction(async (tx) => {
      const { count } = await tx.interview.updateMany({
        where: { id: interview.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
        data: { status: "COMPLETED", outcome: v.outcome, notes: v.notes, completedAt: now },
      });
      if (count === 1 && v.outcome === "PASS") await tx.project.update({ where: { id: interview.projectId }, data: { verified: true, verifiedAt: now } });
      return count === 1;
    });
    if (!closed) return { ok: false, error: "this interview is already closed, reload the room to see its outcome." };
    await audit({
      actorId: user.id,
      action: "INTERVIEW_COMPLETED",
      resourceType: "Interview",
      resourceId: interview.id,
      subjectUserId: interview.candidateId,
      metadata: { outcome: v.outcome, projectId: interview.projectId },
    });

    revalidatePath("/interviews");
    revalidatePath(`/interviews/${interview.id}`);
    revalidatePath(`/projects/${interview.projectId}`);
    revalidatePath("/u/[username]", "page");
    revalidatePath("/company", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}
