// The details passage: one decision per step, in order.

export type StepKey =
  | "basics"
  | "dates"
  | "rules"
  | "format"
  | "cover"
  | "brief"
  | "defense"
  | "check-ins"
  | "office-hours"
  | "status";

export type Step = { key: StepKey; label: string; title: string; description: string; cohortOnly?: boolean };

export const STEPS: Step[] = [
  { key: "basics", label: "basics", title: "name and describe it", description: "the title, address, type and the description builders read first." },
  { key: "dates", label: "dates", title: "set the dates", description: "choose the zone you think in. every time is stored in UTC and shown with its zone." },
  { key: "rules", label: "rules", title: "write the rules", description: "what is allowed, what must be disclosed, and who can take part." },
  { key: "format", label: "format", title: "choose the format", description: "where it happens, whether teams are allowed, and the themes." },
  { key: "cover", label: "cover", title: "add a cover image", description: "a PNG, JPEG, GIF or WebP image up to 5 MB." },
  { key: "brief", label: "cohort prompt", title: "write the cohort prompt", description: "the brief every builder in the cohort works from.", cohortOnly: true },
  { key: "defense", label: "defense and results", title: "set the defense window", description: "when defense interviews run and when results go out.", cohortOnly: true },
  { key: "check-ins", label: "check-ins", title: "plan the weekly check-ins", description: "one written check-in per week, with its due time and prompt.", cohortOnly: true },
  { key: "office-hours", label: "office hours", title: "add office hours", description: "times builders can drop in with questions.", cohortOnly: true },
  { key: "status", label: "status", title: "set the status", description: "drafts are visible to you only. every other status is public." },
];

export function stepsFor(type: string): Step[] {
  return STEPS.filter((s) => !s.cohortOnly || type === "HIRING_COHORT");
}
