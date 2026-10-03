"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { audit, auditAccess } from "@/lib/audit";
import { prisma, toJson, DECISION_OUTCOMES, REVIEW_KINDS, type EvidenceRef } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { authorize, check, ForbiddenError } from "@/lib/permissions";
import { calibrationState, loadEvidence, loadProject, projectCandidates, scoreItems } from "./queries";
import { decisionBlocker, feedbackBlocker, OUTCOME_LABEL, postingProblems, type ScoreProblems } from "./rules";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string; problems?: ScoreProblems };

const NOT_FOUND = "this project isn't available to you, go back to your queue.";

async function guard<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
}

function revalidateProject(projectId: string) {
  for (const path of ["/review", `/review/${projectId}`, `/review/calibration/${projectId}`, "/judge", `/judge/${projectId}`]) revalidatePath(path);
}

const zRef = z.object({ kind: z.enum(["COMMIT", "TRANSCRIPT", "DECISION", "CHECKIN", "INTERVIEW_NOTE"]), id: z.string().min(1).max(64) });

const zSaveReview = z.object({
  projectId: z.string().min(1).max(64),
  kind: z.enum(REVIEW_KINDS),
  intent: z.enum(["draft", "post"]),
  summaryNote: z.string().max(4000).optional(),
  scores: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        score: z.number().int().min(1).max(4).nullable(),
        rationale: z.string().max(4000),
        evidenceRefs: z.array(zRef).max(30),
      }),
    )
    .max(60),
});

/** Saves a draft, or posts the review. Posting is refused unless every score has a rationale (and, for rubric reviews, evidence). */
export async function saveReview(input: z.input<typeof zSaveReview>): Promise<ActionResult> {
  return guard(async () => {
    const parsed = zSaveReview.safeParse(input);
    if (!parsed.success) return { ok: false, error: "some scores couldn't be read, reload the page and try again." };
    const { projectId, kind, intent, scores, summaryNote } = parsed.data;

    const user = await getCurrentUser();
    await authorize(user, kind === "RUBRIC" ? "review.score" : "judge.score", { projectId });
    const project = await loadProject(projectId);
    if (!project || !user) return { ok: false, error: NOT_FOUND };

    const existing = await prisma.review.findUnique({ where: { projectId_reviewerId_kind: { projectId, reviewerId: user.id, kind } } });
    if (existing?.status === "SUBMITTED") return { ok: false, error: "this review is already posted, it can't be changed." };

    const items = await scoreItems(project, kind);
    const itemByKey = new Map(items.map((i) => [i.key, i]));
    // Evidence refs are rebuilt from the project's own evidence; anything else is dropped.
    const options = kind === "RUBRIC" ? (await loadEvidence(project)).options : [];
    const optionByKey = new Map(options.map((o) => [`${o.kind}:${o.id}`, o]));
    const drafts = scores
      .filter((s) => itemByKey.has(s.key))
      .map((s) => ({
        ...s,
        rationale: s.rationale.trim(),
        evidenceRefs: s.evidenceRefs.flatMap((r) => optionByKey.get(`${r.kind}:${r.id}`) ?? []) as EvidenceRef[],
      }));

    if (intent === "post") {
      const problems = postingProblems(items, drafts, kind === "RUBRIC");
      const count = Object.keys(problems).length;
      if (count > 0) return { ok: false, error: `${count} score${count === 1 ? " is" : "s are"} incomplete, fix the marked items and post again.`, problems };
    }

    const now = new Date();
    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.upsert({
        where: { projectId_reviewerId_kind: { projectId, reviewerId: user.id, kind } },
        create: { projectId, reviewerId: user.id, kind, summaryNote, status: intent === "post" ? "SUBMITTED" : "DRAFT", submittedAt: intent === "post" ? now : null },
        update: { summaryNote, status: intent === "post" ? "SUBMITTED" : "DRAFT", submittedAt: intent === "post" ? now : null },
      });
      await tx.reviewScore.deleteMany({ where: { reviewId: r.id } });
      const rows = drafts.filter((d) => d.score !== null);
      if (rows.length > 0) {
        await tx.reviewScore.createMany({
          data: rows.map((d) => {
            const item = itemByKey.get(d.key)!;
            return {
              reviewId: r.id,
              dimensionId: item.dimensionId ?? null,
              roleCriterionId: item.roleCriterionId ?? null,
              judgingCriterionId: item.judgingCriterionId ?? null,
              score: d.score!,
              rationale: d.rationale,
              evidenceRefs: toJson(d.evidenceRefs),
            };
          }),
        });
      }
      return r;
    });

    if (intent === "post") {
      await audit({ actorId: user.id, action: "REVIEW_SUBMITTED", resourceType: "Review", resourceId: review.id, subjectUserId: project.ownerId, metadata: { projectId, kind } });
    }
    revalidateProject(projectId);
    return { ok: true };
  });
}

const zProject = z.object({ projectId: z.string().min(1).max(64) });

/** After posting, the reviewer may reveal the candidate's identity. Every reveal is audited. */
export async function revealIdentity(input: z.input<typeof zProject>): Promise<ActionResult> {
  return guard(async () => {
    const parsed = zProject.safeParse(input);
    if (!parsed.success) return { ok: false, error: NOT_FOUND };
    const { projectId } = parsed.data;
    const user = await getCurrentUser();
    await authorize(user, "identity.reveal", { projectId });
    const review = await prisma.review.findUnique({ where: { projectId_reviewerId_kind: { projectId, reviewerId: user!.id, kind: "RUBRIC" } } });
    if (review?.status !== "SUBMITTED") return { ok: false, error: "post your review first, then you can reveal who this is." };
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
    if (!project) return { ok: false, error: NOT_FOUND };
    if (!review.revealedAt) await prisma.review.update({ where: { id: review.id }, data: { revealedAt: new Date() } });
    await auditAccess(user, "IDENTITY_REVEAL", project.ownerId, { type: "Review", id: review.id, metadata: { projectId } });
    revalidateProject(projectId);
    return { ok: true };
  });
}

/** Calibration is for reviewers who have posted their own review, so the other scores can't anchor them. */
async function authorizeCalibration(projectId: string) {
  const user = await getCurrentUser();
  await authorize(user, "review.calibrate", { projectId });
  if (user!.role !== "ADMIN" && !(await check(user, "identity.reveal", { projectId }))) {
    throw new ForbiddenError("post your own review before calibrating, then come back.");
  }
  return user!;
}

const zNote = z.object({
  projectId: z.string().min(1).max(64),
  key: z.string().min(1).max(80),
  note: z.string().trim().min(1, "write a reconciliation note, then save.").max(4000),
  resolvedScore: z.number().int().min(1).max(4).nullable(),
});

export async function saveCalibrationNote(input: z.input<typeof zNote>): Promise<ActionResult> {
  return guard(async () => {
    const parsed = zNote.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "the note couldn't be read, try again." };
    const { projectId, key, note, resolvedScore } = parsed.data;
    const user = await authorizeCalibration(projectId);
    const project = await loadProject(projectId);
    if (!project) return { ok: false, error: NOT_FOUND };
    const keys = (await scoreItems(project, "RUBRIC")).map((i) => i.key);
    if (!keys.includes(key)) return { ok: false, error: "that score item isn't part of this review, reload the page." };
    await prisma.calibrationNote.upsert({
      where: { projectId_dimensionKey: { projectId, dimensionKey: key } },
      create: { projectId, dimensionKey: key, note, resolvedScore, authorId: user.id },
      update: { note, resolvedScore, authorId: user.id },
    });
    revalidateProject(projectId);
    return { ok: true };
  });
}

const zDecision = z.object({
  projectId: z.string().min(1).max(64),
  outcome: z.enum(DECISION_OUTCOMES),
  reason: z.string().trim().min(1, "write the reason for this decision, then save it.").max(4000),
});

/** A person decides: advance, hold or don't advance, always with a written reason. */
export async function makeDecision(input: z.input<typeof zDecision>): Promise<ActionResult> {
  return guard(async () => {
    const parsed = zDecision.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "the decision couldn't be read, try again." };
    const { projectId, outcome, reason } = parsed.data;
    const user = await getCurrentUser();
    await authorize(user, "review.decide", { projectId });
    const project = await loadProject(projectId);
    if (!project || !user) return { ok: false, error: NOT_FOUND };

    const items = await scoreItems(project, "RUBRIC");
    const { reviews, notes, flags } = await calibrationState(projectId, items.map((i) => i.key));
    const blocker = decisionBlocker(reviews.length, flags, notes.map((n) => n.dimensionKey));
    if (blocker) return { ok: false, error: blocker };

    const candidates = projectCandidates(project);
    const decision = await prisma.$transaction(async (tx) => {
      const d = await tx.decision.create({ data: { projectId, outcome, reason, decidedById: user.id } });
      if (outcome === "ADVANCE") {
        for (const e of project.hackathon.enrollments) {
          const shortlist = await tx.shortlist.upsert({ where: { roleId: e.roleId }, create: { roleId: e.roleId }, update: {} });
          for (const c of candidates) {
            const key = { shortlistId_candidateId: { shortlistId: shortlist.id, candidateId: c.id } };
            const existing = await tx.shortlistEntry.findUnique({ where: key, select: { status: true } });
            if (!existing) await tx.shortlistEntry.create({ data: { shortlistId: shortlist.id, candidateId: c.id, projectId, addedById: user.id } });
            else if (existing.status !== "HIRED") await tx.shortlistEntry.update({ where: key, data: { projectId, status: "ACTIVE" } });
          }
        }
      } else {
        // Hold or don't advance after an earlier advance: companies lose shortlist (and report) access.
        await tx.shortlistEntry.updateMany({ where: { projectId, status: "ACTIVE" }, data: { status: "WITHDRAWN" } });
      }
      return d;
    });

    await audit({ actorId: user.id, action: "DECISION_MADE", resourceType: "Decision", resourceId: decision.id, subjectUserId: project.ownerId, metadata: { projectId, outcome } });
    for (const c of candidates) {
      if (c.email) await sendEmail(c.email, "decisionMade", { name: c.name ?? "there", outcome: OUTCOME_LABEL[outcome] }, { projectId, decisionId: decision.id });
    }
    revalidateProject(projectId);
    revalidatePath("/company");
    revalidatePath("/dashboard");
    return { ok: true };
  });
}

const zFeedback = z.object({
  projectId: z.string().min(1).max(64),
  body: z.string().trim().min(1, "write the feedback, then send it.").max(8000),
});

/** Written feedback for finishers who weren't advanced. Shown on their dashboard from results time. */
export async function writeFeedback(input: z.input<typeof zFeedback>): Promise<ActionResult> {
  return guard(async () => {
    const parsed = zFeedback.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "the feedback couldn't be read, try again." };
    const { projectId, body } = parsed.data;
    const user = await getCurrentUser();
    await authorize(user, "feedback.write", { projectId });
    const project = await loadProject(projectId);
    if (!project || !user) return { ok: false, error: NOT_FOUND };
    const latest = await prisma.decision.findFirst({ where: { projectId }, orderBy: { decidedAt: "desc" }, select: { outcome: true } });
    const hired = !!(await prisma.shortlistEntry.findFirst({ where: { projectId, status: "HIRED" }, select: { id: true } }));
    const blocker = feedbackBlocker(latest?.outcome ?? null, hired);
    if (blocker) return { ok: false, error: blocker };

    const now = new Date();
    const resultsAt = project.hackathon.cohortConfig?.resultsAt;
    const visibleAt = resultsAt && resultsAt > now ? resultsAt : now;
    // Visible now: email at write time and mark it sent. Held: leave notifiedAt empty for the jobs runner (lib/jobs).
    const visibleNow = visibleAt <= now;
    const notifiedAt = visibleNow ? now : null;
    for (const c of projectCandidates(project)) {
      const existing = await prisma.feedback.findFirst({ where: { projectId, candidateId: c.id }, select: { id: true } });
      if (existing) await prisma.feedback.update({ where: { id: existing.id }, data: { body, authorId: user.id, visibleAt, notifiedAt } });
      else await prisma.feedback.create({ data: { projectId, candidateId: c.id, authorId: user.id, body, visibleAt, notifiedAt } });
      if (c.email && visibleNow) await sendEmail(c.email, "feedbackReady", { name: c.name ?? "there" }, { projectId });
    }
    revalidateProject(projectId);
    revalidatePath("/dashboard");
    return { ok: true };
  });
}
