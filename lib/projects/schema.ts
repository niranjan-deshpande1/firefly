// Pure input schemas and rules for projects. No database access, so everything here is unit tested.
import { z } from "zod";

export const LIMITS = {
  title: 120,
  tagline: 200,
  story: 20000,
  tag: 40,
  tags: 20,
  links: 8,
  linkLabel: 60,
  url: 500,
  comment: 2000,
  alt: 200,
} as const;

/** True only for absolute http or https URLs. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const URL_ERROR = "that link is not an http or https address, paste the full link starting with https://.";

export const zHttpUrl = z.string().trim().max(LIMITS.url, "that link is too long, use a shorter one.").refine(isHttpUrl, URL_ERROR);

const zHttpsUrl = zHttpUrl.refine(
  (v) => new URL(v).protocol === "https:",
  "that link is not https, paste the full link starting with https://.",
);

/** Optional https URL field (repo and demo video, as their hints say): blank means "not set". */
export const zOptionalUrl = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(zHttpsUrl.nullable());

/** Splits "react, Next.js,  postgres" into unique trimmed tags, case-insensitively deduplicated, order kept. */
export function parseBuiltWith(raw: string | string[]): string[] {
  const parts = (Array.isArray(raw) ? raw : raw.split(",")).map((t) => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  return parts.filter((t) => {
    const key = t.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const zLink = z.object({
  label: z.string().trim().min(1, "each link needs a label, name where it goes.").max(LIMITS.linkLabel),
  url: zHttpUrl,
});

export const projectInputSchema = z.object({
  projectId: z.string().min(1).nullable(),
  hackathonId: z.string().min(1),
  title: z.string().trim().min(1, "the project needs a title, add one in basics.").max(LIMITS.title),
  tagline: z.string().trim().max(LIMITS.tagline),
  story: z.string().max(LIMITS.story),
  builtWith: z
    .array(z.string().trim().min(1).max(LIMITS.tag, `each built-with tag is at most ${LIMITS.tag} characters, shorten it.`))
    .max(LIMITS.tags, `keep built-with to ${LIMITS.tags} tags, remove a few.`)
    .transform(parseBuiltWith),
  links: z.array(zLink).max(LIMITS.links, `keep links to ${LIMITS.links}, remove one.`),
  repoUrl: zOptionalUrl,
  videoUrl: zOptionalUrl,
  teamId: z.string().min(1).nullable(),
  intent: z.enum(["draft", "post"]),
});
export type ProjectInput = z.input<typeof projectInputSchema>;
export type ParsedProjectInput = z.output<typeof projectInputSchema>;

/** What still blocks posting (drafts only need a title). Each entry is one sentence with the next step. */
export function postingProblems(p: Pick<ParsedProjectInput, "title" | "tagline" | "story">): string[] {
  const problems: string[] = [];
  if (!p.title.trim()) problems.push("the project needs a title, add one in basics.");
  if (!p.tagline.trim()) problems.push("the project needs a tagline, add one in basics.");
  if (!p.story.trim()) problems.push("the story is empty, write a few lines in story.");
  return problems;
}

/** Changes are allowed until the posting deadline. */
export function isBeforeDeadline(deadline: Date, now: Date = new Date()): boolean {
  return now.getTime() <= deadline.getTime();
}

/** Projects can be posted once the hackathon starts; drafts are allowed before that. */
export function hasStarted(startsAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= startsAt.getTime();
}

export const commentSchema = z.object({
  projectId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "the comment is empty, write something first.")
    .max(LIMITS.comment, `comments are at most ${LIMITS.comment} characters, shorten it.`),
});

export const moveImageSchema = z.object({ id: z.string().min(1).max(64), direction: z.enum(["up", "down"]) });

/** The list with the item at `index` swapped one place up or down; null when it is already at that end or missing. */
export function moveItem<T>(list: readonly T[], index: number, direction: "up" | "down"): T[] | null {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return null;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const imageMetaSchema = z.object({
  projectId: z.string().min(1),
  alt: z.string().trim().min(1, "describe the image so screen reader users get it too.").max(LIMITS.alt),
});

/**
 * Builder names on hiring-cohort projects stay hidden until results are out, so reviewers keep a blind view
 * (brief 4.4). Members, the organizer and admins always see them. Open hackathons always show names.
 */
export function showBuilderNames(opts: {
  hackathonType: string;
  hackathonStatus: string;
  viewerIsInsider: boolean;
}): boolean {
  return opts.hackathonType !== "HIRING_COHORT" || opts.hackathonStatus === "COMPLETED" || opts.viewerIsInsider;
}

/** Hiring-cohort galleries open after the deadline; open hackathons show posted projects right away. */
export function galleryIsOpen(opts: { hackathonType: string; submissionDeadline: Date; now?: Date }): boolean {
  return opts.hackathonType !== "HIRING_COHORT" || !isBeforeDeadline(opts.submissionDeadline, opts.now);
}

/** Keeps projects that carry every selected tag (case-insensitive). */
export function filterByBuiltWith<T extends { builtWith: string[] }>(projects: T[], selected: string[]): T[] {
  const wanted = selected.map((s) => s.toLowerCase());
  return projects.filter((p) => {
    const have = new Set(p.builtWith.map((t) => t.toLowerCase()));
    return wanted.every((w) => have.has(w));
  });
}

/** Alphabetical tag list for the filter bar (never sorted by frequency). */
export function allTags(projects: { builtWith: string[] }[]): string[] {
  return parseBuiltWith(projects.flatMap((p) => p.builtWith)).sort((a, b) => a.localeCompare(b));
}

/** Search params value(s) to a list. */
export function paramList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean);
}
