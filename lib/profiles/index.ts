// Pure profile and privacy helpers. Safe to import from client components and tests.
// Server reads live in ./queries, server actions in ./actions.
import { z } from "zod";
import { EXPERIENCE_LEVELS } from "@/lib/db/enums";
import type { LinkItem } from "@/lib/db/json";

/** Bump when the consent copy changes; builders whose stored version differs see the screen again. */
export const CONSENT_VERSION = "2026-10-03.2";

/** True when the builder agreed to the current consent text. */
export function hasCurrentConsent(profile: { consentAt: Date | null; consentVersion: string | null } | null | undefined): boolean {
  return !!profile?.consentAt && profile.consentVersion === CONSENT_VERSION;
}

/** Roles a person may pick at onboarding. Organizer, reviewer and admin are assigned by an admin. */
export const SELF_SERVE_ROLES = ["CANDIDATE", "COMPANY"] as const;
export type SelfServeRole = (typeof SELF_SERVE_ROLES)[number];

/** The two visibility states we offer. PLATFORM exists in the enum but is treated as hidden. */
export const VISIBILITY_CHOICES = ["PUBLIC", "PRIVATE"] as const;

/** Only a same-origin relative path survives; anything else falls back. Blocks "//evil.test" and "/\evil.test". */
export function safeNext(next: unknown, fallback: string): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  try {
    const url = new URL(next, "http://firefly.invalid");
    if (url.origin !== "http://firefly.invalid") return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("//") ? fallback : path; // normalization can turn "/.//x" into "//x"
  } catch {
    return fallback;
  }
}

/** Four uppercase hex characters, e.g. "7F3A". */
export function randomBlindCode(random: () => number = Math.random): string {
  return Math.floor(random() * 0x10000).toString(16).toUpperCase().padStart(4, "0");
}

/** Draws codes until one is free. 65,536 codes; ponytail: widen the code if the pool ever gets crowded. */
export async function uniqueBlindCode(isTaken: (code: string) => Promise<boolean>, random: () => number = Math.random, tries = 50): Promise<string> {
  for (let i = 0; i < tries; i++) {
    const code = randomBlindCode(random);
    if (!(await isTaken(code))) return code;
  }
  throw new Error("no free blind code found, try again.");
}

/**
 * One link per line: an optional label, then the address.
 * "portfolio https://maya.example" or just "https://maya.example" (label becomes the host).
 */
export function parseLinks(text: string): { links: LinkItem[]; error?: string } {
  const links: LinkItem[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const address = parts.pop()!;
    let url: URL;
    try {
      url = new URL(address);
    } catch {
      return { links, error: `"${address}" is not a full web address, start it with https://.` };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return { links, error: `"${address}" is not a web address, use an https:// link.` };
    links.push({ label: parts.join(" ").slice(0, 40) || url.host, url: url.toString() });
  }
  if (links.length > 8) return { links, error: "that is more than 8 links, keep the 8 that matter most." };
  return { links };
}

export function formatLinks(links: LinkItem[]): string {
  return links.map((l) => `${l.label} ${l.url}`).join("\n");
}

/** Comma separated, trimmed, de-duplicated (case-insensitive), at most 20. */
export function parseSkills(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of text.split(",")) {
    const skill = s.trim().slice(0, 40);
    if (!skill || seen.has(skill.toLowerCase())) continue;
    seen.add(skill.toLowerCase());
    out.push(skill);
  }
  return out.slice(0, 20);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `keep this under ${max} characters, then save again.`)
    .transform((v) => (v === "" ? null : v));

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/, "use 3 to 30 lowercase letters, digits or dashes, then save again.");

/** Name only: what company members, organizers, reviewers and admins can edit. */
export const nameSchema = z.object({
  name: z.string().trim().min(1, "add your name, then save again.").max(80, "keep your name under 80 characters, then save again."),
});

export const profileSchema = nameSchema.extend({
  username: usernameSchema,
  headline: optionalText(120),
  bio: optionalText(4000),
  skills: z.string().max(1000).transform(parseSkills),
  links: z.string().max(2000),
  location: optionalText(80),
  school: optionalText(80),
  experienceLevel: z.union([z.enum(EXPERIENCE_LEVELS), z.literal("")]).transform((v) => (v === "" ? null : v)),
});
export type ProfileInput = z.input<typeof profileSchema>;

export const EXPERIENCE_LABEL: Record<(typeof EXPERIENCE_LEVELS)[number], string> = {
  STUDENT: "in school",
  NEW_GRAD: "new grad",
  JUNIOR: "junior",
  MID: "mid-level",
  SENIOR: "senior",
};

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string; /** The form field at fault, for aria-invalid. */ field?: string };
