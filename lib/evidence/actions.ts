"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { authorize, ForbiddenError } from "@/lib/permissions";
import { loadLocker } from "./queries";
import { isSummaryEnabled, requestSummary, SUMMARY_COOLDOWN_MS } from "./summary";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const lockerPath = (projectId: string) => `/projects/${projectId}/evidence`;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `keep this under ${max} characters, then save again.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const decisionSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().optional().transform((v) => v || undefined),
  title: z.string().trim().min(1, "add a title, then save the decision.").max(140, "keep the title under 140 characters, then save again."),
  decision: z.string().trim().min(1, "say what you decided, then save the decision.").max(4000, "keep the decision under 4000 characters, then save again."),
  reasoning: z.string().trim().min(1, "say why you decided it, then save the decision.").max(4000, "keep the reasoning under 4000 characters, then save again."),
  alternatives: optionalText(4000),
  aiInvolved: z.literal("on").optional(),
  aiNote: optionalText(2000),
});

export type DecisionFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | null;

/** Creates or edits one decision log entry. Project members only (evidence.edit). */
export async function saveDecision(_prev: DecisionFormState, formData: FormData): Promise<DecisionFormState> {
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "the decision was not saved, fix the fields marked below.", fieldErrors };
  }
  const { projectId, id, aiInvolved, ...fields } = parsed.data;
  try {
    await authorize(await getCurrentUser(), "evidence.edit", { projectId });
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
  const data = { ...fields, aiInvolved: !!aiInvolved, aiNote: aiInvolved ? fields.aiNote : null };
  if (id) {
    const { count } = await prisma.decisionLogEntry.updateMany({ where: { id, projectId }, data });
    if (count === 0) return { ok: false, error: "that decision no longer exists, reload the page and try again." };
  } else {
    await prisma.decisionLogEntry.create({ data: { projectId, ...data } });
  }
  revalidatePath(lockerPath(projectId));
  return { ok: true };
}

/** Prepares a new evidence summary when an API key is set. Anyone who can view the evidence may ask; one per 10 minutes. */
export async function refreshSummary(projectId: string): Promise<ActionResult> {
  if (typeof projectId !== "string" || !projectId) return { ok: false, error: "that project was not found, reload the page." };
  try {
    await authorize(await getCurrentUser(), "evidence.view", { projectId });
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
  if (!isSummaryEnabled()) return { ok: false, error: "summaries are off on this server, read the prepared summary instead." };

  const last = await prisma.evidenceSummary.findFirst({ where: { projectId, seeded: false }, orderBy: { generatedAt: "desc" } });
  if (last && Date.now() - last.generatedAt.getTime() < SUMMARY_COOLDOWN_MS) {
    return { ok: false, error: "a summary was prepared in the last 10 minutes, read that one or try again later." };
  }
  const locker = await loadLocker(projectId);
  if (!locker) return { ok: false, error: "that project was not found, reload the page." };

  try {
    const { content, model } = await requestSummary(locker);
    await prisma.evidenceSummary.create({ data: { projectId, content, model, seeded: false } });
  } catch {
    return { ok: false, error: "the summary could not be prepared, read the evidence below or try again later." };
  }
  revalidatePath(lockerPath(projectId));
  return { ok: true };
}
