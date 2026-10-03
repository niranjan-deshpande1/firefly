// Readable lowercase labels for log rows. Pure, unit tested.

const ACTION_LABELS: Record<string, string> = {
  REPORT_VIEW: "candidate report viewed",
  EVIDENCE_VIEW: "evidence locker viewed",
  TRANSCRIPT_VIEW: "transcript viewed",
  IDENTITY_REVEAL: "blind identity revealed",
  DECISION_MADE: "decision made",
  REVIEW_SUBMITTED: "review posted",
  INTERVIEW_COMPLETED: "interview completed",
  HIRE_REPORTED: "hire reported",
  INVOICE_CREATED: "invoice created",
  INVOICE_SENT: "invoice sent",
  INVOICE_PAID: "invoice paid",
  ENROLLMENT_CREATED: "cohort enrollment",
  DATA_EXPORT: "data exported",
  DATA_REQUEST_CREATED: "data request opened",
  DATA_REQUEST_RESOLVED: "data request resolved",
  SETTINGS_CHANGED: "settings changed",
  COMMENT_HIDDEN: "comment hidden",
  COMMENT_UNHIDDEN: "comment shown again",
  HACKATHON_CREATED: "hackathon created",
  HACKATHON_UPDATED: "hackathon edited",
  HACKATHON_STATUS_CHANGED: "hackathon status changed",
  COHORT_CONFIG_CHANGED: "cohort settings changed",
  HACKATHON_ITEM_SAVED: "prize, schedule, criterion or resource saved",
  HACKATHON_ITEM_REMOVED: "prize, schedule, criterion or resource removed",
  UPDATE_POSTED: "update posted",
  JUDGE_ASSIGNED: "judge assigned",
  JUDGE_REMOVED: "judge removed",
  REVIEWER_ASSIGNED: "reviewer assigned",
  REVIEWER_REMOVED: "reviewer removed",
  WINNER_AWARDED: "winner awarded",
  WINNER_REMOVED: "award removed",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.toLowerCase().replace(/_/g, " ");
}

function valueText(v: unknown): string {
  if (v === null || v === undefined) return "none";
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, inner]) => `${k} ${typeof inner === "object" ? "…" : String(inner)}`)
      .join(", ");
  }
  return String(v);
}

/** One line from an audit row's metadata, for example "kind DELETE, status COMPLETED". */
export function describeMetadata(meta: Record<string, unknown>): string {
  return Object.entries(meta)
    .map(([k, v]) => (typeof v === "object" && v !== null ? `${k}: ${valueText(v)}` : `${k} ${valueText(v)}`))
    .join("; ");
}
