import "server-only";
import { prisma, parseJson, type LinkItem } from "@/lib/db";

export type Person = { id: string; name: string; username: string | null; image: string | null };

const personSelect = { id: true, name: true, username: true, image: true, candidateProfile: { select: { visibility: true } } } as const;

function person(u: { id: string; name: string | null; username: string | null; image: string | null; candidateProfile?: { visibility: string } | null }): Person {
  // Only a public profile gets a link; /u/<name> 404s for anything else.
  const username = !u.candidateProfile || u.candidateProfile.visibility === "PUBLIC" ? u.username : null;
  return { id: u.id, image: u.image, username, name: u.name ?? u.username ?? "a builder" };
}

/** Owner first, then the rest of the team, each once. */
export function projectMembers(owner: Person, team: Person[]): Person[] {
  return [owner, ...team.filter((m) => m.id !== owner.id)];
}

export async function getProject(id: string, viewerId: string | null) {
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      hackathon: { select: { id: true, slug: true, title: true, type: true, status: true, submissionDeadline: true } },
      owner: { select: personSelect },
      team: { select: { id: true, name: true, members: { select: { user: { select: personSelect } }, orderBy: { joinedAt: "asc" } } } },
      images: { orderBy: { sortOrder: "asc" } },
      winners: { select: { id: true, prize: { select: { name: true, sortOrder: true } } } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: personSelect } } },
      likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    tagline: p.tagline,
    story: p.story,
    builtWith: parseJson<string[]>(p.builtWith, []),
    links: parseJson<LinkItem[]>(p.links, []),
    repoUrl: p.repoUrl,
    videoUrl: p.videoUrl,
    status: p.status,
    submittedAt: p.submittedAt,
    verified: p.verified,
    hackathon: p.hackathon,
    team: p.team ? { id: p.team.id, name: p.team.name } : null,
    members: projectMembers(person(p.owner), (p.team?.members ?? []).map((m) => person(m.user))),
    images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    awards: p.winners.sort((a, b) => a.prize.sortOrder - b.prize.sortOrder).map((w) => w.prize.name),
    comments: p.comments.map((c) => ({ id: c.id, body: c.body, hidden: c.hidden, createdAt: c.createdAt, author: person(c.author) })),
    likedByViewer: Array.isArray(p.likes) && p.likes.length > 0,
  };
}
export type ProjectView = NonNullable<Awaited<ReturnType<typeof getProject>>>;

export async function getHackathonBySlug(slug: string) {
  return prisma.hackathon.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, type: true, status: true, submissionDeadline: true, organizerId: true },
  });
}

/** Posted projects in a hackathon, alphabetical (never by likes). */
export async function getGallery(hackathonId: string) {
  const rows = await prisma.project.findMany({
    where: { hackathonId, status: "SUBMITTED" },
    orderBy: { title: "asc" },
    include: {
      owner: { select: personSelect },
      team: { select: { name: true, members: { select: { user: { select: personSelect } } } } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      winners: { select: { prize: { select: { name: true, sortOrder: true } } } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    tagline: p.tagline,
    verified: p.verified,
    builtWith: parseJson<string[]>(p.builtWith, []),
    cover: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
    teamName: p.team?.name ?? null,
    members: projectMembers(person(p.owner), (p.team?.members ?? []).map((m) => person(m.user))),
    awards: p.winners.sort((a, b) => a.prize.sortOrder - b.prize.sortOrder).map((w) => w.prize.name),
  }));
}
export type GalleryItem = Awaited<ReturnType<typeof getGallery>>[number];

/** The viewer's team in a hackathon (one per builder per hackathon). */
export async function getUserTeam(userId: string, hackathonId: string) {
  const t = await prisma.team.findFirst({
    where: { hackathonId, members: { some: { userId } } },
    select: { id: true, name: true, members: { select: { user: { select: personSelect } }, orderBy: { joinedAt: "asc" } } },
  });
  return t ? { id: t.id, name: t.name, members: t.members.map((m) => person(m.user).name) } : null;
}

/** The project the user already owns or shares through a team in this hackathon, if any. */
export async function findUserProject(userId: string, hackathonId: string) {
  return prisma.project.findFirst({
    where: { hackathonId, OR: [{ ownerId: userId }, { team: { members: { some: { userId } } } }] },
    select: { id: true },
  });
}

export async function getRegistration(userId: string, hackathonId: string) {
  return prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId, userId } } });
}

/** Everything the posting flow needs for an existing project. */
export async function getProjectForEdit(id: string) {
  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      hackathon: { select: { id: true, slug: true, title: true, submissionDeadline: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    status: p.status,
    hackathon: p.hackathon,
    ownerId: p.ownerId,
    form: {
      title: p.title,
      tagline: p.tagline,
      story: p.story,
      builtWith: parseJson<string[]>(p.builtWith, []),
      links: parseJson<LinkItem[]>(p.links, []),
      repoUrl: p.repoUrl ?? "",
      videoUrl: p.videoUrl ?? "",
      teamId: p.teamId,
    },
    images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
  };
}
