import { beforeEach, describe, expect, it, vi } from "vitest";

const count = (n: number) => ({ count: n });
const prisma = {
  feedback: { findMany: vi.fn(), updateMany: vi.fn() },
  hackathon: { findMany: vi.fn() },
  shortlistEntry: { findMany: vi.fn() },
  project: { findMany: vi.fn() },
  aITranscript: { findMany: vi.fn(), deleteMany: vi.fn() },
  storedFile: { findMany: vi.fn() },
  decisionLogEntry: { deleteMany: vi.fn() },
  commit: { deleteMany: vi.fn() },
  repoSnapshot: { deleteMany: vi.fn() },
  evidenceSummary: { deleteMany: vi.fn() },
  candidateReport: { deleteMany: vi.fn() },
  checkIn: { deleteMany: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
};

vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/audit", () => ({ audit: vi.fn() }));
vi.mock("@/lib/storage", () => ({ deleteStoredFile: vi.fn() }));
vi.mock("@/lib/settings", () => ({ getSettings: vi.fn(async () => ({ retentionMonths: 12 })) }));

const { releaseHeldFeedback, enforceRetention, retentionCutoff } = await import("@/lib/jobs");
const { sendEmail } = await import("@/lib/email");
const { audit } = await import("@/lib/audit");
const { deleteStoredFile } = await import("@/lib/storage");

const NOW = new Date("2026-10-03T12:00:00Z");
const row = (id: string, email: string | null = `${id}@example.test`) => ({ id, projectId: `p-${id}`, candidate: { email, name: "Test Builder" } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("releaseHeldFeedback", () => {
  it("queries only feedback that is visible and not yet emailed", async () => {
    prisma.feedback.findMany.mockResolvedValue([]);
    await releaseHeldFeedback(NOW);
    expect(prisma.feedback.findMany.mock.calls[0][0].where).toEqual({ visibleAt: { lte: NOW }, notifiedAt: null });
  });

  it("claims each row before emailing and sets notifiedAt", async () => {
    prisma.feedback.findMany.mockResolvedValue([row("f1")]);
    prisma.feedback.updateMany.mockResolvedValue(count(1));
    const result = await releaseHeldFeedback(NOW);
    expect(prisma.feedback.updateMany).toHaveBeenCalledWith({ where: { id: "f1", notifiedAt: null }, data: { notifiedAt: NOW } });
    expect(sendEmail).toHaveBeenCalledWith("f1@example.test", "feedbackReady", { name: "Test Builder" }, { projectId: "p-f1" });
    expect(prisma.feedback.updateMany.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(sendEmail).mock.invocationCallOrder[0]);
    expect(result).toEqual({ feedbackEmails: 1 });
  });

  it("skips a row another run already claimed, so nothing is sent twice", async () => {
    prisma.feedback.findMany.mockResolvedValue([row("f1"), row("f2")]);
    prisma.feedback.updateMany.mockResolvedValueOnce(count(0)).mockResolvedValueOnce(count(1));
    const result = await releaseHeldFeedback(NOW);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toBe("f2@example.test");
    expect(result.feedbackEmails).toBe(1);
  });

  it("marks a candidate with no email as handled without sending", async () => {
    prisma.feedback.findMany.mockResolvedValue([row("f1", null)]);
    prisma.feedback.updateMany.mockResolvedValue(count(1));
    expect(await releaseHeldFeedback(NOW)).toEqual({ feedbackEmails: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("releases the claim when the email fails, so the next run retries", async () => {
    prisma.feedback.findMany.mockResolvedValue([row("f1")]);
    prisma.feedback.updateMany.mockResolvedValue(count(1));
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("db down"));
    await expect(releaseHeldFeedback(NOW)).rejects.toThrow("db down");
    expect(prisma.feedback.updateMany).toHaveBeenLastCalledWith({ where: { id: "f1", notifiedAt: NOW }, data: { notifiedAt: null } });
  });
});

describe("enforceRetention", () => {
  function arrange() {
    prisma.hackathon.findMany.mockResolvedValue([{ id: "h-old" }]);
    prisma.shortlistEntry.findMany.mockResolvedValue([{ projectId: "p-hired", candidateId: "u-hired", project: { hackathonId: "h-old" } }]);
    prisma.project.findMany.mockResolvedValue([{ id: "p-a" }, { id: "p-b" }]);
    prisma.aITranscript.findMany.mockResolvedValue([{ fileId: "file-1" }, { fileId: "file-gone" }]);
    prisma.storedFile.findMany.mockResolvedValue([{ id: "file-1" }]);
    for (const model of [prisma.aITranscript, prisma.decisionLogEntry, prisma.commit, prisma.repoSnapshot, prisma.evidenceSummary, prisma.candidateReport, prisma.checkIn]) {
      model.deleteMany.mockResolvedValue(count(2));
    }
  }

  it("subtracts the retention months from now", () => {
    expect(retentionCutoff(NOW, 12).toISOString()).toBe("2025-10-03T12:00:00.000Z");
    // Month ends clamp: 31 march minus one month is 28 february (date only, so the machine time zone does not matter).
    expect(retentionCutoff(new Date("2026-03-31T12:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-02-28");
  });

  it("only touches hackathons that ended before the cutoff", async () => {
    arrange();
    await enforceRetention(NOW);
    expect(prisma.hackathon.findMany.mock.calls[0][0].where).toEqual({ endsAt: { lt: new Date("2025-10-03T12:00:00Z") } });
  });

  it("keeps evidence of projects someone was hired from and the hired builder's check-ins", async () => {
    arrange();
    await enforceRetention(NOW);
    expect(prisma.project.findMany.mock.calls[0][0].where).toEqual({ hackathonId: { in: ["h-old"] }, id: { notIn: ["p-hired"] } });
    expect(prisma.commit.deleteMany).toHaveBeenCalledWith({ where: { projectId: { in: ["p-a", "p-b"] } } });
    expect(prisma.checkIn.deleteMany).toHaveBeenCalledWith({
      where: { hackathonId: { in: ["h-old"] }, NOT: [{ hackathonId: "h-old", userId: "u-hired" }] },
    });
  });

  it("deletes stored transcript files that still exist, then writes one audit entry with the counts", async () => {
    arrange();
    const counts = await enforceRetention(NOW, "admin-1");
    expect(deleteStoredFile).toHaveBeenCalledTimes(1);
    expect(deleteStoredFile).toHaveBeenCalledWith("file-1");
    expect(counts).toMatchObject({ hackathons: 1, projects: 2, files: 1, transcripts: 2, checkIns: 2 });
    expect(audit).toHaveBeenCalledTimes(1);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ actorId: "admin-1", action: "RETENTION_RUN", metadata: expect.objectContaining({ retentionMonths: 12, projects: 2 }) }));
  });
});
