import { describe, expect, it } from "vitest";
import { ACTIONS, can, needsAccessAudit, type Actor } from "@/lib/permissions/rules";

const candidate: Actor = { id: "c1", role: "CANDIDATE" };
const company: Actor = { id: "co1", role: "COMPANY" };
const reviewer: Actor = { id: "r1", role: "REVIEWER" };
const organizer: Actor = { id: "o1", role: "ORGANIZER" };
const admin: Actor = { id: "a1", role: "ADMIN" };

describe("can", () => {
  it("lets admins do every action", () => {
    for (const action of ACTIONS) expect(can(admin, action)).toBe(true);
  });

  it("denies signed-out users everything except public views", () => {
    expect(can(null, "hackathon.view", { isPublic: true })).toBe(true);
    expect(can(null, "project.view", { isPublic: true })).toBe(true);
    expect(can(null, "project.view", { isPublic: false })).toBe(false);
    for (const action of ACTIONS.filter((a) => a !== "hackathon.view" && a !== "project.view")) {
      expect(can(null, action, { isPublic: true, isSelf: true })).toBe(false);
    }
  });

  it("keeps admin-only actions admin-only", () => {
    for (const actor of [candidate, company, reviewer, organizer]) {
      expect(can(actor, "admin.access", { isSelf: true, isCompanyMember: true })).toBe(false);
      expect(can(actor, "invoice.markPaid", { isCompanyMember: true })).toBe(false);
    }
  });

  describe("company reports and evidence", () => {
    it("allows a member to view a report only for candidates on its own shortlist", () => {
      expect(can(company, "report.view", { isCompanyMember: true, isOnCompanyShortlist: true })).toBe(true);
      expect(can(company, "report.view", { isCompanyMember: true, isOnCompanyShortlist: false })).toBe(false);
      expect(can(company, "report.view", { isCompanyMember: false, isOnCompanyShortlist: true })).toBe(false);
    });

    it("allows evidence only for shortlisted candidates", () => {
      expect(can(company, "evidence.view", { isOnCompanyShortlist: true })).toBe(true);
      expect(can(company, "evidence.view", {})).toBe(false);
    });

    it("allows the talent pool only with an active enrollment", () => {
      expect(can(company, "talentPool.browse", { hasActiveEnrollment: true })).toBe(true);
      expect(can(company, "talentPool.browse", { hasActiveEnrollment: false })).toBe(false);
      expect(can(candidate, "talentPool.browse", { hasActiveEnrollment: true })).toBe(false);
    });
  });

  describe("reviewers", () => {
    it("can score, calibrate and decide only on assigned projects", () => {
      for (const action of ["review.score", "review.calibrate", "review.decide", "feedback.write"] as const) {
        expect(can(reviewer, action, { isAssignedReviewer: true })).toBe(true);
        expect(can(reviewer, action, { isAssignedReviewer: false })).toBe(false);
      }
    });

    it("can open evidence only when assigned as reviewer or interviewer", () => {
      expect(can(reviewer, "evidence.view", { isAssignedReviewer: true })).toBe(true);
      expect(can(reviewer, "evidence.view", { isAssignedInterviewer: true })).toBe(true);
      expect(can(reviewer, "evidence.view", {})).toBe(false);
    });

    it("can reveal identity only after submitting their own review", () => {
      expect(can(reviewer, "identity.reveal", { isAssignedReviewer: true, reviewSubmitted: false })).toBe(false);
      expect(can(reviewer, "identity.reveal", { isAssignedReviewer: true, reviewSubmitted: true })).toBe(true);
    });

    it("can run only interviews they are assigned to", () => {
      expect(can(reviewer, "interview.run", { isAssignedInterviewer: true })).toBe(true);
      expect(can(reviewer, "interview.run", {})).toBe(false);
    });
  });

  describe("candidates", () => {
    it("see their own evidence and nobody else's", () => {
      expect(can(candidate, "evidence.view", { isProjectMember: true })).toBe(true);
      expect(can(candidate, "evidence.view", { isOnCompanyShortlist: true, isAssignedReviewer: true })).toBe(false);
    });

    it("can't score, decide or see reports", () => {
      for (const action of ["review.score", "review.decide", "report.view", "shortlist.view"] as const) {
        expect(can(candidate, action, { isAssignedReviewer: true, isCompanyMember: true, isOnCompanyShortlist: true })).toBe(false);
      }
    });

    it("read feedback only after results", () => {
      expect(can(candidate, "feedback.read", { isSelf: true, resultsPublished: false })).toBe(false);
      expect(can(candidate, "feedback.read", { isSelf: true, resultsPublished: true })).toBe(true);
      expect(can(candidate, "feedback.read", { isSelf: false, resultsPublished: true })).toBe(false);
    });
  });

  describe("organizers", () => {
    it("manage only their own hackathons", () => {
      expect(can(organizer, "hackathon.create")).toBe(true);
      expect(can(organizer, "hackathon.manage", { isHackathonOrganizer: true })).toBe(true);
      expect(can(organizer, "hackathon.manage", { isHackathonOrganizer: false })).toBe(false);
      expect(can(organizer, "winner.pick", { isHackathonOrganizer: true })).toBe(true);
      expect(can(organizer, "comment.moderate", { isHackathonOrganizer: false })).toBe(false);
    });

    it("can't see candidate evidence or reports", () => {
      expect(can(organizer, "evidence.view", { isHackathonOrganizer: true })).toBe(false);
      expect(can(organizer, "report.view", { isHackathonOrganizer: true })).toBe(false);
    });
  });
});

describe("needsAccessAudit", () => {
  it("audits everyone except the candidate themself", () => {
    expect(needsAccessAudit(company, "c1")).toBe(true);
    expect(needsAccessAudit(admin, "c1")).toBe(true);
    expect(needsAccessAudit(candidate, "c1")).toBe(false);
    expect(needsAccessAudit(null, "c1")).toBe(false);
  });
});

describe("integration rule changes", () => {
  const companyMember = { id: "c1", role: "COMPANY" as const };
  it("lets an assigned company panelist run the interview, and no one else", () => {
    expect(can(companyMember, "interview.run", { isAssignedInterviewer: true })).toBe(true);
    expect(can(companyMember, "interview.run", {})).toBe(false);
  });
  it("lets team members manage their team", () => {
    expect(can({ id: "u1", role: "CANDIDATE" }, "team.manage", { isTeamMember: true })).toBe(true);
    expect(can({ id: "u1", role: "CANDIDATE" }, "team.manage", {})).toBe(false);
  });
});

describe("review fixes", () => {
  it("lets only the hackathon's own organizer schedule interviews", () => {
    expect(can(organizer, "interview.schedule", { isHackathonOrganizer: true })).toBe(true);
    expect(can(organizer, "interview.schedule", {})).toBe(false);
    expect(can(reviewer, "interview.schedule", { isAssignedReviewer: true })).toBe(true);
  });
  it("lets only the hackathon's own organizer cancel, reschedule and handle interview requests", () => {
    expect(can(organizer, "interview.manage", { isHackathonOrganizer: true })).toBe(true);
    expect(can(organizer, "interview.manage", {})).toBe(false);
    expect(can(admin, "interview.manage")).toBe(true);
    for (const actor of [candidate, company, reviewer]) {
      expect(can(actor, "interview.manage", { isHackathonOrganizer: true, isAssignedReviewer: true, isAssignedInterviewer: true, isCompanyMember: true })).toBe(false);
    }
  });
  it("locks evidence edits after the submission deadline", () => {
    expect(can(candidate, "evidence.edit", { isProjectMember: true })).toBe(true);
    expect(can(candidate, "evidence.edit", { isProjectMember: true, evidenceLocked: true })).toBe(false);
  });
});
