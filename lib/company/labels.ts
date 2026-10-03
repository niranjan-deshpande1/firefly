// Display labels for company surfaces. Pure, unit tested.

export const LEVEL_LABEL: Record<string, string> = {
  STUDENT: "in school",
  NEW_GRAD: "new grad",
  JUNIOR: "junior",
  MID: "mid-level",
  SENIOR: "senior",
};

export const REMOTE_LABEL: Record<string, string> = {
  ONSITE: "onsite",
  HYBRID: "hybrid",
  REMOTE: "remote",
};

export const ROLE_STATUS_LABEL: Record<string, string> = {
  OPEN: "open",
  PAUSED: "paused",
  FILLED: "filled",
  CLOSED: "closed",
};

export const SECTION_LABEL: Record<string, string> = {
  WALKTHROUGH: "walkthrough",
  WHAT_BREAKS_IF: "what breaks if",
  LIVE_CHANGE: "live change",
  PLANTED_BUG: "planted bug",
  PRODUCT: "product questions",
};

/** DESIGN.md D4: REJECT is shown as "don't advance". */
export const OUTCOME_LABEL: Record<string, string> = {
  ADVANCE: "advance",
  HOLD: "hold",
  REJECT: "don't advance",
};

export type InterviewFact = { status: string; outcome: string | null; scheduledAt: Date } | null;

/** One plain status line for a shortlisted candidate's defense interview. */
export function interviewStatusLabel(interview: InterviewFact): string {
  if (!interview) return "no interview yet";
  if (interview.status === "COMPLETED") {
    if (interview.outcome === "PASS") return "defense passed";
    if (interview.outcome === "FAIL") return "defense not passed";
    return "defense completed";
  }
  if (interview.status === "CANCELLED") return "interview cancelled";
  if (interview.status === "IN_PROGRESS") return "interview in progress";
  return "interview scheduled";
}

/** "$120,000 to $150,000", one side, or "not set". Format function is injected to keep this pure. */
export function salaryRangeLabel(min: number | null, max: number | null, format: (cents: number) => string): string {
  if (min !== null && max !== null) return `${format(min)} to ${format(max)}`;
  if (min !== null) return `from ${format(min)}`;
  if (max !== null) return `up to ${format(max)}`;
  return "not set";
}
