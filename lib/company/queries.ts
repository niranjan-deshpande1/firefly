import "server-only";
import { prisma, parseJson } from "@/lib/db";
import type { CurrentUser } from "@/lib/auth";

/**
 * The company a page acts for: the member's own company. Admins are not members, so they
 * pick one with `?company=<slug>` and fall back to the first company.
 */
export async function getActiveCompany(user: CurrentUser, slug?: string | null) {
  if (user.role === "ADMIN") {
    return slug
      ? prisma.company.findUnique({ where: { slug } })
      : prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  }
  const membership = await prisma.companyMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { company: true },
  });
  return membership?.company ?? null;
}

export async function getDashboard(companyId: string) {
  const now = new Date();
  const [roles, enrollments, requests, invoices, hires] = await Promise.all([
    prisma.role.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      include: {
        shortlist: { include: { entries: { where: { status: { not: "WITHDRAWN" } }, select: { id: true } } } },
        _count: { select: { criteria: true } },
      },
    }),
    prisma.cohortEnrollment.findMany({
      where: { companyId },
      orderBy: { enrolledAt: "desc" },
      include: { hackathon: { select: { title: true, slug: true, status: true, startsAt: true, endsAt: true } }, role: { select: { id: true, title: true } }, invoice: { select: { number: true } } },
    }),
    prisma.interviewRequest.findMany({
      where: { companyId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { role: { select: { title: true } }, candidate: { select: { id: true, name: true } } },
    }),
    prisma.invoice.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.hire.findMany({
      where: { companyId },
      orderBy: { reportedAt: "desc" },
      include: { role: { select: { title: true } }, candidate: { select: { name: true } } },
    }),
  ]);
  const activeEnrollment = enrollments.some((e) => e.hackathon.endsAt >= now);
  return { roles, enrollments, requests, invoices, hires, activeEnrollment };
}

export async function getRole(roleId: string) {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      company: true,
      criteria: { orderBy: { sortOrder: "asc" } },
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        include: { hackathon: { select: { title: true, slug: true, startsAt: true, endsAt: true, status: true } }, invoice: true },
      },
      hires: { include: { candidate: { select: { name: true } }, invoice: true }, orderBy: { reportedAt: "desc" } },
    },
  });
  if (!role) return null;
  return { ...role, requiredSkills: parseJson<string[]>(role.requiredSkills, []) };
}

/** Hiring cohorts a role can still join: upcoming or open, not ended, not already enrolled. */
export async function getEnrollableCohorts(roleId: string) {
  return prisma.hackathon.findMany({
    where: {
      type: "HIRING_COHORT",
      status: { in: ["UPCOMING", "OPEN"] },
      endsAt: { gte: new Date() },
      enrollments: { none: { roleId } },
    },
    orderBy: { startsAt: "asc" },
    select: { id: true, title: true, slug: true, tagline: true, startsAt: true, submissionDeadline: true, endsAt: true, status: true },
  });
}

/**
 * Shortlist entries in the order they were added. Never sorted by score (DESIGN.md D4).
 * Companies see identity for their own shortlist (brief 4.4).
 */
export async function getShortlist(roleId: string) {
  const shortlist = await prisma.shortlist.findUnique({
    where: { roleId },
    include: {
      entries: {
        where: { status: { not: "WITHDRAWN" } },
        orderBy: { addedAt: "asc" },
        include: {
          candidate: { select: { id: true, name: true, username: true } },
          project: {
            select: {
              id: true,
              title: true,
              tagline: true,
              verified: true,
              hackathon: { select: { title: true } },
              interviews: { where: { OR: [{ roleId: null }, { roleId }] }, orderBy: { scheduledAt: "desc" }, take: 1, select: { status: true, outcome: true, scheduledAt: true, candidateId: true } },
            },
          },
        },
      },
    },
  });
  return shortlist?.entries ?? [];
}

/** Active shortlist candidates for the hire form, in the order they were added. */
export async function getHireCandidates(roleId: string) {
  const entries = await prisma.shortlistEntry.findMany({
    where: { shortlist: { roleId }, status: "ACTIVE" },
    orderBy: { addedAt: "asc" },
    include: { candidate: { select: { id: true, name: true } }, project: { select: { title: true } } },
  });
  return entries.map((e) => ({ id: e.candidate.id, label: `${e.candidate.name ?? "unnamed candidate"} (${e.project.title})` }));
}

export async function getCompanyWithMembers(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: { members: { orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, name: true, email: true } } } } },
  });
}

export async function getCompanyRoles(companyId: string) {
  return prisma.role.findMany({ where: { companyId, status: { in: ["OPEN", "PAUSED"] } }, orderBy: { createdAt: "asc" }, select: { id: true, title: true } });
}
