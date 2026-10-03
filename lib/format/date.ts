// Dates and times per manual 11.2: "22 jul" in product, "22 july 2026" in email,
// times as "09:30 America/Los_Angeles (UTC−07:00)" with the real IANA zone and offset.

// ASSUMPTION (decisions log 12): default display zone until a profile override exists.
export const DEFAULT_TIME_ZONE = "America/Los_Angeles";

function parts(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone, ...options }).formatToParts(date).map((p) => [p.type, p.value]),
  );
}

export function formatDate(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  const p = parts(date, timeZone, { day: "numeric", month: "short" });
  return `${p.day} ${p.month.toLowerCase().slice(0, 3)}`;
}

export function formatDateLong(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  const p = parts(date, timeZone, { day: "numeric", month: "long", year: "numeric" });
  return `${p.day} ${p.month.toLowerCase()} ${p.year}`;
}

/** UTC offset like "UTC−07:00" (true minus sign) for the zone at that instant. */
export function formatOffset(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  const name = parts(date, timeZone, { timeZoneName: "longOffset" }).timeZoneName ?? "GMT";
  const raw = name.replace("GMT", "") || "+00:00";
  return `UTC${raw.replace("-", "−")}`;
}

export function formatTime(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  const p = parts(date, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${p.hour}:${p.minute} ${timeZone} (${formatOffset(date, timeZone)})`;
}

export function formatDateTime(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return `${formatDate(date, timeZone)}, ${formatTime(date, timeZone)}`;
}
