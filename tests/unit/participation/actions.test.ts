// Orchestration tests for participation actions: permission, closed states, duplicates, email.
// Prisma, auth, email and Next are mocked; the permission rules are the real ones.
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const DAY = 86_400_000;
const now = Date.now();
const d = (days: number) => new Date(now + days * DAY);

const db = vi.hoisted(() => ({
  hackathon: { findUnique: vi.fn() },
  registration: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  candidateProfile: { findUnique: vi.fn() },
  checkIn: { findMany: vi.fn(), create: vi.fn() },
  project: { findFirst: vi.fn() },
  team: { findUnique: vi.fn(), create: vi.fn() },
  teamMember: { findFirst: vi.fn(), create: vi.fn() },
  teamInvite: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn(async (ops: unknown[]) => ops),
}));
const auth = vi.hoisted(() => ({ user: null as null | { id: string; role: string; name: string; email: string } }));
const sendEmail = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ prisma: db, parseJson: (v: string | null, f: unknown) => (v ? JSON.parse(v) : f) }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => auth.user }));
vi.mock("@/lib/email", () => ({ sendEmail }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/permissions", async () => {
  const rules = await vi.importActual<typeof import("@/lib/permissions/rules")>("@/lib/permissions/rules");
  class ForbiddenError extends Error {}
  return {
    ...rules,
    ForbiddenError,
    authorize: async (user: Parameters<typeof rules.can>[0], action: Parameters<typeof rules.can>[1], ref: { subjectUserId?: string }) => {
      if (!rules.can(user, action, { isSelf: !!user && ref.subjectUserId === user.id })) throw new ForbiddenError("you don't have access to this.");
    },
  };
});

const { postCheckIn, registerForHackathon, inviteToTeam, respondToInvite } = await import("@/lib/participation/actions");

const maya = { id: "u1", role: "CANDIDATE", name: "Maya Chen", email: "maya@example.test" };
const cohort = {
  id: "h1",
  slug: "fall",
  title: "Fall Builders Cohort",
  type: "HIRING_COHORT",
  status: "OPEN",
  teamPolicy: "SOLO",
  maxTeamSize: 1,
  eligibility: "- 18 or older\n- able to work in the US",
  registrationOpensAt: d(-20),
  startsAt: d(-8),
  submissionDeadline: d(6),
  endsAt: d(20),
  cohortConfig: { checkInSchedule: "[]", defenseWindowStart: d(8), defenseWindowEnd: d(12), resultsAt: d(15) },
};
const form = (fields: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) for (const item of [v].flat()) f.append(k, item);
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.user = maya;
  db.hackathon.findUnique.mockResolvedValue(cohort);
  db.registration.findUnique.mockResolvedValue({ id: "r1", status: "REGISTERED" });
  db.candidateProfile.findUnique.mockResolvedValue({ consentAt: d(-30) });
  db.checkIn.findMany.mockResolvedValue([]);
  db.project.findFirst.mockResolvedValue({ id: "p1" });
});

describe("postCheckIn", () => {
  // Day 8 of 14 with no schedule: week 1 closed at day 7, week 2 is open.
  it("posts the open week and confirms with a toast line", async () => {
    const r = await postCheckIn(null, form({ hackathonId: "h1", week: "2", progress: "shipped the import", hoursSpent: "10" }));
    expect(r).toEqual({ ok: true, message: "check-in posted" });
    expect(db.checkIn.create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: "u1", week: 2, projectId: "p1", hoursSpent: 10, blockers: null }) });
  });

  it("refuses a week that isn't open", async () => {
    const r = await postCheckIn(null, form({ hackathonId: "h1", week: "1", progress: "late" }));
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/^week 1 isn't open/) });
    expect(db.checkIn.create).not.toHaveBeenCalled();
  });

  it("turns the one-per-week unique constraint into a sentence", async () => {
    db.checkIn.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "6" }));
    const r = await postCheckIn(null, form({ hackathonId: "h1", week: "2", progress: "again" }));
    expect(r).toMatchObject({ ok: false, error: "your week 2 check-in is already posted, read it below." });
  });

  it("keeps the error beside the empty field", async () => {
    const r = await postCheckIn(null, form({ hackathonId: "h1", week: "2", progress: " " }));
    expect(r).toMatchObject({ ok: false, field: "progress" });
  });

  it("is candidate only", async () => {
    auth.user = { ...maya, role: "REVIEWER" };
    const r = await postCheckIn(null, form({ hackathonId: "h1", week: "2", progress: "x" }));
    expect(r).toMatchObject({ ok: false });
    expect(db.checkIn.create).not.toHaveBeenCalled();
  });
});

describe("registerForHackathon", () => {
  beforeEach(() => db.registration.findUnique.mockResolvedValue(null));

  it("registers, emails registrationConfirmed and redirects to the dashboard", async () => {
    await registerForHackathon(null, form({ hackathonId: "h1", eligibility: ["0", "1"] }));
    expect(db.registration.upsert).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith("maya@example.test", "registrationConfirmed", { name: "Maya Chen", hackathon: "Fall Builders Cohort" }, { hackathonId: "h1" });
    expect(redirect).toHaveBeenCalledWith("/dashboard?registered=fall");
  });

  it("requires every eligibility statement", async () => {
    const r = await registerForHackathon(null, form({ hackathonId: "h1", eligibility: ["0"] }));
    expect(r).toMatchObject({ ok: false, field: "eligibility" });
    expect(db.registration.upsert).not.toHaveBeenCalled();
  });

  it("requires consent", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ consentAt: null });
    const r = await registerForHackathon(null, form({ hackathonId: "h1", eligibility: ["0", "1"] }));
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/consent/) });
  });

  it("blocks completed hackathons with one sentence", async () => {
    db.hackathon.findUnique.mockResolvedValue({ ...cohort, status: "COMPLETED" });
    const r = await registerForHackathon(null, form({ hackathonId: "h1", eligibility: ["0", "1"] }));
    expect(r).toEqual({ ok: false, error: "this hackathon has ended, browse the open hackathons instead.", field: undefined });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("team invites", () => {
  const openHackathon = { ...cohort, id: "h2", slug: "spring", type: "OPEN", teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 3 };

  beforeEach(() => {
    db.hackathon.findUnique.mockResolvedValue(openHackathon);
    db.team.findUnique.mockResolvedValue({ id: "t1", name: "night owls", hackathonId: "h2", members: [{ userId: "u1" }], invites: [] });
    db.user.findUnique.mockResolvedValue({ id: "u2", name: "Leo Park", email: "leo@example.test", role: "CANDIDATE" });
    db.teamMember.findFirst.mockResolvedValue(null);
  });

  it("invites a registered builder by username and emails teamInvite", async () => {
    const r = await inviteToTeam(null, form({ teamId: "t1", username: "@LeoPark" }));
    expect(r).toEqual({ ok: true, message: "invite sent to leopark" });
    expect(db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { username: "leopark" } }));
    expect(sendEmail).toHaveBeenCalledWith("leo@example.test", "teamInvite", { name: "Leo Park", team: "night owls", from: "Maya Chen" }, { teamId: "t1" });
  });

  it("only lets team members invite", async () => {
    db.team.findUnique.mockResolvedValue({ id: "t1", name: "night owls", hackathonId: "h2", members: [{ userId: "someone" }], invites: [] });
    const r = await inviteToTeam(null, form({ teamId: "t1", username: "leopark" }));
    expect(r).toMatchObject({ ok: false });
    expect(db.teamInvite.create).not.toHaveBeenCalled();
  });

  it("respects maxTeamSize, counting open invites", async () => {
    db.team.findUnique.mockResolvedValue({ id: "t1", name: "night owls", hackathonId: "h2", members: [{ userId: "u1" }, { userId: "u3" }], invites: [{ toUserId: "u4" }] });
    const r = await inviteToTeam(null, form({ teamId: "t1", username: "leopark" }));
    expect(r).toMatchObject({ ok: false, field: "username" });
  });

  it("refuses teams on hiring cohorts", async () => {
    db.hackathon.findUnique.mockResolvedValue({ ...openHackathon, type: "HIRING_COHORT" });
    const r = await inviteToTeam(null, form({ teamId: "t1", username: "leopark" }));
    expect(r).toMatchObject({ ok: false, error: "this hackathon doesn't take teams, build solo instead." });
  });

  it("only the invitee can answer an invite", async () => {
    db.teamInvite.findUnique.mockResolvedValue({ id: "i1", status: "PENDING", toUserId: "u2", team: { id: "t1", name: "night owls", hackathonId: "h2", _count: { members: 1 } } });
    const r = await respondToInvite(null, form({ inviteId: "i1", response: "ACCEPTED" }));
    expect(r).toMatchObject({ ok: false });
    expect(db.teamMember.create).not.toHaveBeenCalled();
  });

  it("joins the team when the invitee accepts", async () => {
    db.teamInvite.findUnique.mockResolvedValue({ id: "i1", status: "PENDING", toUserId: "u1", team: { id: "t1", name: "night owls", hackathonId: "h2", _count: { members: 1 } } });
    const r = await respondToInvite(null, form({ inviteId: "i1", response: "ACCEPTED" }));
    expect(r).toEqual({ ok: true, message: "you joined night owls" });
    expect(db.teamMember.create).toHaveBeenCalledWith({ data: { teamId: "t1", userId: "u1" } });
  });
});
