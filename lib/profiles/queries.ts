import "server-only";
import { prisma, parseJson, type LinkItem } from "@/lib/db";

/**
 * Everything the public profile shows, and nothing else: no blind code, scores, decisions,
 * feedback, check-ins or evidence. Returns null when the username does not exist.
 */
export async function getProfileByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      image: true,
      username: true,
      candidateProfile: {
        select: { headline: true, bio: true, skills: true, links: true, location: true, school: true, experienceLevel: true, visibility: true },
      },
    },
  });
  if (!user) return null;

  const [projects, registrations] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: "SUBMITTED",
        hackathon: { status: { not: "DRAFT" } },
        OR: [{ ownerId: user.id }, { team: { members: { some: { userId: user.id } } } }],
        // Blind review: a hiring-cohort project only appears on the profile once the cohort is completed.
        AND: [{ OR: [{ hackathon: { type: { not: "HIRING_COHORT" } } }, { hackathon: { status: "COMPLETED" } }] }],
      },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        title: true,
        tagline: true,
        verified: true,
        submittedAt: true,
        hackathon: { select: { title: true, slug: true } },
        winners: { select: { id: true, prize: { select: { name: true } } } },
      },
    }),
    prisma.registration.findMany({
      where: { userId: user.id, status: { not: "WITHDRAWN" }, hackathon: { status: { not: "DRAFT" } } },
      orderBy: { hackathon: { startsAt: "desc" } },
      select: { hackathon: { select: { id: true, title: true, slug: true, startsAt: true } } },
    }),
  ]);

  const profile = user.candidateProfile;
  return {
    id: user.id,
    name: user.name ?? user.username ?? "builder",
    image: user.image,
    username: user.username!,
    profile: profile
      ? {
          ...profile,
          skills: parseJson<string[]>(profile.skills, []),
          links: parseJson<LinkItem[]>(profile.links, []),
        }
      : null,
    projects,
    hackathons: registrations.map((r) => r.hackathon),
  };
}
export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;

/** A hidden profile is visible to its owner and admins only. */
export function isProfileVisible(visibility: string | null | undefined, canManage: boolean): boolean {
  return canManage || visibility === "PUBLIC";
}

/** The settings page's own view of the signed-in user. */
export async function getOwnSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      candidateProfile: true,
      dataRequests: { where: { kind: "DELETE", status: "OPEN" }, select: { id: true, createdAt: true }, take: 1 },
    },
  });
}

/**
 * The signed-in person's own rows, as a JSON-ready object. OAuth tokens, sessions and
 * other people's rows (reviews, scores, decisions, interview scorecards) are left out.
 */
export async function buildExport(userId: string) {
  const now = new Date();
  const [user, projectRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        createdAt: true,
        candidateProfile: true,
        companyMembers: { select: { title: true, isOwner: true, createdAt: true, company: { select: { name: true, slug: true } } } },
        registrations: { select: { status: true, eligibilityConfirmed: true, lookingForTeam: true, lookingForNote: true, createdAt: true, hackathon: { select: { title: true, slug: true } } } },
        teamMembers: { select: { isLead: true, joinedAt: true, team: { select: { name: true, hackathon: { select: { title: true } } } } } },
        checkIns: true,
        comments: { select: { projectId: true, body: true, createdAt: true } },
        likes: { select: { projectId: true, createdAt: true } },
        feedbackGot: { where: { visibleAt: { lte: now } }, select: { projectId: true, body: true, visibleAt: true } },
        interviewsAsCandidate: { select: { projectId: true, mode: true, scheduledAt: true, durationMin: true, location: true, videoLink: true, status: true } },
        dataRequests: { select: { kind: true, status: true, createdAt: true, resolvedAt: true } },
        uploads: { select: { kind: true, originalName: true, mimeType: true, sizeBytes: true, createdAt: true } },
      },
    }),
    // Evidence comes with projects the person owns; team projects they joined list the project only.
    prisma.project.findMany({
      where: { ownerId: userId },
      include: { images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }, transcripts: true, decisionLog: true, commits: true, repoSnapshots: true },
    }),
  ]);
  const teamProjects = await prisma.project.findMany({
    where: { ownerId: { not: userId }, team: { members: { some: { userId } } } },
    select: { id: true, title: true, tagline: true, status: true, hackathon: { select: { title: true } } },
  });
  return { exportedAt: now.toISOString(), format: "firefly-export-1", user, projects: projectRows, teamProjects };
}
