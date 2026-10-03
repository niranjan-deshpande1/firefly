// Pure filter parsing for the admin logs. No database access, so it is unit tested.
import { containsText } from "@/lib/db/search";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { AUDIT_ACTIONS, INVOICE_STATUSES } from "@/lib/db/enums";

export const PAGE_SIZE = 50;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const dateString = z.preprocess(blankToUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());
const text = z.preprocess(blankToUndefined, z.string().trim().max(100).optional());
const page = z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(10_000).default(1));

export const auditFilterSchema = z.object({
  action: z.preprocess(blankToUndefined, z.enum(AUDIT_ACTIONS).optional()),
  actor: text,
  subject: text,
  from: dateString,
  to: dateString,
  page,
});
export type AuditFilters = z.infer<typeof auditFilterSchema>;

export const emailFilterSchema = z.object({ template: text, to: text, page });
export type EmailFilters = z.infer<typeof emailFilterSchema>;

export const invoiceFilterSchema = z.object({ status: z.preprocess(blankToUndefined, z.enum(INVOICE_STATUSES).optional()) });

/** Parses URL search params; anything invalid is dropped so a bad link still renders the log. */
export function parseFilters<T extends z.ZodObject>(schema: T, params: SearchParams): z.infer<T> {
  const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, first(params[k])]));
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const cleaned = { ...raw };
  for (const issue of parsed.error.issues) delete cleaned[String(issue.path[0])];
  return schema.parse(cleaned);
}

/** Matches a person by id, name, email or username. */
function personWhere(query: string): Prisma.UserWhereInput {
  return { OR: [{ id: query }, { name: containsText(query) }, { email: containsText(query) }, { username: containsText(query) }] };
}

/** Inclusive date range in UTC days: from 00:00 of `from` to the end of `to`. */
export function dateRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  const range: Prisma.DateTimeFilter = {};
  if (from) range.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000);
  return range;
}

export function auditWhere(f: AuditFilters): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (f.action) where.action = f.action;
  if (f.actor) where.actor = personWhere(f.actor);
  if (f.subject) where.subjectUser = personWhere(f.subject);
  const createdAt = dateRange(f.from, f.to);
  if (createdAt) where.createdAt = createdAt;
  return where;
}

export function emailWhere(f: EmailFilters): Prisma.EmailLogWhereInput {
  const where: Prisma.EmailLogWhereInput = {};
  if (f.template) where.template = f.template;
  if (f.to) where.to = containsText(f.to);
  return where;
}

/** Builds a query string for a filtered page link, leaving out empty values. */
export function filterHref(path: string, filters: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== "" && !(k === "page" && v === 1)) qs.set(k, String(v));
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}
