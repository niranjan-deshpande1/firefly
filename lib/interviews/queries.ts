import "server-only";
import { prisma } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";

/** Interviews the user may see on /interviews: admins all, organizers their hackathons', everyone else their own panels. */
export async function listInterviews(user: CurrentUser) {
  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "ORGANIZER"
        ? { OR: [{ project: { hackathon: { organizerId: user.id } } }, { interviewers: { some: { userId: user.id } } }] }
        : { interviewers: { some: { userId: user.id } } };
  return prisma.interview.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      model: true,
      mode: true,
      status: true,
      outcome: true,
      scheduledAt: true,
      timeZone: true,
      durationMin: true,
      candidate: { select: { name: true } },
      project: { select: { id: true, title: true } },
      role: { select: { title: true, company: { select: { name: true } } } },
      interviewers: { select: { userId: true } },
    },
  });
}

export type InterviewListItem = Awaited<ReturnType<typeof listInterviews>>[number];

/** True when the user sits on this interview's panel (or is an admin) and passes `interview.run`. */
export async function canRunInterview(user: CurrentUser | null, interview: { projectId: string; interviewers: { userId: string }[] }) {
  if (!user) return false;
  if (user.role !== "ADMIN" && !interview.interviewers.some((i) => i.userId === user.id)) return false;
  return check(user, "interview.run", { projectId: interview.projectId });
}

export async function getInterviewRoom(id: string) {
  return prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, name: true } },
      project: { select: { id: true, title: true, tagline: true, verified: true, hackathon: { select: { title: true } } } },
      role: { select: { title: true, company: { select: { name: true } } } },
      interviewers: { select: { userId: true, user: { select: { name: true } } } },
      identityCheckedBy: { select: { name: true } },
      scores: { select: { section: true, score: true, notes: true, scoredById: true } },
    },
  });
}

export type InterviewRoom = NonNullable<Awaited<ReturnType<typeof getInterviewRoom>>>;

/** Latest decision per project is ADVANCE. */
async function advancedProjectIds(hackathonFilter: object) {
  const projects = await prisma.project.findMany({
    where: { ...hackathonFilter, decisions: { some: { outcome: "ADVANCE" } } },
    select: { id: true, decisions: { orderBy: { decidedAt: "desc" }, take: 1, select: { outcome: true } } },
  });
  return projects.filter((p) => p.decisions[0]?.outcome === "ADVANCE").map((p) => p.id);
}

export async function isAdvanced(projectId: string): Promise<boolean> {
  return (await advancedProjectIds({ id: projectId })).length > 0;
}

/** Everything the schedule form needs: advanced projects with their cohort's enrolled roles, and the reviewers. */
export async function getSchedulingOptions(user: CurrentUser) {
  const filter = user.role === "ADMIN" ? {} : { hackathon: { organizerId: user.id } };
  const ids = await advancedProjectIds(filter);
  const [projects, reviewers] = await Promise.all([
    prisma.project.findMany({
      where: { id: { in: ids } },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        owner: { select: { name: true } },
        hackathon: {
          select: {
            title: true,
            enrollments: {
              select: {
                role: {
                  select: {
                    id: true,
                    title: true,
                    company: { select: { name: true, members: { select: { user: { select: { id: true, name: true } } } } } },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({ where: { role: "REVIEWER" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return {
    reviewers: reviewers.map((r) => ({ id: r.id, name: r.name ?? "unnamed reviewer" })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      candidate: p.owner.name ?? "unnamed candidate",
      hackathon: p.hackathon.title,
      roles: p.hackathon.enrollments.map(({ role }) => ({
        id: role.id,
        title: role.title,
        company: role.company.name,
        members: role.company.members.map((m) => ({ id: m.user.id, name: m.user.name ?? "unnamed member" })),
      })),
    })),
  };
}

export type SchedulingOptions = Awaited<ReturnType<typeof getSchedulingOptions>>;
