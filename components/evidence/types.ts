import type { AITranscript, CheckIn, Commit, DecisionLogEntry, EvidenceSummary } from "@prisma/client";
import type { EvidenceRef } from "@/lib/db/json";

export type CommitItem = Pick<Commit, "id" | "sha" | "message" | "authorName" | "committedAt" | "additions" | "deletions" | "url">;
export type TranscriptItem = Pick<AITranscript, "id" | "title" | "tool" | "content" | "uploadedAt">;
export type DecisionItem = Pick<DecisionLogEntry, "id" | "title" | "decision" | "reasoning" | "alternatives" | "aiInvolved" | "aiNote" | "decidedAt">;
export type CheckInItem = Pick<CheckIn, "id" | "week" | "progress" | "blockers" | "nextSteps" | "aiUsage" | "hoursSpent" | "submittedAt">;
export type SummaryItem = Pick<EvidenceSummary, "content" | "model" | "seeded" | "generatedAt">;

/** Stable anchor so an EvidenceLink can deep-link into the locker. */
export function evidenceAnchor(ref: Pick<EvidenceRef, "kind" | "id">) {
  return `evidence-${ref.kind.toLowerCase()}-${ref.id}`;
}
