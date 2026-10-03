"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { guarded, managedForAction, revalidateHackathon } from "../guard";
import {
  formObject,
  invalid,
  isAssignableRole,
  judgeAssignmentSchema,
  reviewerAssignmentSchema,
  reviewerBlocker,
  updateSchema,
  winnerBlocker,
  winnerSchema,
  type ActionResult,
} from "../schemas";

const zId = z.string().min(1).max(64);
const NOT_FOUND: ActionResult = { ok: false, error: "that row was not found, reload the page and try again." };

// ---------- updates ----------

/** Posts an update and writes one hackathonUpdate email per active registrant to the email log. */
export async function postUpdate(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { user, hackathon } = await managedForAction(form);
    const { title, body } = parsed.data;
    const update = await prisma.update.create({ data: { hackathonId: hackathon.id, title, body, authorId: user.id } });
    const registrants = await prisma.registration.findMany({
      where: { hackathonId: hackathon.id, status: { not: "WITHDRAWN" }, user: { email: { not: null } } },
      select: { user: { select: { id: true, email: true } } },
    });
    // ponytail: sequential writes to the log; batch with createMany if cohorts grow past a few hundred.
    for (const { user: r } of registrants) {
      await sendEmail(r.email as string, "hackathonUpdate", { hackathon: hackathon.title, title, body }, {
        hackathonId: hackathon.id,
        updateId: update.id,
        userId: r.id,
      });
    }
    revalidateHackathon(hackathon.slug);
    const n = registrants.length;
    return { ok: true, message: `update posted, ${n} ${n === 1 ? "email" : "emails"} logged` };
  });
}

// ---------- reviewer assignment (hiring cohorts) ----------

export async function assignReviewer(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = reviewerAssignmentSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { hackathon } = await managedForAction(form);
    if (hackathon.type !== "HIRING_COHORT") return { ok: false, error: "reviewers are assigned in hiring cohorts, assign judges here instead." };
    const { projectId, reviewerId } = parsed.data;
    const [project, reviewer] = await Promise.all([
      prisma.project.findFirst({
        where: { id: projectId, hackathonId: hackathon.id },
        select: { ownerId: true, team: { select: { members: { select: { userId: true } } } }, reviewerAssignments: { select: { reviewerId: true } } },
      }),
      prisma.user.findUnique({ where: { id: reviewerId }, select: { role: true } }),
    ]);
    if (!project) return NOT_FOUND;
    const blocker = reviewerBlocker({
      reviewerRole: reviewer?.role ?? null,
      reviewerId,
      memberIds: [project.ownerId, ...(project.team?.members.map((m) => m.userId) ?? [])],
      assignedIds: project.reviewerAssignments.map((a) => a.reviewerId),
    });
    if (blocker) return { ok: false, error: blocker, fieldErrors: { reviewerId: blocker } };
    await prisma.reviewerAssignment.create({ data: { projectId, reviewerId } });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "reviewer assigned" };
  });
}

export async function unassignReviewer(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return NOT_FOUND;
  return guarded(async () => {
    const { hackathon } = await managedForAction(form);
    const { count } = await prisma.reviewerAssignment.deleteMany({ where: { id: id.data, project: { hackathonId: hackathon.id } } });
    if (count === 0) return NOT_FOUND;
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "reviewer removed" };
  });
}

// ---------- judge assignment (open hackathons) ----------

export async function assignJudge(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = judgeAssignmentSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { hackathon } = await managedForAction(form);
    if (hackathon.type !== "OPEN") return { ok: false, error: "judges are assigned in open hackathons, assign reviewers here instead." };
    const { judgeId, projectId } = parsed.data;
    const judge = await prisma.user.findUnique({ where: { id: judgeId }, select: { role: true } });
    if (!judge || !isAssignableRole(judge.role)) {
      const error = "only reviewers can judge, choose someone with the reviewer role.";
      return { ok: false, error, fieldErrors: { judgeId: error } };
    }
    if (projectId && !(await prisma.project.findFirst({ where: { id: projectId, hackathonId: hackathon.id }, select: { id: true } }))) {
      return NOT_FOUND;
    }
    const existing = await prisma.judgeAssignment.findFirst({ where: { hackathonId: hackathon.id, judgeId, projectId } });
    if (existing) {
      const error = "that judge already has this assignment, choose another project or judge.";
      return { ok: false, error, fieldErrors: { judgeId: error } };
    }
    await prisma.judgeAssignment.create({ data: { hackathonId: hackathon.id, judgeId, projectId } });
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "judge assigned" };
  });
}

export async function unassignJudge(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return NOT_FOUND;
  return guarded(async () => {
    const { hackathon } = await managedForAction(form);
    const { count } = await prisma.judgeAssignment.deleteMany({ where: { id: id.data, hackathonId: hackathon.id } });
    if (count === 0) return NOT_FOUND;
    revalidateHackathon(hackathon.slug);
    return { ok: true, message: "judge removed" };
  });
}

// ---------- winners (open hackathons) ----------

export async function pickWinner(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = winnerSchema.safeParse(formObject(form));
  if (!parsed.success) return invalid(parsed.error);
  return guarded(async () => {
    const { hackathon } = await managedForAction(form, "winner.pick");
    const { prizeId, projectId } = parsed.data;
    const [prize, project] = await Promise.all([
      prisma.prize.findFirst({ where: { id: prizeId, hackathonId: hackathon.id }, include: { winners: { select: { projectId: true } } } }),
      prisma.project.findUnique({ where: { id: projectId }, select: { hackathonId: true, status: true, title: true } }),
    ]);
    if (!prize) return NOT_FOUND;
    const blocker = winnerBlocker({
      hackathonType: hackathon.type,
      hackathonStatus: hackathon.status,
      hackathonId: hackathon.id,
      projectHackathonId: project?.hackathonId ?? null,
      projectStatus: project?.status ?? null,
      prizeQuantity: prize.quantity,
      winnerCount: prize.winners.length,
      alreadyWon: prize.winners.some((w) => w.projectId === projectId),
    });
    if (blocker) return { ok: false, error: blocker, fieldErrors: { projectId: blocker } };
    await prisma.winner.create({ data: { hackathonId: hackathon.id, prizeId, projectId } });
    revalidateHackathon(hackathon.slug);
    revalidatePath(`/projects/${projectId}`);
    return { ok: true, message: `${project?.title} awarded ${prize.name}` };
  });
}

export async function removeWinner(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return NOT_FOUND;
  return guarded(async () => {
    const { hackathon } = await managedForAction(form, "winner.pick");
    const { count } = await prisma.winner.deleteMany({ where: { id: id.data, hackathonId: hackathon.id } });
    if (count === 0) return NOT_FOUND;
    revalidateHackathon(hackathon.slug);
    revalidatePath("/projects/[id]", "page");
    return { ok: true, message: "award removed" };
  });
}
