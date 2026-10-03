import "server-only";
import { prisma } from "@/lib/db";
import type { Facts } from "@/lib/permissions";

/** An assigned reviewer sees no identity until they post and then reveal it, which is audited (brief 4.2, 4.4). */
export function isBlindViewer(role: string, facts: Facts): boolean {
  return role === "REVIEWER" && !!facts.isAssignedReviewer && !facts.identityRevealed && !facts.isProjectMember;
}

/** Everything the locker shows for one project. Live GitHub commits replace seeded ones once a fetch has succeeded. */
export async function loadLocker(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      ownerId: true,
      hackathonId: true,
      repoUrl: true,
      owner: { select: { name: true, candidateProfile: { select: { blindCode: true } } } },
      team: { select: { members: { select: { userId: true } } } },
      hackathon: { select: { title: true, slug: true } },
    },
  });
  if (!project) return null;

  const memberIds = [project.ownerId, ...(project.team?.members.map((m) => m.userId) ?? [])];
  const latestSnapshot = await prisma.repoSnapshot.findFirst({ where: { projectId }, orderBy: { fetchedAt: "desc" } });
  const liveOnly = latestSnapshot?.source === "GITHUB";

  const [commits, transcripts, decisions, checkIns, summary] = await Promise.all([
    prisma.commit.findMany({
      where: { projectId, ...(liveOnly ? { snapshot: { source: "GITHUB" } } : {}) },
      orderBy: { committedAt: "desc" },
      select: { id: true, sha: true, message: true, authorName: true, committedAt: true, additions: true, deletions: true, url: true },
    }),
    prisma.aITranscript.findMany({
      where: { projectId },
      orderBy: { uploadedAt: "asc" },
      select: { id: true, title: true, tool: true, content: true, uploadedAt: true },
    }),
    prisma.decisionLogEntry.findMany({
      where: { projectId },
      orderBy: { decidedAt: "asc" },
      select: { id: true, title: true, decision: true, reasoning: true, alternatives: true, aiInvolved: true, aiNote: true, decidedAt: true },
    }),
    prisma.checkIn.findMany({
      where: {
        OR: [{ projectId }, { projectId: null, hackathonId: project.hackathonId, userId: { in: memberIds } }],
      },
      orderBy: [{ week: "asc" }, { submittedAt: "asc" }],
      select: { id: true, week: true, progress: true, blockers: true, nextSteps: true, aiUsage: true, hoursSpent: true, submittedAt: true },
    }),
    prisma.evidenceSummary.findFirst({
      where: { projectId },
      orderBy: { generatedAt: "desc" },
      select: { content: true, model: true, seeded: true, generatedAt: true },
    }),
  ]);

  return { project, latestSnapshot, commits, transcripts, decisions, checkIns, summary };
}

export type Locker = NonNullable<Awaited<ReturnType<typeof loadLocker>>>;
