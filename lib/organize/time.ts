// Wall-clock time in a named IANA zone <-> UTC instants. Pure, shared by client forms and server actions.
// Organizers type times as "datetime-local" values ("2026-10-03T09:30") read in the zone they pick.

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function isValidTimeZone(zone: string): boolean {
  if (!zone || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone.includes("/") || zone === "UTC";
  } catch {
    return false;
  }
}

/** Zone offset in minutes (zone minus UTC) at the given instant. */
function offsetMinutes(instant: number, zone: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
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
  return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / 60000);
}

/** "2026-10-03T09:30" read in `zone` -> the UTC instant. Returns null for malformed input. */
export function zonedLocalToUtc(local: string, zone: string): Date | null {
  const m = LOCAL_RE.exec(local);
  if (!m || !isValidTimeZone(zone)) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  if (new Date(wall).getUTCMonth() !== mo - 1) return null; // 31 feb and friends
  // Two passes settle the offset across daylight-saving transitions.
  let guess = wall - offsetMinutes(wall, zone) * 60000;
  guess = wall - offsetMinutes(guess, zone) * 60000;
  return new Date(guess);
}

// ponytail: a short curated list; the server accepts any IANA zone, so widen this when organizers ask.
export const COMMON_TIME_ZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

/** Zones for the hackathon time zone picker: the curated list, plus `current` when it is valid and not in it. */
export function zoneOptions(current?: string | null): string[] {
  const list: string[] = [...COMMON_TIME_ZONES];
  return current && isValidTimeZone(current) && !list.includes(current) ? [current, ...list] : list;
}

/** UTC instant -> "2026-10-03T09:30" in `zone`, for datetime-local inputs. */
export function utcToZonedLocal(date: Date, zone: string): string {
  const shifted = new Date(date.getTime() + offsetMinutes(date.getTime(), zone) * 60000);
  return shifted.toISOString().slice(0, 16);
}
