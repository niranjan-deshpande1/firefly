// Plain-text labels and visibility rules for discovery pages. Pure.
import { formatDate } from "@/lib/format/date";
import { STATUS_OPTIONS, TYPE_OPTIONS } from "./filters";

export const typeLabel = (type: string) => TYPE_OPTIONS[type as keyof typeof TYPE_OPTIONS] ?? type.toLowerCase();

export const statusLabel = (status: string) =>
  status === "DRAFT" ? "draft" : (STATUS_OPTIONS[status as keyof typeof STATUS_OPTIONS] ?? status.toLowerCase());

export const FORMAT_LABELS: Record<string, string> = { ONLINE: "online", IN_PERSON: "in person", HYBRID: "online and in person" };

export function formatLabel(format: string, location: string | null): string {
  const base = FORMAT_LABELS[format] ?? format.toLowerCase();
  return location && format !== "ONLINE" ? `${base}, ${location}` : base;
}

/** "3 nov to 17 nov, America/Los_Angeles": a date range always names the zone it was read in. */
export function dateRange(start: Date, end: Date, timeZone: string): string {
  return `${formatDate(start, timeZone)} to ${formatDate(end, timeZone)}, ${timeZone}`;
}

/** Organizer-entered links render only when they are http(s), so no javascript: or data: URL reaches an href. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Registration is possible before and during the build. */
export const isRegistrationOpen = (status: string) => status === "UPCOMING" || status === "OPEN";

/**
 * Participant listing visibility (CandidateProfile.visibility):
 * Only PUBLIC profiles are listed. PLATFORM is treated as hidden everywhere (lib/profiles), so its /u page 404s.
 * A builder without a profile is not listed, since they have not chosen a visibility.
 */
export function isListedParticipant(visibility: string | null | undefined): boolean {
  return visibility === "PUBLIC";
}
