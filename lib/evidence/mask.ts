// Blind review masking. A builder may type their own name, username, GitHub handle or email into a
// transcript, check-in or decision; a reviewer who hasn't revealed the identity must not see it.
import { parseRepoUrl } from "./github";

export const MASK = "[builder]";
const MIN_NAME_PART = 3;
// Letters, digits and underscore count as "inside a word" for any script.
const WORD = "[\\p{L}\\p{N}_]";

type Person = { name?: string | null; username?: string | null; email?: string | null };

/** Everything that identifies the project's people: full names, name parts of 3+ letters, usernames, emails, the repo owner. */
export function identifiersFor(people: Person[], repoUrl?: string | null): string[] {
  const out = new Set<string>();
  for (const p of people) {
    const name = p.name?.trim();
    if (name) {
      out.add(name);
      // Name parts are runs of letters (apostrophes kept, as in O'Neil); punctuation and initials are dropped.
      for (const part of name.split(/[^\p{L}\p{M}'’]+/u)) if (part.length >= MIN_NAME_PART) out.add(part);
    }
    if (p.username?.trim()) out.add(p.username.trim());
    if (p.email?.trim()) out.add(p.email.trim());
  }
  const handle = parseRepoUrl(repoUrl)?.owner;
  if (handle) out.add(handle);
  return [...out];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replaces every whole-word, case-insensitive match of an identifier with [builder]. Longest first, so a full name wins over its parts. */
export function maskIdentity(text: string, identifiers: string[]): string {
  const list = identifiers.filter((s) => s.trim() !== "").sort((a, b) => b.length - a.length);
  if (!text || list.length === 0) return text;
  const pattern = new RegExp(`(?<!${WORD})(?:${list.map(escape).join("|")})(?!${WORD})`, "giu");
  return text.replace(pattern, MASK);
}

// Free-text fields a builder writes; ids, shas, urls and dates are left alone.
const TEXT_FIELDS = new Set(["title", "content", "message", "decision", "reasoning", "alternatives", "aiNote", "progress", "blockers", "nextSteps", "aiUsage", "label", "excerpt"]);

/** A copy of the row with every free-text field masked. */
export function maskRow<T extends object>(row: T, identifiers: string[]): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, TEXT_FIELDS.has(k) && typeof v === "string" ? maskIdentity(v, identifiers) : v]),
  ) as T;
}

type Maskable = { commits: object[]; transcripts: object[]; decisions: object[]; checkIns: object[]; summary: { content: string } | null };

/** A copy of the evidence with every builder-written text masked, the summary's `content` included. */
export function maskEvidence<T extends Maskable>(evidence: T, identifiers: string[]): T {
  const rows = <R extends object>(list: R[]) => list.map((r) => maskRow(r, identifiers));
  return {
    ...evidence,
    commits: rows(evidence.commits),
    transcripts: rows(evidence.transcripts),
    decisions: rows(evidence.decisions),
    checkIns: rows(evidence.checkIns),
    summary: evidence.summary ? { ...evidence.summary, content: maskIdentity(evidence.summary.content, identifiers) } : null,
  };
}
