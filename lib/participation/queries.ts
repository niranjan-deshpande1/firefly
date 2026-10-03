import "server-only";
import { cache } from "react";
import { parseJson, prisma } from "@/lib/db";
import { checkInSlots, cohortStateLine, resultsOut, slotState, type CheckInSlotState } from "./logic";

const CHECKIN_FIELDS = {
  id: true,
  week: true,
  progress: true,
  blockers: true,
  nextSteps: true,
  aiUsage: true,
  hoursSpent: true,
  submittedAt: true,
} as const;

/** The hackathon a participation page is about, with its cohort config. Cached per request. */
export const getHackathonBySlug = cache((slug: string) =>
  prisma.hackathon.findUnique({ where: { slug }, include: { cohortConfig: true } }),
);

export type ParticipationHackathon = NonNullable<Awaited<ReturnType<typeof getHackathonBySlug>>>;

export function cohortDates(h: ParticipationHackathon) {
  const c = h.cohortConfig;
  return c ? { defenseWindowStart: c.defenseWindowStart, defenseWindowEnd: c.defenseWindowEnd, resultsAt: c.resultsAt } : null;
}

export function slotsFor(h: ParticipationHackathon) {
  return checkInSlots(parseJson<unknown>(h.cohortConfig?.checkInSchedule, []), h.startsAt, h.submissionDeadline);
}

export function getRegistration(hackathonId: string, userId: string) {
  return prisma.registration.findUnique({ where: { hackathonId_userId: { hackathonId, userId } } });
}

export function getOwnCheckIns(hackathonId: string, userId: string) {
  return prisma.checkIn.findMany({ where: { hackathonId, userId }, select: CHECKIN_FIELDS, orderBy: { week: "desc" } });
}

/** The candidate's own project in a hackathon (owned or via team), newest first. */
export function getOwnProject(hackathonId: string, userId: string) {
  return prisma.project.findFirst({
    where: { hackathonId, OR: [{ ownerId: userId }, { team: { members: { some: { userId } } } }] },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });
}

// ---------- dashboard ----------

const OUTCOME_LABEL: Record<string, string> = {
  ADVANCE: "advanced to a defense interview",
  HOLD: "on hold",
  REJECT: "not advanced this round",
};

export type DashboardDeadline = { label: string; at: Date };
export type DashboardSlot = { week: number; dueAt: Date; state: CheckInSlotState };

/** Everything the builder dashboard shows, read in parallel. Nothing here ranks or scores. */
export async function getDashboard(userId: string, now: Date) {
  const [registrations, projects, feedback, profile, invites, hireCount, checkIns, openHackathons] = await Promise.all([
    prisma.registration.findMany({
      where: { userId, status: { not: "WITHDRAWN" } },
      include: { hackathon: { include: { cohortConfig: true } } },
      orderBy: { hackathon: { startsAt: "desc" } },
    }),
    prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { team: { members: { some: { userId } } } }] },
      select: {
        id: true,
        title: true,
        tagline: true,
        status: true,
        verified: true,
        hackathonId: true,
        winners: { select: { id: true, prize: { select: { name: true } } } },
        decisions: { orderBy: { decidedAt: "desc" }, take: 1, select: { outcome: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    // Feedback is visible from its results time (contracts 7). The author is never shown.
    prisma.feedback.findMany({
      where: { candidateId: userId, visibleAt: { lte: now } },
      select: { id: true, body: true, visibleAt: true, candidateId: true, project: { select: { id: true, title: true } } },
      orderBy: { visibleAt: "desc" },
    }),
    prisma.candidateProfile.findUnique({ where: { userId }, select: { talentPoolOptIn: true } }),
    prisma.teamInvite.findMany({
      where: { toUserId: userId, status: "PENDING" },
      select: { id: true, team: { select: { name: true, hackathon: { select: { title: true, slug: true } } } }, fromUser: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.hire.count({ where: { candidateId: userId } }),
    prisma.checkIn.findMany({ where: { userId }, select: { ...CHECKIN_FIELDS, hackathonId: true }, orderBy: { week: "desc" } }),
    prisma.hackathon.findMany({
      where: { status: { in: ["UPCOMING", "OPEN"] }, registrations: { none: { userId } } },
      select: { id: true, slug: true, title: true, tagline: true, startsAt: true, timeZone: true },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
  ]);

  const hackathons = registrations.map(({ hackathon: h, status }) => {
    const dates = cohortDates(h);
    const isCohort = h.type === "HIRING_COHORT";
    const out = resultsOut(h, dates, now);
    const own = checkIns.filter((c) => c.hackathonId === h.id);
    const posted = new Set(own.map((c) => c.week));
    const slots: DashboardSlot[] = isCohort ? slotsFor(h).map((s) => ({ week: s.week, dueAt: s.dueAt, state: slotState(s, posted, now) })) : [];
    const deadlines: DashboardDeadline[] = [
      { label: "kickoff", at: h.startsAt },
      { label: "project deadline", at: h.submissionDeadline },
      ...(dates
        ? [
            { label: "defense interviews open", at: dates.defenseWindowStart },
            { label: "defense interviews close", at: dates.defenseWindowEnd },
            { label: "results", at: dates.resultsAt },
          ]
        : [{ label: "hackathon ends", at: h.endsAt }]),
    ].filter((d) => d.at >= now);
    const hProjects = projects
      .filter((p) => p.hackathonId === h.id)
      .map((p) => ({
        ...p,
        results: [
          ...p.winners.map((w) => `awarded: ${w.prize.name}`),
          ...(p.verified ? ["verified"] : []),
          ...(out && p.decisions[0] ? [OUTCOME_LABEL[p.decisions[0].outcome] ?? ""] : []),
        ].filter(Boolean),
      }));
    return {
      id: h.id,
      slug: h.slug,
      title: h.title,
      timeZone: h.timeZone,
      isCohort,
      registrationStatus: status,
      stateLine: cohortStateLine(h, dates, now),
      isPast: out || h.status === "COMPLETED",
      slots,
      checkIns: own,
      deadlines,
      projects: hProjects,
      resultsOut: out,
    };
  });

  // The talent pool is for hiring-cohort finishers (brief 4.2); written feedback only goes to finishers.
  const finished =
    feedback.length > 0 ||
    hackathons.some(
      (h) => h.isCohort && (h.registrationStatus === "FINISHED" || (h.resultsOut && h.projects.some((p) => p.status === "SUBMITTED"))),
    );

  return {
    current: hackathons.filter((h) => !h.isPast),
    past: hackathons.filter((h) => h.isPast),
    feedback,
    invites,
    openHackathons,
    talentPool: finished && hireCount === 0 ? { optedIn: !!profile?.talentPoolOptIn } : null,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;

// ---------- teams ----------

export async function getTeamsPage(hackathonId: string, userId: string) {
  const [teams, myInvites, board] = await Promise.all([
    prisma.team.findMany({
      where: { hackathonId },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: { userId: true, isLead: true, user: { select: { name: true, username: true, image: true, candidateProfile: { select: { visibility: true } } } } },
          orderBy: { joinedAt: "asc" },
        },
        invites: {
          where: { status: "PENDING" },
          select: { id: true, toUser: { select: { name: true, username: true, candidateProfile: { select: { visibility: true } } } } },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teamInvite.findMany({
      where: { toUserId: userId, status: "PENDING", team: { hackathonId } },
      select: { id: true, team: { select: { name: true, hackathon: { select: { title: true, slug: true } } } }, fromUser: { select: { name: true, username: true } } },
    }),
    prisma.registration.findMany({
      where: { hackathonId, lookingForTeam: true, status: { not: "WITHDRAWN" }, user: { teamMembers: { none: { team: { hackathonId } } } } },
      select: { lookingForNote: true, user: { select: { id: true, name: true, username: true, image: true, candidateProfile: { select: { visibility: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const myTeam = teams.find((t) => t.members.some((m) => m.userId === userId)) ?? null;
  return { myTeam, otherTeams: teams.filter((t) => t !== myTeam), myInvites, board };
}
