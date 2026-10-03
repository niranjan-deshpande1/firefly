// Organizer input schemas. Pure (no database), so every rule here is unit tested.
import { z } from "zod";
import {
  EVENT_FORMATS,
  HACKATHON_STATUSES,
  HACKATHON_TYPES,
  SCHEDULE_KINDS,
  TEAM_POLICIES,
} from "@/lib/db/enums";
import { isValidTimeZone, zonedLocalToUtc } from "./time";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_TEAM_SIZE = 6;
export const REVIEWERS_PER_PROJECT = 2;

/** "The Spring Build 2026" -> "the-spring-build-2026". Used to suggest a slug. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Maps Zod issues to one sentence per field, for errors shown beside each control. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function invalid(error: z.ZodError): ActionResult<never> {
  return { ok: false, error: "some fields need a fix, see the notes beside them.", fieldErrors: fieldErrorsOf(error) };
}

/** FormData -> plain object (last value wins; files kept as File). */
export function formObject(form: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(form.entries());
}

const text = (max: number, label: string) =>
  z.string().trim().min(1, `add a ${label}, it can't be empty.`).max(max, `the ${label} is over ${max} characters, shorten it.`);
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `the ${label} is over ${max} characters, shorten it.`)
    .optional()
    .transform((v) => (v ? v : null));
const markdown = (label: string) => z.string().trim().max(20000, `the ${label} is over 20000 characters, shorten it.`);
const id = z.string().trim().min(1).max(64);
const httpUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `the ${label} is too long, use a shorter link.`)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === "https:" || u.protocol === "http:";
      } catch {
        return false;
      }
    }, `that ${label} is not a web address, paste one that starts with https://.`);
const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(httpUrl(label).optional())
    .transform((v) => v ?? null);
const int = (min: number, max: number, label: string) =>
  z.coerce
    .number({ error: `enter the ${label} as a number.` })
    .int(`enter the ${label} as a whole number.`)
    .min(min, `the ${label} must be at least ${min}.`)
    .max(max, `the ${label} must be at most ${max}.`);

export const zTimeZone = z
  .string()
  .refine(isValidTimeZone, "that timezone does not match an IANA zone, choose one from the list.");
const zLocal = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, `choose a date and time for ${label}.`);
const zOptionalLocal = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(zLocal(label).optional());

/** Converts the named local fields to UTC Dates, reporting impossible dates against their field. */
function toUtc<K extends string>(v: Partial<Record<K, string>> & { timeZone: string }, keys: K[], ctx: z.RefinementCtx) {
  const out = {} as Record<K, Date | null>;
  for (const key of keys) {
    const raw = v[key];
    if (!raw) {
      out[key] = null;
      continue;
    }
    const d = zonedLocalToUtc(raw, v.timeZone);
    if (!d) ctx.addIssue({ code: "custom", path: [key], message: "that date does not exist, choose another." });
    out[key] = d;
  }
  return out;
}

function order(ctx: z.RefinementCtx, earlier: Date | null, later: Date | null, path: string, message: string, strict = true) {
  if (!earlier || !later) return;
  if (strict ? later <= earlier : later < earlier) ctx.addIssue({ code: "custom", path: [path], message });
}

// ---------- hackathon ----------

export const zSlug = z
  .string()
  .trim()
  .min(3, "the slug needs at least 3 characters, add a word.")
  .max(60, "the slug is over 60 characters, shorten it.")
  .regex(SLUG_RE, "use lowercase letters, digits and single hyphens in the slug, like spring-build-2026.");

export const basicsSchema = z.object({
  title: text(120, "title"),
  slug: zSlug,
  type: z.enum(HACKATHON_TYPES, "choose open hackathon or hiring cohort."),
  tagline: text(200, "tagline"),
  description: markdown("description"),
});
export type BasicsInput = z.infer<typeof basicsSchema>;

export const statusSchema = z.object({ status: z.enum(HACKATHON_STATUSES, "choose a status from the list.") });

export const datesSchema = z
  .object({
    timeZone: zTimeZone,
    registrationOpensAt: zLocal("registration opens"),
    startsAt: zLocal("the start"),
    submissionDeadline: zLocal("the project deadline"),
    endsAt: zLocal("the end"),
  })
  .transform((v, ctx) => {
    const d = toUtc(v, ["registrationOpensAt", "startsAt", "submissionDeadline", "endsAt"], ctx);
    order(ctx, d.registrationOpensAt, d.startsAt, "startsAt", "the start comes before registration opens, move it later.", false);
    order(ctx, d.startsAt, d.submissionDeadline, "submissionDeadline", "the project deadline must come after the start, move it later.");
    order(ctx, d.submissionDeadline, d.endsAt, "endsAt", "the end comes before the project deadline, move it later.", false);
    return d as Record<keyof typeof d, Date>;
  });

export const rulesSchema = z.object({ rules: markdown("rules"), eligibility: markdown("eligibility") });

export const formatSchema = z
  .object({
    format: z.enum(EVENT_FORMATS, "choose online, in person or hybrid."),
    location: optionalText(200, "location"),
    teamPolicy: z.enum(TEAM_POLICIES, "choose solo or teams allowed."),
    maxTeamSize: int(1, MAX_TEAM_SIZE, "max team size"),
    themes: z
      .string()
      .max(600)
      .optional()
      .transform((v) => parseThemes(v ?? "")),
  })
  .superRefine((v, ctx) => {
    if (v.format !== "ONLINE" && !v.location) {
      ctx.addIssue({ code: "custom", path: ["location"], message: "add a location for an in person or hybrid event." });
    }
    if (v.teamPolicy === "TEAMS_ALLOWED" && v.maxTeamSize < 2) {
      ctx.addIssue({ code: "custom", path: ["maxTeamSize"], message: "teams need room for at least 2 people, raise the max team size." });
    }
    if (v.themes.length > 10) ctx.addIssue({ code: "custom", path: ["themes"], message: "list at most 10 themes, remove a few." });
  });
export type FormatInput = z.infer<typeof formatSchema>;

/** Comma or newline separated themes, trimmed, deduplicated, each at most 40 characters. */
export function parseThemes(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(/[,\n]/)) {
    const t = part.trim().slice(0, 40);
    if (t) seen.add(t);
  }
  return [...seen];
}

/** Hiring cohorts are always solo; solo events have a team size of 1. */
export function applyTeamPolicy(type: string, input: Pick<FormatInput, "teamPolicy" | "maxTeamSize">) {
  if (type === "HIRING_COHORT" || input.teamPolicy === "SOLO") return { teamPolicy: "SOLO" as const, maxTeamSize: 1 };
  return { teamPolicy: input.teamPolicy, maxTeamSize: input.maxTeamSize };
}

// ---------- cohort config ----------

export const cohortBriefSchema = z.object({
  prompt: markdown("prompt").min(1, "add the prompt builders will work from."),
  suggestedHours: int(1, 80, "suggested hours"),
});

export const cohortDatesSchema = z
  .object({
    timeZone: zTimeZone,
    defenseWindowStart: zLocal("the defense window start"),
    defenseWindowEnd: zLocal("the defense window end"),
    resultsAt: zLocal("results"),
  })
  .transform((v, ctx) => {
    const d = toUtc(v, ["defenseWindowStart", "defenseWindowEnd", "resultsAt"], ctx);
    order(ctx, d.defenseWindowStart, d.defenseWindowEnd, "defenseWindowEnd", "the defense window must end after it starts, move the end later.");
    order(ctx, d.defenseWindowEnd, d.resultsAt, "resultsAt", "results come before the defense window ends, move results later.", false);
    return d as Record<keyof typeof d, Date>;
  });

export type CheckInSlot = { week: number; dueAt: string; prompt: string };
export type OfficeHour = { startsAt: string; endsAt: string; link?: string };

export const checkInSlotSchema = z
  .object({
    timeZone: zTimeZone,
    week: int(1, 12, "week"),
    dueAt: zLocal("the due time"),
    prompt: text(500, "check-in prompt"),
  })
  .transform((v, ctx) => {
    const d = toUtc(v, ["dueAt"], ctx);
    return { week: v.week, dueAt: d.dueAt?.toISOString() ?? "", prompt: v.prompt } satisfies CheckInSlot;
  });

export const officeHourSchema = z
  .object({
    timeZone: zTimeZone,
    startsAt: zLocal("the start"),
    endsAt: zLocal("the end"),
    link: optionalUrl("link"),
  })
  .transform((v, ctx) => {
    const d = toUtc(v, ["startsAt", "endsAt"], ctx);
    order(ctx, d.startsAt, d.endsAt, "endsAt", "office hours must end after they start, move the end later.");
    const slot: OfficeHour = { startsAt: d.startsAt?.toISOString() ?? "", endsAt: d.endsAt?.toISOString() ?? "" };
    return v.link ? { ...slot, link: v.link } : slot;
  });

/** Keeps check-ins ordered by week and replaces an existing slot for the same week. */
export function upsertCheckIn(list: CheckInSlot[], slot: CheckInSlot): CheckInSlot[] {
  return [...list.filter((s) => s.week !== slot.week), slot].sort((a, b) => a.week - b.week);
}

export function addOfficeHour(list: OfficeHour[], slot: OfficeHour): OfficeHour[] {
  return [...list, slot].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

// ---------- prizes, schedule, criteria, resources ----------

export const prizeSchema = z.object({
  id: id.optional(),
  name: text(120, "prize name"),
  description: optionalText(1000, "description"),
  value: z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const cents = dollarsToCents(v);
      if (cents === null) {
        ctx.addIssue({ code: "custom", message: "enter the value in dollars, like 500 or 500.00." });
        return z.NEVER;
      }
      return cents;
    }),
  quantity: int(1, 20, "quantity"),
  sortOrder: int(0, 999, "order"),
});

/** "1,500.50" -> 150050. Null for anything that is not a non-negative dollar amount. */
export function dollarsToCents(raw: string): number | null {
  const clean = raw.replace(/[$,\s]/g, "");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, frac = ""] = clean.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

export const scheduleItemSchema = z
  .object({
    id: id.optional(),
    timeZone: zTimeZone,
    kind: z.enum(SCHEDULE_KINDS, "choose a kind from the list."),
    title: text(120, "title"),
    description: optionalText(1000, "description"),
    startsAt: zLocal("the start"),
    endsAt: zOptionalLocal("the end"),
    link: optionalUrl("link"),
  })
  .transform((v, ctx) => {
    const d = toUtc(v, ["startsAt", "endsAt"], ctx);
    order(ctx, d.startsAt, d.endsAt, "endsAt", "the end comes before the start, move it later.");
    return { id: v.id, kind: v.kind, title: v.title, description: v.description, link: v.link, startsAt: d.startsAt as Date, endsAt: d.endsAt };
  });

export const criterionSchema = z.object({
  id: id.optional(),
  name: text(120, "criterion name"),
  description: text(1000, "description"),
  weight: int(1, 10, "weight"),
  sortOrder: int(0, 999, "order"),
});

export const resourceSchema = z.object({
  id: id.optional(),
  title: text(120, "title"),
  url: httpUrl("link"),
  description: optionalText(1000, "description"),
});

export const updateSchema = z.object({
  title: text(120, "title"),
  body: markdown("message").min(1, "write the message registrants will get."),
});

// ---------- assignments and winners ----------

export const reviewerAssignmentSchema = z.object({ projectId: id, reviewerId: z.string().min(1, "choose a reviewer.").max(64) });
export const judgeAssignmentSchema = z.object({
  judgeId: z.string().min(1, "choose a judge.").max(64),
  projectId: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v ? v : null)),
});
export const winnerSchema = z.object({ prizeId: id, projectId: z.string().min(1, "choose a project.").max(64) });

export const ASSIGNABLE_ROLES = ["REVIEWER", "ADMIN"] as const;
export const isAssignableRole = (role: string) => (ASSIGNABLE_ROLES as readonly string[]).includes(role);

/** Why a reviewer can't take this project, or null when they can. */
export function reviewerBlocker(opts: {
  reviewerRole: string | null;
  reviewerId: string;
  memberIds: string[];
  assignedIds: string[];
}): string | null {
  if (!opts.reviewerRole || !isAssignableRole(opts.reviewerRole)) return "only reviewers can be assigned, choose someone with the reviewer role.";
  if (opts.memberIds.includes(opts.reviewerId)) return "that reviewer built this project, choose someone else.";
  if (opts.assignedIds.includes(opts.reviewerId)) return "that reviewer is already assigned to this project, choose someone else.";
  if (opts.assignedIds.length >= REVIEWERS_PER_PROJECT) return `this project already has ${REVIEWERS_PER_PROJECT} reviewers, remove one first.`;
  return null;
}

/** Hackathon statuses in which winners may be picked (after judging has started). */
export const WINNER_STATUSES = ["JUDGING", "COMPLETED"] as const;

export function winnerBlocker(opts: {
  hackathonType: string;
  hackathonStatus: string;
  projectHackathonId: string | null;
  hackathonId: string;
  projectStatus: string | null;
  prizeQuantity: number;
  winnerCount: number;
  alreadyWon: boolean;
}): string | null {
  if (opts.hackathonType !== "OPEN") return "winners are picked for open hackathons only.";
  if (!(WINNER_STATUSES as readonly string[]).includes(opts.hackathonStatus)) {
    return "winners are picked after judging starts, set the status to judging first.";
  }
  if (opts.projectHackathonId !== opts.hackathonId || opts.projectStatus !== "SUBMITTED") {
    return "that project is not a posted project in this hackathon, choose another.";
  }
  if (opts.alreadyWon) return "that project already won this prize, choose another.";
  if (opts.winnerCount >= opts.prizeQuantity) return "every place for this prize is taken, remove a winner first.";
  return null;
}
