import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  hackathon: { findUnique: vi.fn() },
  update: { create: vi.fn() },
  registration: { findMany: vi.fn() },
  project: { findFirst: vi.fn() },
  user: { findUnique: vi.fn() },
  reviewerAssignment: { create: vi.fn() },
}));
const sendEmail = vi.hoisted(() => vi.fn());
const audit = vi.hoisted(() => vi.fn());
const currentUser = vi.hoisted(() => ({ value: { id: "o1", role: "ORGANIZER" } as { id: string; role: string } | null }));

vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/email", () => ({ sendEmail }));
vi.mock("@/lib/audit", () => ({ audit }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => currentUser.value }));
vi.mock("@/lib/permissions", async () => {
  const rules = await import("@/lib/permissions/rules");
  class ForbiddenError extends Error {}
  return {
    ForbiddenError,
    requireRole: vi.fn(),
    authorizePage: vi.fn(),
    requireRoleForAction: async () => {
      const u = currentUser.value;
      if (!u || (u.role !== "ORGANIZER" && u.role !== "ADMIN")) throw new ForbiddenError("you don't have access to this, sign in with an account that does.");
      return u;
    },
    // Facts: organizer of h1 only.
    authorize: async (u: { id: string; role: "ORGANIZER" }, action: "hackathon.manage", ref: { hackathonId?: string }) => {
      if (!rules.can(u, action, { isHackathonOrganizer: u.id === "o1" && ref.hackathonId === "h1" })) throw new ForbiddenError("no access");
    },
  };
});

import { postUpdate, assignReviewer } from "@/lib/organize/actions/people";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  currentUser.value = { id: "o1", role: "ORGANIZER" };
  db.hackathon.findUnique.mockResolvedValue({ id: "h1", slug: "spring", title: "Spring Build", type: "HIRING_COHORT", status: "OPEN", cohortConfig: null });
});

describe("postUpdate", () => {
  it("logs one hackathonUpdate email per active registrant", async () => {
    db.update.create.mockResolvedValue({ id: "u1" });
    db.registration.findMany.mockResolvedValue([{ user: { id: "c1", email: "a@example.com" } }, { user: { id: "c2", email: "b@example.com" } }]);
    const r = await postUpdate({ ok: true }, form({ hackathonId: "h1", title: "kickoff moved", body: "now at 10:00" }));
    expect(r).toEqual({ ok: true, message: "update posted, 2 emails logged" });
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith("a@example.com", "hackathonUpdate", { hackathon: "Spring Build", title: "kickoff moved", body: "now at 10:00" }, expect.objectContaining({ updateId: "u1" }));
    expect(audit).toHaveBeenCalledWith({ actorId: "o1", action: "UPDATE_POSTED", resourceType: "Hackathon", resourceId: "h1", metadata: { updateId: "u1", emails: 2 } });
  });

  it("refuses an organizer who does not run the hackathon", async () => {
    currentUser.value = { id: "o2", role: "ORGANIZER" };
    const r = await postUpdate({ ok: true }, form({ hackathonId: "h1", title: "t", body: "b" }));
    expect(r.ok).toBe(false);
    expect(db.update.create).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });

  it("refuses a reviewer outright", async () => {
    currentUser.value = { id: "r1", role: "REVIEWER" };
    const r = await postUpdate({ ok: true }, form({ hackathonId: "h1", title: "t", body: "b" }));
    expect(r.ok).toBe(false);
  });

  it("returns field errors beside empty fields before touching the database", async () => {
    const r = await postUpdate({ ok: true }, form({ hackathonId: "h1", title: "", body: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors ?? {})).toEqual(["title", "body"]);
    expect(db.hackathon.findUnique).not.toHaveBeenCalled();
  });
});

describe("assignReviewer", () => {
  it("blocks a third reviewer", async () => {
    db.project.findFirst.mockResolvedValue({ ownerId: "c1", team: null, reviewerAssignments: [{ reviewerId: "r1" }, { reviewerId: "r2" }] });
    db.user.findUnique.mockResolvedValue({ role: "REVIEWER" });
    const r = await assignReviewer({ ok: true }, form({ hackathonId: "h1", projectId: "p1", reviewerId: "r3" }));
    expect(r.ok).toBe(false);
    expect(db.reviewerAssignment.create).not.toHaveBeenCalled();
  });

  it("assigns a reviewer to a project with room", async () => {
    db.project.findFirst.mockResolvedValue({ ownerId: "c1", team: null, reviewerAssignments: [{ reviewerId: "r1" }] });
    db.user.findUnique.mockResolvedValue({ role: "REVIEWER" });
    db.reviewerAssignment.create.mockResolvedValue({ id: "ra1" });
    const r = await assignReviewer({ ok: true }, form({ hackathonId: "h1", projectId: "p1", reviewerId: "r2" }));
    expect(r).toEqual({ ok: true, message: "reviewer assigned" });
    expect(db.reviewerAssignment.create).toHaveBeenCalledWith({ data: { projectId: "p1", reviewerId: "r2" }, select: { id: true } });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "REVIEWER_ASSIGNED", resourceId: "h1", metadata: { assignmentId: "ra1", projectId: "p1", reviewerId: "r2" } }));
  });
});
