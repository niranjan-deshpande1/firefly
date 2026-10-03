// Pure interview rules, unit tested in tests/unit/interviews. No database access here.
import { INTERVIEW_SECTIONS, type InterviewSection } from "@/lib/db/enums";

type Model = "WE_RUN" | "JOINT" | "COMPANY_RUN";

/**
 * Checks the chosen interviewers against the model: reviewers for WE_RUN, company members
 * of the role's company for COMPANY_RUN, at least one of each for JOINT.
 * Returns an error sentence, or null when the panel is valid.
 */
export function interviewerError(model: Model, chosen: string[], reviewerIds: Set<string>, companyMemberIds: Set<string>): string | null {
  if (chosen.length === 0) return "no interviewers were chosen, pick at least one.";
  const reviewers = chosen.filter((id) => reviewerIds.has(id));
  const members = chosen.filter((id) => companyMemberIds.has(id));
  const outsiders = chosen.filter((id) => !reviewerIds.has(id) && !companyMemberIds.has(id));
  if (outsiders.length > 0) return "one interviewer is not eligible for this interview, pick from the list.";
  if (model === "WE_RUN" && members.length > 0 && reviewers.length < chosen.length)
    return "we run it uses reviewers only, remove the company members.";
  if (model === "COMPANY_RUN" && (members.length === 0 || members.length < chosen.length))
    return "company runs it uses the role's company members only, pick from that company.";
  if (model === "JOINT" && (reviewers.length === 0 || members.length === 0))
    return "joint needs at least one reviewer and one company member, add the missing side.";
  return null;
}

/** Sections that still have no score from any interviewer. */
export function missingSections(scored: { section: string }[]): InterviewSection[] {
  const done = new Set(scored.map((s) => s.section));
  return INTERVIEW_SECTIONS.filter((s) => !done.has(s));
}

/**
 * Server-enforced completion gate: an identity check, a score for every section,
 * and an interview that is not already closed. Returns an error sentence or null.
 */
export function completionError(interview: { status: string; identityCheckedAt: Date | null }, scored: { section: string }[]): string | null {
  if (interview.status === "COMPLETED" || interview.status === "CANCELLED") return "this interview is already closed, return to your interviews.";
  if (!interview.identityCheckedAt) return "the identity check is not done, confirm the photo ID first.";
  const missing = missingSections(scored);
  if (missing.length > 0) return `${missing.length} section${missing.length === 1 ? " has" : "s have"} no score yet, score every section first.`;
  return null;
}

/** Scoring is locked until the identity check is done and while the interview is open. */
export function scoringError(interview: { status: string; identityCheckedAt: Date | null }): string | null {
  if (interview.status === "COMPLETED" || interview.status === "CANCELLED") return "this interview is closed, scores can no longer change.";
  if (!interview.identityCheckedAt) return "the script is locked until the identity check is done, confirm the photo ID first.";
  return null;
}

/** Elapsed time as mm:ss text (minutes keep counting past 59). */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone.includes("/") || zone === "UTC";
  } catch {
    return false;
  }
}

/** Offset of the zone from UTC at that instant, in ms. */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(instant))
      .map((x) => [x.type, Number(x.value)]),
  );
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** "2026-10-14T10:00" wall time in an IANA zone to the UTC instant. Null on bad input. */
export function zonedTimeToUtc(local: string, timeZone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m || !isValidTimeZone(timeZone)) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const first = wall - zoneOffsetMs(wall, timeZone);
  const second = wall - zoneOffsetMs(first, timeZone); // corrects across a DST change
  return new Date(second);
}
