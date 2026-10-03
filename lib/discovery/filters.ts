// Hackathon listing filters. Pure: URL search params in, a validated filter object, a Prisma
// where clause and removable chips out. The URL is the only filter state (no client store).
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const TYPE_OPTIONS = { OPEN: "open hackathon", HIRING_COHORT: "hiring cohort" } as const;
// DRAFT is never listed publicly, so it is not a filter option.
export const STATUS_OPTIONS = {
  UPCOMING: "upcoming",
  OPEN: "open",
  JUDGING: "judging",
  DEFENSE: "defense interviews",
  COMPLETED: "completed",
} as const;
export const FORMAT_OPTIONS = { ONLINE: "online", IN_PERSON: "in person" } as const;
export const SORT_OPTIONS = { start: "start date", deadline: "deadline" } as const;

const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const keys = <T extends Record<string, string>>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

const schema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  type: z.enum(keys(TYPE_OPTIONS)).optional().catch(undefined),
  status: z.enum(keys(STATUS_OPTIONS)).optional().catch(undefined),
  theme: z.string().trim().max(60).optional().catch(undefined),
  format: z.enum(keys(FORMAT_OPTIONS)).optional().catch(undefined),
  from: dateParam.optional().catch(undefined),
  to: dateParam.optional().catch(undefined),
  sort: z.enum(keys(SORT_OPTIONS)).catch("start"),
});

export type ListingFilters = z.infer<typeof schema>;
export const FILTER_KEYS = ["q", "type", "status", "theme", "format", "from", "to"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

type RawParams = Record<string, string | string[] | undefined>;

/** Invalid values are dropped, never thrown: a hand-edited URL still renders a listing. */
export function parseFilters(params: RawParams): ListingFilters {
  const flat = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, (Array.isArray(v) ? v[0] : v) || undefined]),
  );
  return schema.parse(flat);
}

export function activeKeys(f: ListingFilters): FilterKey[] {
  return FILTER_KEYS.filter((k) => !!f[k]);
}

export function withoutKey(f: ListingFilters, key: FilterKey): ListingFilters {
  return { ...f, [key]: undefined };
}

export function toWhere(f: ListingFilters): Prisma.HackathonWhereInput {
  const and: Prisma.HackathonWhereInput[] = [{ status: { not: "DRAFT" } }];
  // ponytail: SQLite `contains` is case-insensitive for ASCII; on Postgres add mode: "insensitive".
  if (f.q) and.push({ OR: [{ title: { contains: f.q } }, { tagline: { contains: f.q } }] });
  if (f.type) and.push({ type: f.type });
  if (f.status) and.push({ status: f.status });
  // Themes are a JSON string[] column, so match the quoted value.
  if (f.theme) and.push({ themes: { contains: JSON.stringify(f.theme) } });
  // A hybrid event is both online and in person.
  if (f.format) and.push({ format: { in: [f.format, "HYBRID"] } });
  // Date range: events that overlap [from, to]. Dates are whole UTC days.
  if (f.from) and.push({ endsAt: { gte: new Date(`${f.from}T00:00:00Z`) } });
  if (f.to) and.push({ startsAt: { lte: new Date(`${f.to}T23:59:59Z`) } });
  return { AND: and };
}

export function toOrderBy(f: ListingFilters): Prisma.HackathonOrderByWithRelationInput[] {
  return f.sort === "deadline" ? [{ submissionDeadline: "asc" }, { title: "asc" }] : [{ startsAt: "asc" }, { title: "asc" }];
}

export function toQueryString(f: ListingFilters): string {
  const p = new URLSearchParams();
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k] as string);
  if (f.sort !== "start") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function chipLabel(f: ListingFilters, key: FilterKey): string {
  switch (key) {
    case "q":
      return `search: ${f.q}`;
    case "type":
      return TYPE_OPTIONS[f.type!];
    case "status":
      return STATUS_OPTIONS[f.status!];
    case "theme":
      return `theme: ${f.theme}`;
    case "format":
      return FORMAT_OPTIONS[f.format!];
    case "from":
      return `from ${f.from}`;
    case "to":
      return `to ${f.to}`;
  }
}

/** One removable chip per active filter; each links to the same listing without that filter. */
export function filterChips(f: ListingFilters, path = "/hackathons") {
  return activeKeys(f).map((key) => ({
    key,
    label: chipLabel(f, key),
    href: `${path}${toQueryString(withoutKey(f, key))}`,
  }));
}
