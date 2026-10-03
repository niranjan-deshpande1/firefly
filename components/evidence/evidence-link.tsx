import NextLink from "next/link";
import type { EvidenceRef } from "@/lib/db/json";
import { evidenceAnchor } from "./types";

const KIND_LABEL: Record<EvidenceRef["kind"], string> = {
  COMMIT: "commit",
  TRANSCRIPT: "transcript",
  DECISION: "decision",
  CHECKIN: "check-in",
  INTERVIEW_NOTE: "interview note",
};

/** Evidence chip that deep-links into the project's evidence locker. */
export function EvidenceLink({ evidence, projectId }: { evidence: EvidenceRef; projectId: string }) {
  const href = evidence.kind === "INTERVIEW_NOTE" ? `#${evidenceAnchor(evidence)}` : `/projects/${projectId}/evidence#${evidenceAnchor(evidence)}`;
  return (
    <NextLink href={href} className="chip chip-flat" title={evidence.excerpt}>
      {evidence.label.toLowerCase().startsWith(KIND_LABEL[evidence.kind]) ? null : <span className="text-secondary">{KIND_LABEL[evidence.kind]}</span>}
      <span>{evidence.label}</span>
    </NextLink>
  );
}
