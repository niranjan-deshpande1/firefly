import { describe, expect, it } from "vitest";
import {
  applyTeamPolicy,
  basicsSchema,
  checkInSlotSchema,
  datesSchema,
  dollarsToCents,
  formatSchema,
  officeHourSchema,
  parseThemes,
  prizeSchema,
  removeAt,
  resourceSchema,
  reviewerBlocker,
  scheduleItemSchema,
  slugify,
  upsertCheckIn,
  winnerBlocker,
} from "@/lib/organize/schemas";

const LA = "America/Los_Angeles";

describe("basics", () => {
  const base = { title: "Spring Build", slug: "spring-build", type: "OPEN", tagline: "build a tool", description: "", timeZone: "America/Los_Angeles" };

  it("accepts a valid slug and rejects bad ones beside the slug field", () => {
    expect(basicsSchema.safeParse(base).success).toBe(true);
    for (const slug of ["Spring", "a", "spring--build", "-spring", "spring build", "spring_build"]) {
      const r = basicsSchema.safeParse({ ...base, slug });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0].path).toEqual(["slug"]);
    }
  });

  it("rejects an unknown type", () => {
    expect(basicsSchema.safeParse({ ...base, type: "PRIVATE" }).success).toBe(false);
  });

  it("suggests slugs from titles", () => {
    expect(slugify("The Spring Build 2026")).toBe("the-spring-build-2026");
    expect(slugify("  Café & Code!  ")).toBe("cafe-code");
  });
});

describe("dates", () => {
  const ok = { timeZone: LA, registrationOpensAt: "2026-07-01T09:00", startsAt: "2026-07-10T09:00", submissionDeadline: "2026-07-24T17:00", endsAt: "2026-07-31T17:00" };

  it("stores times in UTC, read in the chosen zone", () => {
    const r = datesSchema.parse(ok);
    expect(r.startsAt.toISOString()).toBe("2026-07-10T16:00:00.000Z");
    const london = datesSchema.parse({ ...ok, timeZone: "Europe/London" });
    expect(london.startsAt.toISOString()).toBe("2026-07-10T08:00:00.000Z");
  });

  it("rejects an unknown zone and out-of-order dates against the right field", () => {
    const zone = datesSchema.safeParse({ ...ok, timeZone: "Mars/Olympus" });
    expect(zone.success).toBe(false);
    const order = datesSchema.safeParse({ ...ok, submissionDeadline: "2026-07-09T09:00" });
    expect(order.success).toBe(false);
    if (!order.success) expect(order.error.issues[0].path).toEqual(["submissionDeadline"]);
  });
});

describe("format and team policy", () => {
  it("forces hiring cohorts and solo events to one builder", () => {
    expect(applyTeamPolicy("HIRING_COHORT", { teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 4 })).toEqual({ teamPolicy: "SOLO", maxTeamSize: 1 });
    expect(applyTeamPolicy("OPEN", { teamPolicy: "SOLO", maxTeamSize: 4 })).toEqual({ teamPolicy: "SOLO", maxTeamSize: 1 });
    expect(applyTeamPolicy("OPEN", { teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 4 })).toEqual({ teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 4 });
  });

  it("needs a location in person and room for 2 when teams are allowed", () => {
    const base = { format: "ONLINE", teamPolicy: "TEAMS_ALLOWED", maxTeamSize: "4", themes: "ai, tools, ai" };
    const r = formatSchema.parse(base);
    expect(r.themes).toEqual(["ai", "tools"]);
    expect(r.location).toBeNull();
    expect(formatSchema.safeParse({ ...base, format: "IN_PERSON" }).success).toBe(false);
    expect(formatSchema.safeParse({ ...base, maxTeamSize: "1" }).success).toBe(false);
  });

  it("parses themes from commas and new lines", () => {
    expect(parseThemes("a,\nb , ,a")).toEqual(["a", "b"]);
  });
});

describe("cohort lists", () => {
  it("converts a check-in due time to UTC and replaces the same week", () => {
    const slot = checkInSlotSchema.parse({ timeZone: LA, week: "1", dueAt: "2026-07-17T17:00", prompt: "what did you decide" });
    expect(slot.dueAt).toBe("2026-07-18T00:00:00.000Z");
    const list = upsertCheckIn([{ week: 2, dueAt: "x", prompt: "b" }, { week: 1, dueAt: "y", prompt: "old" }], slot);
    expect(list.map((s) => s.week)).toEqual([1, 2]);
    expect(list[0].prompt).toBe("what did you decide");
    expect(removeAt(list, 0)).toEqual([list[1]]);
  });

  it("requires office hours to end after they start and the link to be a web address", () => {
    const ok = { timeZone: LA, startsAt: "2026-07-15T10:00", endsAt: "2026-07-15T11:00" };
    expect(officeHourSchema.parse(ok)).toEqual({ startsAt: "2026-07-15T17:00:00.000Z", endsAt: "2026-07-15T18:00:00.000Z" });
    expect(officeHourSchema.safeParse({ ...ok, endsAt: "2026-07-15T09:00" }).success).toBe(false);
    expect(officeHourSchema.safeParse({ ...ok, link: "javascript:alert(1)" }).success).toBe(false);
    expect(officeHourSchema.parse({ ...ok, link: "https://meet.example.com/x" }).link).toBe("https://meet.example.com/x");
  });
});

describe("items", () => {
  it("parses dollar amounts into cents", () => {
    expect(dollarsToCents("500")).toBe(50000);
    expect(dollarsToCents("$1,500.5")).toBe(150050);
    expect(dollarsToCents("-5")).toBeNull();
    expect(dollarsToCents("abc")).toBeNull();
    expect(prizeSchema.parse({ name: "best tool", value: "", quantity: "1", sortOrder: "0" }).value).toBeNull();
  });

  it("accepts office hours as a schedule kind with an optional end", () => {
    const r = scheduleItemSchema.parse({ timeZone: LA, kind: "OFFICE_HOURS", title: "drop in", startsAt: "2026-07-15T10:00", endsAt: "" });
    expect(r.endsAt).toBeNull();
    expect(r.startsAt.toISOString()).toBe("2026-07-15T17:00:00.000Z");
  });

  it("only accepts http and https resource links", () => {
    expect(resourceSchema.safeParse({ title: "docs", url: "https://example.com" }).success).toBe(true);
    expect(resourceSchema.safeParse({ title: "docs", url: "data:text/html,hi" }).success).toBe(false);
  });
});

describe("reviewer assignment", () => {
  const base = { reviewerRole: "REVIEWER", reviewerId: "r1", memberIds: ["c1"], assignedIds: [] as string[] };

  it("allows a reviewer or admin", () => {
    expect(reviewerBlocker(base)).toBeNull();
    expect(reviewerBlocker({ ...base, reviewerRole: "ADMIN" })).toBeNull();
  });

  it("blocks non-reviewers, the builder, duplicates and a third reviewer", () => {
    expect(reviewerBlocker({ ...base, reviewerRole: "ORGANIZER" })).toMatch(/only reviewers/);
    expect(reviewerBlocker({ ...base, reviewerRole: null })).toMatch(/only reviewers/);
    expect(reviewerBlocker({ ...base, reviewerId: "c1", reviewerRole: "REVIEWER" })).toMatch(/built this project/);
    expect(reviewerBlocker({ ...base, assignedIds: ["r1"] })).toMatch(/already assigned/);
    expect(reviewerBlocker({ ...base, assignedIds: ["r2", "r3"] })).toMatch(/already has 2/);
  });
});

describe("winner selection", () => {
  const base = {
    hackathonType: "OPEN",
    hackathonStatus: "JUDGING",
    hackathonId: "h1",
    projectHackathonId: "h1",
    projectStatus: "SUBMITTED",
    prizeQuantity: 1,
    winnerCount: 0,
    alreadyWon: false,
  };

  it("allows a posted project after judging starts", () => {
    expect(winnerBlocker(base)).toBeNull();
    expect(winnerBlocker({ ...base, hackathonStatus: "COMPLETED" })).toBeNull();
  });

  it("blocks cohorts, early picks, foreign or draft projects, repeats and full prizes", () => {
    expect(winnerBlocker({ ...base, hackathonType: "HIRING_COHORT" })).toMatch(/open hackathons/);
    expect(winnerBlocker({ ...base, hackathonStatus: "OPEN" })).toMatch(/after judging/);
    expect(winnerBlocker({ ...base, projectHackathonId: "h2" })).toMatch(/not a posted project/);
    expect(winnerBlocker({ ...base, projectStatus: "DRAFT" })).toMatch(/not a posted project/);
    expect(winnerBlocker({ ...base, alreadyWon: true })).toMatch(/already won/);
    expect(winnerBlocker({ ...base, winnerCount: 1 })).toMatch(/every place/);
  });
});
