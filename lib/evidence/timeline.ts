import { DEFAULT_TIME_ZONE } from "@/lib/format/date";

export type DayCount = { day: string; count: number };

const MAX_DAYS = 90; // ponytail: chart shows at most the last 90 days of the span; the list below has every commit.
const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar day (YYYY-MM-DD) of an instant in a zone. */
export function dayKey(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/**
 * Commits per calendar day, with empty days kept as zero so quiet time stays visible (manual 1.1).
 * Days run from the first to the last commit, capped to the last MAX_DAYS.
 */
export function commitsPerDay(dates: Date[], timeZone = DEFAULT_TIME_ZONE): DayCount[] {
  if (dates.length === 0) return [];
  const counts = new Map<string, number>();
  for (const d of dates) counts.set(dayKey(d, timeZone), (counts.get(dayKey(d, timeZone)) ?? 0) + 1);
  const keys = [...counts.keys()].sort();
  // Walk whole days in UTC between the first and last key; keys are plain dates, so no zone math is needed here.
  const last = Date.parse(`${keys[keys.length - 1]}T00:00:00Z`);
  const first = Math.max(Date.parse(`${keys[0]}T00:00:00Z`), last - (MAX_DAYS - 1) * DAY_MS);
  const out: DayCount[] = [];
  for (let t = first; t <= last; t += DAY_MS) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push({ day, count: counts.get(day) ?? 0 });
  }
  return out;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "2026-07-22" to "22 jul" (manual 11.2). */
export function dayLabel(day: string): string {
  const [, m, d] = day.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
