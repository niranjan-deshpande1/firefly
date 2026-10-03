import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma, parseJson } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { activeKeys, toOrderBy, toWhere, withoutKey, type ListingFilters } from "./filters";

const cardSelect = {
  id: true,
  slug: true,
  type: true,
  status: true,
  title: true,
  tagline: true,
  themes: true,
  format: true,
  location: true,
  startsAt: true,
  endsAt: true,
  submissionDeadline: true,
  timeZone: true,
} as const;

export type HackathonCard = {
  id: string;
  slug: string;
  type: string;
  status: string;
  title: string;
  tagline: string;
  themes: string[];
  format: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  submissionDeadline: Date;
  timeZone: string;
};

type CardRow = Omit<HackathonCard, "themes"> & { themes: string };
const toCard = (row: CardRow): HackathonCard => ({ ...row, themes: parseJson<string[]>(row.themes, []) });

export async function listHackathons(filters: ListingFilters, take?: number): Promise<HackathonCard[]> {
  const rows = await prisma.hackathon.findMany({ where: toWhere(filters), orderBy: toOrderBy(filters), select: cardSelect, take });
  return rows.map(toCard);
}

/**
 * Empty-state neighbours (manual 11.4): drop one active filter at a time and collect up to
 * `limit` distinct results, falling back to the unfiltered listing.
 */
export async function adjacentHackathons(filters: ListingFilters, limit = 3): Promise<HackathonCard[]> {
  const found = new Map<string, HackathonCard>();
  const attempts = [...activeKeys(filters).map((k) => withoutKey(filters, k)), { sort: filters.sort } as ListingFilters];
  for (const attempt of attempts) {
    if (found.size >= limit) break;
    for (const card of await listHackathons(attempt, limit)) {
      if (found.size < limit && !found.has(card.id)) found.set(card.id, card);
    }
  }
  return [...found.values()];
}

/** Distinct themes across public hackathons, for the theme filter. */
export async function listThemes(): Promise<string[]> {
  const rows = await prisma.hackathon.findMany({ where: { status: { not: "DRAFT" } }, select: { themes: true } });
  return [...new Set(rows.flatMap((r) => parseJson<string[]>(r.themes, [])))].sort((a, b) => a.localeCompare(b));
}

/**
 * Loads one hackathon for its public pages, once per request (layout and tab share it).
 * 404s when the slug is unknown, or when it is a draft the viewer cannot manage.
 */
export const getHackathonForView = cache(async (slug: string) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { slug },
    include: { cohortConfig: true },
  });
  if (!hackathon) notFound();
  const user = await getCurrentUser();
  // hackathon.view is true for non-draft hackathons and for the organizer (and admins) of a draft.
  if (!(await check(user, "hackathon.view", { hackathonId: hackathon.id }))) notFound();
  return { hackathon: { ...hackathon, themes: parseJson<string[]>(hackathon.themes, []) }, user };
});
