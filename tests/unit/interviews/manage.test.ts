import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  interview: { findUnique: vi.fn(), updateMany: vi.fn() },
  interviewRequest: { findUnique: vi.fn(), updateMany: vi.fn() },
  project: { findFirst: vi.fn() },
  user: { findUnique: vi.fn() },
}));
const sendEmail = vi.hoisted(() => vi.fn());
const audit = vi.hoisted(() => vi.fn());
const currentUser = vi.hoisted(() => ({ value: { id: "o1", role: "ORGANIZER" } as { id: string; role: string } | null }));

vi.mock("@/lib/db", () => ({ prisma: db, INTERVIEW_MODES: ["IN_PERSON", "VIDEO"] }));
vi.mock("@/lib/email", () => ({ sendEmail }));
vi.mock("@/lib/audit", () => ({ audit }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/permissions", async () => {
  const rules = await import("@/lib/permissions/rules");
  class ForbiddenError extends Error {}
  return {
    ForbiddenError,
    requireRoleForAction: async () => {
      const u = currentUser.value;
      if (!u || (u.role !== "ORGANIZER" && u.role !== "ADMIN")) throw new ForbiddenError("you don't have access to this, sign in with an account that does.");
      return u;
    },
    // Facts: o1 organizes the hackathon of project p1 only.
    authorize: async (u: { id: string; role: "ORGANIZER" }, action: "interview.manage", ref: { projectId?: string }) => {
      if (!rules.can(u, action, { isHackathonOrganizer: u.id === "o1" && ref.projectId === "p1" })) throw new ForbiddenError("no access");
    },
  };
});

import { cancelInterview, declineInterviewRequest, rescheduleInterview } from "@/lib/interviews/manage";

const interview = (status = "SCHEDULED") => ({
  id: "i1",
  projectId: "p1",
  candidateId: "c1",
  status,
  scheduledAt: new Date("2030-01-10T18:00:00Z"),
  timeZone: "America/Los_Angeles",
  durationMin: 75,
  mode: "IN_PERSON",
  location: "room 4",
  videoLink: null,
  candidate: { name: "Test Candidate", email: "candidate@example.com" },
  interviewers: [{ user: { name: "Panel One", email: "panel1@example.com" } }, { user: { name: "Panel Two", email: null } }],
});

beforeEach(() => {
  vi.clearAllMocks();
  currentUser.value = { id: "o1", role: "ORGANIZER" };
  db.interview.findUnique.mockResolvedValue(interview());
  db.interview.updateMany.mockResolvedValue({ count: 1 });
});

describe("cancelInterview", () => {
  it("cancels conditionally on an open status, audits, and emails the candidate and panel", async () => {
    const r = await cancelInterview({ interviewId: "i1", reason: "the candidate is ill" });
    expect(r).toEqual({ ok: true });
    expect(db.interview.updateMany).toHaveBeenCalledWith({
      where: { id: "i1", status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      data: { status: "CANCELLED", notes: "cancelled: the candidate is ill" },
    });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "INTERVIEW_CANCELLED", resourceId: "i1", subjectUserId: "c1" }));
    expect(sendEmail.mock.calls.map((c) => c[0])).toEqual(["candidate@example.com", "panel1@example.com"]);
    expect(sendEmail).toHaveBeenCalledWith("candidate@example.com", "interviewCancelled", expect.objectContaining({ reason: "the candidate is ill" }), { interviewId: "i1" });
  });

  it("requires a reason before touching the database", async () => {
    const r = await cancelInterview({ interviewId: "i1", reason: "  " });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/reason is empty/) });
    expect(db.interview.findUnique).not.toHaveBeenCalled();
  });

  it("refuses a completed interview", async () => {
    db.interview.findUnique.mockResolvedValue(interview("COMPLETED"));
    const r = await cancelInterview({ interviewId: "i1", reason: "x" });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/can't be cancelled/) });
    expect(db.interview.updateMany).not.toHaveBeenCalled();
  });

  it("changes nothing when the panel completed it a moment ago", async () => {
    db.interview.updateMany.mockResolvedValue({ count: 0 });
    const r = await cancelInterview({ interviewId: "i1", reason: "x" });
    expect(r.ok).toBe(false);
    expect(audit).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses an organizer of another hackathon and a reviewer", async () => {
    currentUser.value = { id: "o2", role: "ORGANIZER" };
    expect((await cancelInterview({ interviewId: "i1", reason: "x" })).ok).toBe(false);
    currentUser.value = { id: "r1", role: "REVIEWER" };
    expect((await cancelInterview({ interviewId: "i1", reason: "x" })).ok).toBe(false);
    expect(db.interview.updateMany).not.toHaveBeenCalled();
  });

  it("lets an admin cancel", async () => {
    currentUser.value = { id: "a1", role: "ADMIN" };
    expect(await cancelInterview({ interviewId: "i1", reason: "x" })).toEqual({ ok: true });
  });
});

describe("rescheduleInterview", () => {
  const input = { interviewId: "i1", localTime: "2030-02-01T09:00", durationMin: 60, mode: "VIDEO" as const, videoLink: "https://meet.example.com/abc" };

  it("keeps the zone, updates conditionally, audits and emails", async () => {
    const r = await rescheduleInterview(input);
    expect(r).toEqual({ ok: true });
    expect(db.interview.updateMany).toHaveBeenCalledWith({
      where: { id: "i1", status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      data: { scheduledAt: new Date("2030-02-01T17:00:00.000Z"), durationMin: 60, mode: "VIDEO", location: null, videoLink: "https://meet.example.com/abc" },
    });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "INTERVIEW_RESCHEDULED" }));
    expect(sendEmail).toHaveBeenCalledWith("panel1@example.com", "interviewRescheduled", expect.objectContaining({ minutes: 60, name: "Panel One" }), { interviewId: "i1" });
  });

  it("refuses a time in the past", async () => {
    const r = await rescheduleInterview({ ...input, localTime: "2020-01-01T09:00" });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/already passed/) });
    expect(db.interview.updateMany).not.toHaveBeenCalled();
  });

  it("refuses a video interview without an https link", async () => {
    const r = await rescheduleInterview({ ...input, videoLink: "meet" });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/https link/) });
  });

  it("refuses a completed interview", async () => {
    db.interview.findUnique.mockResolvedValue(interview("COMPLETED"));
    const r = await rescheduleInterview(input);
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/can't be rescheduled/) });
  });
});

describe("declineInterviewRequest", () => {
  const request = (status = "PENDING") => ({
    id: "q1",
    status,
    candidateId: "c1",
    requestedById: "m1",
    role: { title: "Founding Engineer" },
    company: { name: "Example Co" },
    candidate: { candidateProfile: { blindCode: "7F3A" } },
  });

  beforeEach(() => {
    db.interviewRequest.findUnique.mockResolvedValue(request());
    db.interviewRequest.updateMany.mockResolvedValue({ count: 1 });
    db.project.findFirst.mockResolvedValue({ id: "p1" });
    db.user.findUnique.mockResolvedValue({ name: "Requester", email: "requester@example.com" });
  });

  it("declines conditionally, audits the reason and emails the requester", async () => {
    const r = await declineInterviewRequest({ requestId: "q1", reason: "the candidate withdrew" });
    expect(r).toEqual({ ok: true });
    expect(db.project.findFirst).toHaveBeenCalledWith({ where: { ownerId: "c1", hackathon: { organizerId: "o1" } }, select: { id: true } });
    expect(db.interviewRequest.updateMany).toHaveBeenCalledWith({ where: { id: "q1", status: "PENDING" }, data: { status: "DECLINED" } });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "INTERVIEW_REQUEST_DECLINED", metadata: expect.objectContaining({ reason: "the candidate withdrew" }) }));
    expect(sendEmail).toHaveBeenCalledWith(
      "requester@example.com",
      "interviewRequestDeclined",
      { name: "Requester", company: "Example Co", role: "Founding Engineer", candidateCode: "7F3A", reason: "the candidate withdrew" },
      { requestId: "q1" },
    );
  });

  it("requires a reason", async () => {
    expect((await declineInterviewRequest({ requestId: "q1", reason: "" })).ok).toBe(false);
    expect(db.interviewRequest.findUnique).not.toHaveBeenCalled();
  });

  it("refuses an organizer with no hackathon for this candidate", async () => {
    db.project.findFirst.mockResolvedValue(null);
    expect((await declineInterviewRequest({ requestId: "q1", reason: "x" })).ok).toBe(false);
    expect(db.interviewRequest.updateMany).not.toHaveBeenCalled();
  });

  it("refuses a request that is already handled", async () => {
    db.interviewRequest.findUnique.mockResolvedValue(request("SCHEDULED"));
    const r = await declineInterviewRequest({ requestId: "q1", reason: "x" });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/already handled/) });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
