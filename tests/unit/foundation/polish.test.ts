// Validation and noise rules from the QA polish list: fees, demo video links, posting before the start,
// status date order, audit dedupe and the build day count.
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ auditLog: { findFirst: vi.fn(), create: vi.fn() } }));
vi.mock("@/lib/db", () => ({ prisma: db, toJson: (v: unknown) => JSON.stringify(v) }));

import { settingsSchema } from "@/lib/settings";
import { hasStarted, projectInputSchema } from "@/lib/projects/schema";
import { statusDateBlocker } from "@/lib/organize/schemas";
import { ACCESS_DEDUPE_MS, auditAccess } from "@/lib/audit";
import { buildDay } from "@/lib/participation/logic";
import { templateLabel } from "@/lib/admin/labels";

const valid = { flatFeeCents: 100_000, hireFeeBps: 500, attributionWindowMonths: 12, retentionMonths: 12 };
const issue = (input: unknown) => {
  const r = settingsSchema.safeParse(input);
  return r.success ? null : r.error.issues[0];
};

describe("settings", () => {
  it("refuses a cohort fee under $1 and a 0% hire fee", () => {
    expect(issue({ ...valid, flatFeeCents: 0 })?.message).toBe("the cohort fee is below $1, enter 1 or more.");
    expect(issue({ ...valid, flatFeeCents: 99 })?.path).toEqual(["flatFeeCents"]);
    expect(issue({ ...valid, hireFeeBps: 0 })?.message).toMatch(/^the hire fee is 0%/);
    expect(issue({ ...valid, flatFeeCents: 100, hireFeeBps: 1 })).toBeNull();
  });

  it("says a zero window is too small, and only a big one too high", () => {
    expect(issue({ ...valid, attributionWindowMonths: 0 })?.message).toBe("the window is under a month, enter 1 or more.");
    expect(issue({ ...valid, attributionWindowMonths: 61 })?.message).toMatch(/smaller number/);
  });
});

describe("project links", () => {
  const base = { projectId: null, hackathonId: "h1", title: "t", tagline: "", story: "", builtWith: [], links: [], repoUrl: "", videoUrl: "", teamId: null, intent: "draft" as const };

  it("takes only https demo video and repo links", () => {
    const http = projectInputSchema.safeParse({ ...base, videoUrl: "http://example.com/v" });
    expect(http.success).toBe(false);
    expect(http.error?.issues[0].path).toEqual(["videoUrl"]);
    expect(projectInputSchema.safeParse({ ...base, repoUrl: "http://example.com/r" }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...base, videoUrl: "https://example.com/v" }).success).toBe(true);
  });

  it("keeps other links http or https, as their hint says", () => {
    expect(projectInputSchema.safeParse({ ...base, links: [{ label: "site", url: "http://example.com" }] }).success).toBe(true);
  });

  it("allows posting from the start time on", () => {
    const start = new Date("2026-10-05T16:00:00Z");
    expect(hasStarted(start, new Date("2026-10-05T15:59:59Z"))).toBe(false);
    expect(hasStarted(start, start)).toBe(true);
  });
});

describe("statusDateBlocker", () => {
  const h = {
    registrationOpensAt: new Date("2026-10-01T16:00:00Z"),
    submissionDeadline: new Date("2026-10-20T16:00:00Z"),
    timeZone: "America/Los_Angeles",
    cohortConfig: { defenseWindowStart: new Date("2026-10-25T16:00:00Z") },
  };
  const at = (iso: string) => new Date(iso);

  it("refuses later statuses before their date and names the date", () => {
    expect(statusDateBlocker("OPEN", h, at("2026-09-30T00:00:00Z"))).toMatch(/until registration opens on 1 oct, 09:00 America\/Los_Angeles/);
    expect(statusDateBlocker("JUDGING", h, at("2026-10-10T00:00:00Z"))).toMatch(/until the posting deadline passes on 20 oct/);
    expect(statusDateBlocker("COMPLETED", h, at("2026-10-10T00:00:00Z"))).toMatch(/20 oct/);
    expect(statusDateBlocker("DEFENSE", h, at("2026-10-22T00:00:00Z"))).toMatch(/defense window opens on 25 oct/);
  });

  it("allows them once the date passes, and always allows draft and upcoming", () => {
    expect(statusDateBlocker("JUDGING", h, at("2026-10-21T00:00:00Z"))).toBeNull();
    expect(statusDateBlocker("DEFENSE", { ...h, cohortConfig: null }, at("2026-10-21T00:00:00Z"))).toBeNull();
    expect(statusDateBlocker("DRAFT", h, at("2026-09-01T00:00:00Z"))).toBeNull();
    expect(statusDateBlocker("UPCOMING", h, at("2026-09-01T00:00:00Z"))).toBeNull();
  });
});

describe("auditAccess dedupe", () => {
  const reviewer = { id: "r1", role: "REVIEWER" as const };
  beforeEach(() => {
    db.auditLog.findFirst.mockReset();
    db.auditLog.create.mockReset();
  });

  it("skips a transcript view already logged for the same person and resource in the window", async () => {
    db.auditLog.findFirst.mockResolvedValue({ id: "a1" });
    expect(await auditAccess(reviewer, "TRANSCRIPT_VIEW", "cand", { type: "AITranscript", id: "t1" })).toBe(false);
    expect(db.auditLog.create).not.toHaveBeenCalled();
    const where = db.auditLog.findFirst.mock.calls[0][0].where;
    expect(where).toMatchObject({ actorId: "r1", action: "TRANSCRIPT_VIEW", resourceType: "AITranscript", resourceId: "t1" });
    expect(Date.now() - where.createdAt.gte.getTime()).toBeGreaterThanOrEqual(ACCESS_DEDUPE_MS - 1000);
  });

  it("writes an evidence view when none is recent", async () => {
    db.auditLog.findFirst.mockResolvedValue(null);
    expect(await auditAccess(reviewer, "EVIDENCE_VIEW", "cand", { type: "Project", id: "p1" })).toBe(true);
    expect(db.auditLog.create).toHaveBeenCalledOnce();
  });

  it("always writes report views and identity reveals", async () => {
    db.auditLog.findFirst.mockResolvedValue({ id: "a1" });
    expect(await auditAccess(reviewer, "REPORT_VIEW", "cand", { type: "CandidateReport", id: "c1" })).toBe(true);
    expect(await auditAccess(reviewer, "IDENTITY_REVEAL", "cand", { type: "Review", id: "v1" })).toBe(true);
    expect(db.auditLog.findFirst).not.toHaveBeenCalled();
    expect(db.auditLog.create).toHaveBeenCalledTimes(2);
  });
});

describe("buildDay in the hackathon's zone", () => {
  const zone = "America/Los_Angeles";
  it("counts a start late yesterday as day 2 today", () => {
    const start = new Date("2026-10-02T01:00:00Z"); // 1 oct, 18:00 in Los Angeles
    const deadline = new Date("2026-10-16T00:00:00Z"); // 15 oct, 17:00
    const now = new Date("2026-10-02T17:00:00Z"); // 2 oct, 10:00, under 24 hours later
    expect(buildDay(start, deadline, now, zone)).toEqual({ day: 2, total: 15 });
  });

  it("uses the zone's calendar date, not UTC's", () => {
    const start = new Date("2026-10-01T16:00:00Z");
    const deadline = new Date("2026-10-15T16:00:00Z");
    // 2 oct 02:00 UTC is still 1 oct in Los Angeles.
    expect(buildDay(start, deadline, new Date("2026-10-02T02:00:00Z"), zone)?.day).toBe(1);
    expect(buildDay(start, deadline, new Date("2026-10-02T02:00:00Z"), "UTC")?.day).toBe(2);
  });
});

describe("templateLabel", () => {
  it("names email templates in words", () => {
    expect(templateLabel("submissionReceived")).toBe("project posted");
    expect(templateLabel("someNewTemplate")).toBe("some new template");
  });
});
