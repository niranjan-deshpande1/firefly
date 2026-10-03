// Pure review rules. No database access, so every rule is unit tested (tests/unit/review).
import type { EvidenceRef } from "@/lib/db/json";

/** One thing a reviewer scores: a rubric dimension ("A"), a role criterion ("criterion:<id>") or a judging criterion ("judging:<id>"). */
export type ScoreItem = { key: string; name: string };

export type ScoreDraft = { key: string; score: number | null; rationale: string; evidenceRefs: EvidenceRef[] };

export type ScoreProblems = Record<string, string>;

/**
 * Problems that stop a review from being posted, keyed by item.
 * Every item needs a score and a written rationale; rubric reviews also need at least one evidence reference.
 */
export function postingProblems(items: ScoreItem[], drafts: ScoreDraft[], requireEvidence: boolean): ScoreProblems {
  const byKey = new Map(drafts.map((d) => [d.key, d]));
  const problems: ScoreProblems = {};
  for (const item of items) {
    const d = byKey.get(item.key);
    if (!d || d.score === null) problems[item.key] = "pick a level, then add a rationale.";
    else if (!d.rationale.trim()) problems[item.key] = "write a rationale for this score.";
    else if (requireEvidence && d.evidenceRefs.length === 0) problems[item.key] = "link at least one piece of evidence.";
  }
  return problems;
}

/** Item keys where the submitted reviews disagree by 2 levels or more. Never totals or averages scores. */
export function calibrationFlags(itemKeys: string[], reviews: Record<string, number>[]): string[] {
  if (reviews.length < 2) return [];
  return itemKeys.filter((key) => {
    const levels = reviews.map((r) => r[key]).filter((v): v is number => typeof v === "number");
    return levels.length >= 2 && Math.max(...levels) - Math.min(...levels) >= 2;
  });
}

export const REQUIRED_REVIEWS = 2;

/** Why a decision can't be made yet, or null when it can. */
export function decisionBlocker(submittedReviews: number, flags: string[], notedKeys: string[]): string | null {
  if (submittedReviews < REQUIRED_REVIEWS) {
    return `a decision needs ${REQUIRED_REVIEWS} posted reviews and this project has ${submittedReviews}, wait for the second reviewer.`;
  }
  const open = flags.filter((k) => !notedKeys.includes(k));
  if (open.length > 0) return `${open.length} flagged score gap${open.length === 1 ? "" : "s"} still need a reconciliation note, add them first.`;
  return null;
}

/** Written feedback goes to every finisher who wasn't hired (brief 4.2), advanced or not. */
export function feedbackBlocker(latestOutcome: string | null, hired = false): string | null {
  if (!latestOutcome) return "record a decision before writing feedback.";
  if (hired) return "this candidate was hired, feedback is for finishers who weren't.";
  return null;
}

export const OUTCOME_LABEL: Record<string, string> = { ADVANCE: "advance", HOLD: "hold", REJECT: "don't advance" };
