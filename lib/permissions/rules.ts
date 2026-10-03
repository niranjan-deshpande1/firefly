// Pure permission rules (brief section 4.4). No database access here, so every rule is unit tested.
// Callers load the relationship facts with lib/permissions `loadFacts` and pass them in.
import type { UserRole } from "@/lib/db/enums";

export type Actor = { id: string; role: UserRole } | null;

export type Facts = {
  isSelf?: boolean; // the resource belongs to the actor (their profile, their data)
  isProjectMember?: boolean; // owner or team member of the project
  isAssignedReviewer?: boolean; // ReviewerAssignment for the project
  isAssignedJudge?: boolean; // JudgeAssignment for the project or its hackathon
  isAssignedInterviewer?: boolean; // InterviewInterviewer on an interview for the project
  isCompanyMember?: boolean; // member of the company that owns the role/report/invoice
  isOnCompanyShortlist?: boolean; // candidate is on a shortlist of a role owned by the actor's company
  hasActiveEnrollment?: boolean; // actor's company has an enrollment in a cohort that has not ended
  isHackathonOrganizer?: boolean; // organizer of the resource's hackathon
  reviewSubmitted?: boolean; // the actor's own review of this project is submitted
  resultsPublished?: boolean; // hackathon results are out
  isPublic?: boolean; // resource is publicly visible (submitted project, non-draft hackathon, public profile)
};

export const ACTIONS = [
  "hackathon.view",
  "hackathon.create",
  "hackathon.manage",
  "registration.create",
  "team.manage",
  "checkin.create",
  "checkin.view",
  "project.view",
  "project.edit",
  "project.like",
  "comment.create",
  "comment.moderate",
  "evidence.view",
  "evidence.edit",
  "review.score",
  "review.calibrate",
  "review.decide",
  "identity.reveal",
  "judge.score",
  "winner.pick",
  "feedback.write",
  "feedback.read",
  "interview.schedule",
  "interview.run",
  "company.manage",
  "role.manage",
  "cohort.enroll",
  "shortlist.view",
  "report.view",
  "talentPool.browse",
  "interviewRequest.create",
  "hire.report",
  "invoice.view",
  "invoice.markPaid",
  "profile.edit",
  "privacy.manage",
  "admin.access",
] as const;
export type Action = (typeof ACTIONS)[number];

type Rule = (actor: NonNullable<Actor>, f: Facts) => boolean;

const is = (actor: NonNullable<Actor>, ...roles: UserRole[]) => roles.includes(actor.role);

const RULES: Record<Action, Rule> = {
  "hackathon.view": (a, f) => !!f.isPublic || !!f.isHackathonOrganizer,
  "hackathon.create": (a) => is(a, "ORGANIZER"),
  "hackathon.manage": (a, f) => is(a, "ORGANIZER") && !!f.isHackathonOrganizer,
  "registration.create": (a) => is(a, "CANDIDATE"),
  "team.manage": (a, f) => is(a, "CANDIDATE") && !!f.isProjectMember,
  "checkin.create": (a, f) => is(a, "CANDIDATE") && !!f.isSelf,
  "checkin.view": (a, f) => !!f.isSelf || (is(a, "REVIEWER") && !!f.isAssignedReviewer),
  "project.view": (a, f) => !!f.isPublic || !!f.isProjectMember || !!f.isAssignedReviewer || !!f.isAssignedJudge || !!f.isHackathonOrganizer,
  "project.edit": (a, f) => is(a, "CANDIDATE") && !!f.isProjectMember,
  "project.like": (a, f) => !!f.isPublic,
  "comment.create": (a, f) => !!f.isPublic,
  "comment.moderate": (a, f) => is(a, "ORGANIZER") && !!f.isHackathonOrganizer,
  "evidence.view": (a, f) =>
    !!f.isProjectMember ||
    (is(a, "REVIEWER") && (!!f.isAssignedReviewer || !!f.isAssignedInterviewer)) ||
    (is(a, "COMPANY") && !!f.isOnCompanyShortlist),
  "evidence.edit": (a, f) => is(a, "CANDIDATE") && !!f.isProjectMember,
  "review.score": (a, f) => is(a, "REVIEWER") && !!f.isAssignedReviewer,
  "review.calibrate": (a, f) => is(a, "REVIEWER") && !!f.isAssignedReviewer,
  "review.decide": (a, f) => is(a, "REVIEWER") && !!f.isAssignedReviewer,
  "identity.reveal": (a, f) => is(a, "REVIEWER") && !!f.isAssignedReviewer && !!f.reviewSubmitted,
  "judge.score": (a, f) => is(a, "REVIEWER") && !!f.isAssignedJudge,
  "winner.pick": (a, f) => is(a, "ORGANIZER") && !!f.isHackathonOrganizer,
  "feedback.write": (a, f) => is(a, "REVIEWER") && !!f.isAssignedReviewer,
  "feedback.read": (a, f) => !!f.isSelf && !!f.resultsPublished,
  "interview.schedule": (a, f) => is(a, "ORGANIZER") || (is(a, "REVIEWER") && !!f.isAssignedReviewer),
  "interview.run": (a, f) => is(a, "REVIEWER") && !!f.isAssignedInterviewer,
  "company.manage": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "role.manage": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "cohort.enroll": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "shortlist.view": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "report.view": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember && !!f.isOnCompanyShortlist,
  "talentPool.browse": (a, f) => is(a, "COMPANY") && !!f.hasActiveEnrollment,
  "interviewRequest.create": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "hire.report": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "invoice.view": (a, f) => is(a, "COMPANY") && !!f.isCompanyMember,
  "invoice.markPaid": () => false, // admin only
  "profile.edit": (a, f) => !!f.isSelf,
  "privacy.manage": (a, f) => !!f.isSelf,
  "admin.access": () => false, // admin only
};

/** True when the actor may perform the action given the loaded facts. Admins can do everything. */
export function can(actor: Actor, action: Action, facts: Facts = {}): boolean {
  if (!actor) return action === "hackathon.view" || action === "project.view" ? !!facts.isPublic : false;
  if (actor.role === "ADMIN") return true;
  return RULES[action](actor, facts);
}

/** Should viewing this resource be written to the audit log? Anyone other than the candidate themself. */
export function needsAccessAudit(actor: Actor, subjectUserId: string | null | undefined): boolean {
  return !!actor && !!subjectUserId && actor.id !== subjectUserId;
}
