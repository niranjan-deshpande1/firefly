// Pure participation rules: no database access, so every rule is unit tested.
import { z } from "zod";
import { formatDate } from "@/lib/format/date";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

type Timeline = {
  type: string;
  status: string;
  registrationOpensAt: Date;
  startsAt: Date;
  submissionDeadline: Date;
  endsAt: Date;
  /** The hackathon's IANA zone; dates in sentences render in it. */
  timeZone?: string;
};

type CohortDates = { defenseWindowStart: Date; defenseWindowEnd: Date; resultsAt: Date } | null;

// ---------- calendar as text (manual 12.2: facts, never a meter) ----------

/** "day 9 of 14" while the build runs, otherwise null. Day 1 is the start day. */
export function buildDay(startsAt: Date, deadline: Date, now: Date): { day: number; total: number } | null {
  if (now < startsAt || now > deadline) return null;
  const total = Math.max(1, Math.ceil((deadline.getTime() - startsAt.getTime()) / DAY_MS));
  const day = Math.min(total, Math.floor((now.getTime() - startsAt.getTime()) / DAY_MS) + 1);
  return { day, total };
}

/** True once results are out: the hackathon is completed or the cohort results time has passed. */
export function resultsOut(h: Pick<Timeline, "status">, cohort: CohortDates, now: Date): boolean {
  return h.status === "COMPLETED" || (!!cohort && now >= cohort.resultsAt);
}

/** The name of the beat the hackathon is on, as plain text. */
export function currentBeat(h: Timeline, cohort: CohortDates, now: Date): string {
  if (resultsOut(h, cohort, now)) return "results are out";
  if (now < h.startsAt) return `kickoff on ${formatDate(h.startsAt, h.timeZone)}`;
  if (now <= h.submissionDeadline) return "building";
  if (!cohort) return h.status === "JUDGING" || now <= h.endsAt ? "judging" : "wrapping up";
  if (now < cohort.defenseWindowStart) return "reviews";
  if (now <= cohort.defenseWindowEnd) return "defense interviews";
  return `results on ${formatDate(cohort.resultsAt, h.timeZone)}`;
}

/** One line for the dashboard: "day 9 of 14, building" or just the beat. */
export function cohortStateLine(h: Timeline, cohort: CohortDates, now: Date): string {
  const beat = currentBeat(h, cohort, now);
  const day = buildDay(h.startsAt, h.submissionDeadline, now);
  return day ? `day ${day.day} of ${day.total}, ${beat}` : beat;
}

// ---------- check-in weeks ----------

export type CheckInSlot = { week: number; dueAt: Date; prompt: string };
export type CheckInSlotState = "posted" | "open" | "upcoming" | "not posted";

/**
 * The cohort's check-in weeks. Uses CohortConfig.checkInSchedule when the organizer set one,
 * otherwise one week per 7 days of the build, due at the end of each week.
 */
export function checkInSlots(rawSchedule: unknown, startsAt: Date, deadline: Date): CheckInSlot[] {
  const parsed = z
    .array(z.object({ week: z.number().int().min(1), dueAt: z.string(), prompt: z.string().default("") }))
    .safeParse(rawSchedule);
  if (parsed.success && parsed.data.length > 0) {
    return parsed.data
      .map((s) => ({ week: s.week, dueAt: new Date(s.dueAt), prompt: s.prompt }))
      .filter((s) => !Number.isNaN(s.dueAt.getTime()))
      .sort((a, b) => a.week - b.week);
  }
  const weeks = Math.max(1, Math.ceil((deadline.getTime() - startsAt.getTime()) / WEEK_MS));
  return Array.from({ length: weeks }, (_, i) => ({
    week: i + 1,
    dueAt: new Date(Math.min(startsAt.getTime() + (i + 1) * WEEK_MS, deadline.getTime())),
    prompt: "",
  }));
}

/** A week opens 7 days before it is due. */
export function slotOpensAt(slot: CheckInSlot): Date {
  return new Date(slot.dueAt.getTime() - WEEK_MS);
}

/** A week stays open from slotOpensAt until it is due. */
export function slotState(slot: CheckInSlot, postedWeeks: ReadonlySet<number>, now: Date): CheckInSlotState {
  if (postedWeeks.has(slot.week)) return "posted";
  if (now > slot.dueAt) return "not posted";
  if (now >= slotOpensAt(slot)) return "open";
  return "upcoming";
}

/** The week a builder can post right now, if any. */
export function openSlot(slots: CheckInSlot[], postedWeeks: ReadonlySet<number>, now: Date): CheckInSlot | null {
  return slots.find((s) => slotState(s, postedWeeks, now) === "open") ?? null;
}

// ---------- registration ----------

/** One-sentence reason registration is closed, or null when it is open. */
export function registrationBlock(h: Timeline, now: Date): string | null {
  if (h.status === "COMPLETED") return "this hackathon has ended, browse the open hackathons instead.";
  if (h.status === "DRAFT") return "this hackathon isn't published yet, browse the open hackathons instead.";
  if (h.status === "JUDGING" || h.status === "DEFENSE" || now > h.submissionDeadline) {
    return `registration closed on ${formatDate(h.submissionDeadline, h.timeZone)}, browse the open hackathons instead.`;
  }
  if (now < h.registrationOpensAt) return `registration opens on ${formatDate(h.registrationOpensAt, h.timeZone)}, come back then.`;
  return null;
}

/**
 * Splits the eligibility Markdown into the statements a builder confirms, one checkbox each.
 * Top-level list items become statements; with no list, the whole text is one statement.
 */
export function eligibilityItems(markdown: string): string[] {
  const items = markdown
    .split("\n")
    .map((line) => line.match(/^\s{0,1}(?:[-*+]|\d+[.)])\s+(.+)$/)?.[1]?.trim())
    .filter((s): s is string => !!s);
  if (items.length > 0) return items;
  const text = markdown.trim();
  return text ? [text] : [];
}

// ---------- teams ----------

/** Teams only for open hackathons whose policy allows them; hiring cohorts are solo. */
export function teamsAllowed(h: { type: string; teamPolicy: string; maxTeamSize: number }): boolean {
  return h.type === "OPEN" && h.teamPolicy === "TEAMS_ALLOWED" && h.maxTeamSize > 1;
}

/** Pending invites hold a seat, so a team can never be over-invited past its size. */
export function teamHasRoom(members: number, pendingInvites: number, maxTeamSize: number): boolean {
  return members + pendingInvites < maxTeamSize;
}

// ---------- input schemas ----------

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const zCheckIn = z.object({
  hackathonId: z.string().min(1).max(64),
  week: z.coerce.number().int().min(1).max(52),
  progress: z.string().trim().min(1).max(5000),
  blockers: optionalText(2000),
  nextSteps: optionalText(2000),
  aiUsage: optionalText(2000),
  hoursSpent: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(168)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

export const zTeamCreate = z.object({
  hackathonId: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(60),
  description: optionalText(500),
});

export const zInvite = z.object({
  teamId: z.string().min(1).max(64),
  username: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, "").toLowerCase())
    .pipe(z.string().min(1).max(40)),
});

export const zInviteResponse = z.object({
  inviteId: z.string().min(1).max(64),
  response: z.enum(["ACCEPTED", "DECLINED"]),
});

export const zLookingForTeam = z.object({
  hackathonId: z.string().min(1).max(64),
  looking: z.enum(["true", "false"]).transform((v) => v === "true"),
  note: optionalText(280),
});

const FIELD_ERRORS: Record<string, string> = {
  progress: "write what you made this week, then post the check-in.",
  hoursSpent: "hours must be a whole number from 0 to 168, fix it and post again.",
  name: "name your team in 60 characters or fewer, then create it.",
  username: "type a username, then send the invite.",
  note: "keep the note under 280 characters, then save it.",
};

export type FieldError = { field: string; message: string };

/** The first invalid field and its one error sentence, so the UI can show it beside its cause. */
export function firstIssue(error: z.ZodError, fallback = "that didn't go through, check the form and try again."): FieldError {
  const field = String(error.issues[0]?.path[0] ?? "");
  return { field, message: FIELD_ERRORS[field] ?? fallback };
}
