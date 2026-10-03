import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = {
  review: { upsert: vi.fn(async () => ({ id: "rev1" })) },
  reviewScore: { deleteMany: vi.fn(), createMany: vi.fn() },
  decision: { create: vi.fn(async () => ({ id: "dec1" })) },
  shortlist: { upsert: vi.fn(async ({ where }: { where: { roleId: string } }) => ({ id: `sl-${where.roleId}` })) },
  shortlistEntry: { findUnique: vi.fn(async () => null), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
};
const prisma = {
  review: { findUnique: vi.fn(async () => null) },
  $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
};

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn(async () => ({ id: "r1", role: "REVIEWER" })) }));
vi.mock("@/lib/permissions", () => ({
  authorize: vi.fn(async () => undefined),
  check: vi.fn(async () => true),
  ForbiddenError: class extends Error {},
}));
vi.mock("@/lib/audit", () => ({ audit: vi.fn(), auditAccess: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/db", async () => {
  const enums = await vi.importActual<object>("@/lib/db/enums");
  const json = await vi.importActual<object>("@/lib/db/json");
  return { ...enums, ...json, prisma };
});

const project = {
  id: "p1",
  ownerId: "u1",
  owner: { id: "u1", name: "Test Builder", email: "builder@example.test" },
  team: null,
  hackathon: { enrollments: [{ roleId: "role1" }, { roleId: "role2" }], cohortConfig: null },
};
const calibration = { reviews: [{}, {}], notes: [] as { dimensionKey: string }[], flags: [] as string[] };

vi.mock("@/lib/review/queries", async () => {
  const actual = await vi.importActual<typeof import("@/lib/review/queries")>("@/lib/review/queries");
  return {
    projectCandidates: actual.projectCandidates,
    loadProject: vi.fn(async () => project),
    scoreItems: vi.fn(async () => [
      { key: "A", name: "A", dimensionId: "dA" },
      { key: "B", name: "B", dimensionId: "dB" },
    ]),
    loadEvidence: vi.fn(async () => ({ options: [{ kind: "COMMIT", id: "k1", label: "abc1234 init" }] })),
    calibrationState: vi.fn(async () => calibration),
  };
});

const { saveReview, makeDecision } = await import("@/lib/review/actions");
const { audit } = await import("@/lib/audit");
const { sendEmail } = await import("@/lib/email");

const score = (key: string, over: object = {}) => ({ key, score: 3, rationale: "named the tradeoff", evidenceRefs: [{ kind: "COMMIT" as const, id: "k1" }], ...over });

beforeEach(() => {
  vi.clearAllMocks();
  calibration.flags = [];
  calibration.notes = [];
  calibration.reviews = [{}, {}];
});

describe("saveReview", () => {
  it("refuses to post when a score has no rationale or no evidence", async () => {
    const result = await saveReview({ projectId: "p1", kind: "RUBRIC", intent: "post", scores: [score("A", { rationale: "" }), score("B", { evidenceRefs: [] })] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.problems ?? {})).toEqual(["A", "B"]);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it("drops evidence that isn't the project's own, so a forged ref can't satisfy the rule", async () => {
    const result = await saveReview({ projectId: "p1", kind: "RUBRIC", intent: "post", scores: [score("A"), score("B", { evidenceRefs: [{ kind: "COMMIT", id: "other-project" }] })] });
    expect(result.ok).toBe(false);
  });

  it("saves an incomplete draft without auditing", async () => {
    const result = await saveReview({ projectId: "p1", kind: "RUBRIC", intent: "draft", scores: [score("A", { rationale: "" })] });
    expect(result.ok).toBe(true);
    expect(tx.review.upsert).toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it("posts a complete review and audits REVIEW_SUBMITTED", async () => {
    const result = await saveReview({ projectId: "p1", kind: "RUBRIC", intent: "post", scores: [score("A"), score("B")] });
    expect(result.ok).toBe(true);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "REVIEW_SUBMITTED", subjectUserId: "u1" }));
  });
});

describe("makeDecision", () => {
  it("is refused while a flagged gap has no reconciliation note", async () => {
    calibration.flags = ["A"];
    const result = await makeDecision({ projectId: "p1", outcome: "ADVANCE", reason: "strong defense prep" });
    expect(result.ok).toBe(false);
    expect(tx.decision.create).not.toHaveBeenCalled();
  });

  it("requires a written reason", async () => {
    const result = await makeDecision({ projectId: "p1", outcome: "HOLD", reason: "  " });
    expect(result.ok).toBe(false);
  });

  it("on advance, shortlists the candidate for every enrolled role, audits and emails", async () => {
    calibration.flags = ["A"];
    calibration.notes = [{ dimensionKey: "A" }];
    const result = await makeDecision({ projectId: "p1", outcome: "ADVANCE", reason: "clear verification habit" });
    expect(result.ok).toBe(true);
    expect(tx.shortlist.upsert).toHaveBeenCalledTimes(2);
    expect(tx.shortlistEntry.create).toHaveBeenCalledTimes(2);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "DECISION_MADE" }));
    expect(sendEmail).toHaveBeenCalledWith("builder@example.test", "decisionMade", expect.objectContaining({ outcome: "advance" }), expect.anything());
  });

  it("does not touch shortlists on don't advance", async () => {
    const result = await makeDecision({ projectId: "p1", outcome: "REJECT", reason: "core flow did not run" });
    expect(result.ok).toBe(true);
    expect(tx.shortlist.upsert).not.toHaveBeenCalled();
    // An earlier advance is undone: companies lose access to the report.
    expect(tx.shortlistEntry.updateMany).toHaveBeenCalledWith({ where: { projectId: "p1", status: "ACTIVE" }, data: { status: "WITHDRAWN" } });
  });
});
