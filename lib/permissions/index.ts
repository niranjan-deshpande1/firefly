import "server-only";
import { notFound, redirect } from "next/navigation";
import { prisma, type UserRole } from "@/lib/db";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { can, type Action, type Facts } from "./rules";

export { can, needsAccessAudit, ACTIONS, type Action, type Facts, type Actor } from "./rules";

export class ForbiddenError extends Error {
  constructor(message = "You don't have access to this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Page guard: redirects to sign-in when signed out, 404s when the role isn't allowed. */
export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (roles.length > 0 && user.role !== "ADMIN" && !roles.includes(user.role)) notFound();
  return user;
}

/** Action guard: throws ForbiddenError instead of redirecting (for server actions and route handlers). */
export async function requireRoleForAction(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Sign in first.");
  if (roles.length > 0 && user.role !== "ADMIN" && !roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

export type ResourceRef = {
  projectId?: string;
  hackathonId?: string;
  companyId?: string;
  roleId?: string;
  candidateId?: string; // the candidate user the resource is about
  subjectUserId?: string; // profile/privacy owner
};

/** Loads every relationship fact the rules need for one resource. */
export async function loadFacts(user: CurrentUser | null, ref: ResourceRef): Promise<Facts> {
  const facts: Facts = {};
  const now = new Date();

  const project = ref.projectId
    ? await prisma.project.findUnique({
        where: { id: ref.projectId },
        select: {
          id: true,
          ownerId: true,
          status: true,
          hackathonId: true,
          team: { select: { members: { select: { userId: true } } } },
          hackathon: { select: { organizerId: true, status: true } },
        },
      })
    : null;
  const hackathonId = ref.hackathonId ?? project?.hackathonId;
  const hackathon = hackathonId
    ? await prisma.hackathon.findUnique({ where: { id: hackathonId }, select: { organizerId: true, status: true } })
    : null;

  const candidateId = ref.candidateId ?? project?.ownerId;
  if (project) facts.isPublic = project.status === "SUBMITTED";
  else if (hackathon && !ref.subjectUserId) facts.isPublic = hackathon.status !== "DRAFT";
  if (hackathon) facts.resultsPublished = hackathon.status === "COMPLETED";

  if (!user) return facts;

  facts.isSelf = !!(ref.subjectUserId ? ref.subjectUserId === user.id : candidateId === user.id);
  if (hackathon) facts.isHackathonOrganizer = hackathon.organizerId === user.id;

  if (project) {
    facts.isProjectMember = project.ownerId === user.id || !!project.team?.members.some((m) => m.userId === user.id);
    const [assignment, judge, interviewer, review] = await Promise.all([
      prisma.reviewerAssignment.findUnique({ where: { projectId_reviewerId: { projectId: project.id, reviewerId: user.id } } }),
      prisma.judgeAssignment.findFirst({
        where: { judgeId: user.id, hackathonId: project.hackathonId, OR: [{ projectId: null }, { projectId: project.id }] },
      }),
      prisma.interviewInterviewer.findFirst({ where: { userId: user.id, interview: { projectId: project.id } } }),
      prisma.review.findFirst({ where: { projectId: project.id, reviewerId: user.id, kind: "RUBRIC", status: "SUBMITTED" } }),
    ]);
    facts.isAssignedReviewer = !!assignment;
    facts.isAssignedJudge = !!judge;
    facts.isAssignedInterviewer = !!interviewer;
    facts.reviewSubmitted = !!review;
  }

  if (user.role === "COMPANY") {
    const memberships = await prisma.companyMember.findMany({ where: { userId: user.id }, select: { companyId: true } });
    const companyIds = memberships.map((m) => m.companyId);
    let resourceCompanyId = ref.companyId;
    if (!resourceCompanyId && ref.roleId) {
      resourceCompanyId = (await prisma.role.findUnique({ where: { id: ref.roleId }, select: { companyId: true } }))?.companyId;
    }
    facts.isCompanyMember = resourceCompanyId ? companyIds.includes(resourceCompanyId) : false;
    if (candidateId && companyIds.length > 0) {
      const entry = await prisma.shortlistEntry.findFirst({
        where: {
          candidateId,
          status: { not: "WITHDRAWN" },
          shortlist: { role: { companyId: { in: companyIds }, ...(ref.roleId ? { id: ref.roleId } : {}) } },
        },
      });
      facts.isOnCompanyShortlist = !!entry;
    }
    const enrollment = await prisma.cohortEnrollment.findFirst({
      where: { companyId: { in: companyIds }, hackathon: { endsAt: { gte: now } } },
    });
    facts.hasActiveEnrollment = !!enrollment;
  }

  return facts;
}

/** Loads facts and checks one action. */
export async function check(user: CurrentUser | null, action: Action, ref: ResourceRef = {}): Promise<boolean> {
  return can(user, action, await loadFacts(user, ref));
}

/** For pages: 404 when not allowed (no hint the resource exists). */
export async function authorizePage(user: CurrentUser | null, action: Action, ref: ResourceRef = {}): Promise<void> {
  if (!(await check(user, action, ref))) notFound();
}

/** For server actions and route handlers: throws ForbiddenError when not allowed. */
export async function authorize(user: CurrentUser | null, action: Action, ref: ResourceRef = {}): Promise<void> {
  if (!(await check(user, action, ref))) throw new ForbiddenError();
}
