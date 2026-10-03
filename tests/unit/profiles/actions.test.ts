import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  candidateProfile: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  companyMember: { count: vi.fn(), findMany: vi.fn(async () => []) },
  cohortEnrollment: { findFirst: vi.fn() },
  project: { findFirst: vi.fn() },
  dataRequest: { findFirst: vi.fn(), create: vi.fn() },
  $transaction: vi.fn(),
}));
const current = vi.hoisted(() => ({ user: null as null | { id: string; role: string; username: string | null } }));
const audit = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn((to: string) => { throw new Error(`REDIRECT ${to}`); }));

vi.mock("@/lib/db", async () => ({ ...(await vi.importActual<object>("@/lib/db/enums")), ...(await vi.importActual<object>("@/lib/db/json")), prisma: db }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => current.user }));
vi.mock("@/lib/audit", () => ({ audit }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect, notFound: vi.fn() }));

import { chooseRole, recordConsent, requestDeletion, saveProfile, setTalentPoolOptIn, setVisibility } from "@/lib/profiles/actions";
import { CONSENT_VERSION } from "@/lib/profiles";

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

beforeEach(() => {
  vi.clearAllMocks();
  current.user = { id: "u1", role: "CANDIDATE", username: null };
});

describe("requestDeletion", () => {
  it("creates one DELETE request and audits it", async () => {
    db.dataRequest.findFirst.mockResolvedValue(null);
    db.dataRequest.create.mockResolvedValue({ id: "dr1" });
    expect(await requestDeletion()).toEqual({ ok: true });
    expect(db.dataRequest.create).toHaveBeenCalledWith({ data: { userId: "u1", kind: "DELETE" } });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ action: "DATA_REQUEST_CREATED", resourceId: "dr1", subjectUserId: "u1" }));
  });
  it("does not duplicate an open request", async () => {
    db.dataRequest.findFirst.mockResolvedValue({ id: "dr1" });
    expect(await requestDeletion()).toEqual({ ok: true });
    expect(db.dataRequest.create).not.toHaveBeenCalled();
  });
  it("returns an error when signed out", async () => {
    current.user = null;
    expect((await requestDeletion()).ok).toBe(false);
  });
});

describe("privacy toggles", () => {
  it("reject values outside the allowed set", async () => {
    expect((await setVisibility("EVERYONE")).ok).toBe(false);
    expect(db.candidateProfile.update).not.toHaveBeenCalled();
  });
  it("save the talent pool opt-in on the caller's own profile when they finished a cohort", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ id: "p1" });
    db.project.findFirst.mockResolvedValue({ id: "proj-1" });
    expect(await setTalentPoolOptIn(true)).toEqual({ ok: true });
    expect(db.project.findFirst).toHaveBeenCalledWith({
      where: { ownerId: "u1", status: "SUBMITTED", hackathon: { type: "HIRING_COHORT", status: "COMPLETED" } },
      select: { id: true },
    });
    expect(db.candidateProfile.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { talentPoolOptIn: true } });
  });
  it("refuse the opt-in without a finished cohort project", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ id: "p1" });
    db.project.findFirst.mockResolvedValue(null);
    const result = await setTalentPoolOptIn(true);
    expect(result.ok).toBe(false);
    expect(db.candidateProfile.update).not.toHaveBeenCalled();
  });
  it("always allow leaving the talent pool", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ id: "p1" });
    expect(await setTalentPoolOptIn(false)).toEqual({ ok: true });
    expect(db.project.findFirst).not.toHaveBeenCalled();
    expect(db.candidateProfile.update).toHaveBeenCalledWith({ where: { id: "p1" }, data: { talentPoolOptIn: false } });
  });
  it("are builder-only", async () => {
    current.user = { id: "u2", role: "COMPANY", username: null };
    expect((await setTalentPoolOptIn(true)).ok).toBe(false);
  });
});

describe("recordConsent", () => {
  it("refuses a stale consent version", async () => {
    const result = await recordConsent(null, form({ version: "2020-01-01" }));
    expect(result.ok).toBe(false);
    expect(db.candidateProfile.create).not.toHaveBeenCalled();
  });
  it("creates the profile with a blind code, version and time, then follows a safe next", async () => {
    db.candidateProfile.findUnique.mockResolvedValue(null);
    db.user.findUnique.mockResolvedValue(null);
    await expect(recordConsent(null, form({ version: CONSENT_VERSION, next: "/hackathons/x/register" }))).rejects.toThrow("REDIRECT /hackathons/x/register");
    const data = db.candidateProfile.create.mock.calls[0][0].data;
    expect(data.blindCode).toMatch(/^[0-9A-F]{4}$/);
    expect(data.consentVersion).toBe(CONSENT_VERSION);
    expect(data.consentAt).toBeInstanceOf(Date);
  });
  it("ignores an off-site next", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ id: "p1" });
    await expect(recordConsent(null, form({ version: CONSENT_VERSION, next: "//evil.test" }))).rejects.toThrow("REDIRECT /dashboard");
  });
});

describe("chooseRole", () => {
  it("lets a new person become a company member", async () => {
    db.candidateProfile.findUnique.mockResolvedValue(null);
    db.companyMember.count.mockResolvedValue(0);
    await expect(chooseRole(null, form({ role: "COMPANY" }))).rejects.toThrow("REDIRECT /company");
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "u1" }, data: { role: "COMPANY" } });
  });
  it("blocks switching after builder consent", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ consentAt: new Date() });
    db.companyMember.count.mockResolvedValue(0);
    expect((await chooseRole(null, form({ role: "COMPANY" }))).ok).toBe(false);
    expect(db.user.update).not.toHaveBeenCalled();
  });
  it("never grants staff roles", async () => {
    expect((await chooseRole(null, form({ role: "ADMIN" }))).ok).toBe(false);
  });
});

describe("saveProfile", () => {
  const fields = { name: "Maya Chen", username: "maya", headline: "", bio: "", skills: "Go", links: "", location: "", school: "", experienceLevel: "" };
  it("refuses a username someone else holds", async () => {
    db.candidateProfile.findUnique.mockResolvedValue({ id: "p1" });
    db.user.findUnique.mockResolvedValue({ id: "someone-else" });
    const result = await saveProfile(null, form(fields));
    expect(result).toEqual({ ok: false, error: "maya is taken, choose another username.", field: "username" });
  });
  it("only saves the name for people without a builder profile", async () => {
    current.user = { id: "u2", role: "COMPANY", username: null };
    db.candidateProfile.findUnique.mockResolvedValue(null);
    expect(await saveProfile(null, form(fields))).toEqual({ ok: true });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "u2" }, data: { name: "Maya Chen" } });
  });
});
