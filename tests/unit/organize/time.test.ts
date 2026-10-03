import { describe, expect, it } from "vitest";
import { isValidTimeZone, utcToZonedLocal, zonedLocalToUtc, zoneOptions } from "@/lib/organize/time";
import { basicsSchema, changedFields, datesSchema } from "@/lib/organize/schemas";
import { milestones, nextMilestone } from "@/lib/organize/milestones";
import { defaultCohortConfig, defaultDates } from "@/lib/organize/defaults";

describe("zoned time", () => {
  it("round-trips wall time through UTC in summer and winter", () => {
    for (const local of ["2026-07-22T09:30", "2026-01-05T09:00"]) {
      const utc = zonedLocalToUtc(local, "America/Los_Angeles");
      expect(utc).not.toBeNull();
      expect(utcToZonedLocal(utc as Date, "America/Los_Angeles")).toBe(local);
    }
    expect(zonedLocalToUtc("2026-07-22T09:30", "America/Los_Angeles")?.toISOString()).toBe("2026-07-22T16:30:00.000Z");
    expect(zonedLocalToUtc("2026-07-22T09:30", "Asia/Kolkata")?.toISOString()).toBe("2026-07-22T04:00:00.000Z");
  });

  it("rejects malformed input, impossible dates and unknown zones", () => {
    expect(zonedLocalToUtc("2026-02-31T09:00", "UTC")).toBeNull();
    expect(zonedLocalToUtc("tomorrow", "UTC")).toBeNull();
    expect(zonedLocalToUtc("2026-07-22T09:30", "PST")).toBeNull();
    expect(isValidTimeZone("Europe/Berlin")).toBe(true);
    expect(isValidTimeZone("Nowhere/Land")).toBe(false);
  });

  it("offers the curated zones plus a valid current zone outside them", () => {
    expect(zoneOptions()).toContain("UTC");
    expect(zoneOptions("America/Los_Angeles")).toEqual(zoneOptions());
    expect(zoneOptions("Pacific/Auckland")[0]).toBe("Pacific/Auckland");
    expect(zoneOptions("Nowhere/Land")).toEqual(zoneOptions());
  });
});

describe("hackathon time zone", () => {
  const basics = { title: "Spring Build", slug: "spring-build", type: "OPEN", tagline: "build things", description: "" };

  it("accepts an IANA zone in basics and rejects anything else beside the field", () => {
    expect(basicsSchema.safeParse({ ...basics, timeZone: "Asia/Kolkata" }).success).toBe(true);
    const bad = basicsSchema.safeParse({ ...basics, timeZone: "PST" });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].path).toEqual(["timeZone"]);
    expect(basicsSchema.safeParse(basics).success).toBe(false);
  });

  it("reads organizer dates in the hackathon's zone", () => {
    const local = { registrationOpensAt: "2026-07-01T09:00", startsAt: "2026-07-10T09:00", submissionDeadline: "2026-07-24T17:00", endsAt: "2026-07-25T17:00" };
    const la = datesSchema.parse({ ...local, timeZone: "America/Los_Angeles" });
    const berlin = datesSchema.parse({ ...local, timeZone: "Europe/Berlin" });
    expect(la.startsAt.toISOString()).toBe("2026-07-10T16:00:00.000Z");
    expect(berlin.startsAt.toISOString()).toBe("2026-07-10T07:00:00.000Z");
  });
});

describe("changedFields", () => {
  it("names only changed keys and compares dates by instant", () => {
    const prev = { title: "a", startsAt: new Date("2026-07-10T00:00:00Z"), timeZone: "UTC" };
    expect(changedFields(prev, { title: "a", startsAt: new Date("2026-07-10T00:00:00Z"), timeZone: "Asia/Tokyo" })).toEqual(["timeZone"]);
    expect(changedFields(prev, { title: "b" })).toEqual(["title"]);
  });
});

describe("milestones", () => {
  const h = {
    registrationOpensAt: new Date("2026-07-01T00:00:00Z"),
    startsAt: new Date("2026-07-10T00:00:00Z"),
    submissionDeadline: new Date("2026-07-24T00:00:00Z"),
    endsAt: new Date("2026-08-10T00:00:00Z"),
    cohortConfig: {
      defenseWindowStart: new Date("2026-07-27T00:00:00Z"),
      defenseWindowEnd: new Date("2026-08-03T00:00:00Z"),
      resultsAt: new Date("2026-08-06T00:00:00Z"),
    },
  };

  it("orders every date including the cohort ones", () => {
    expect(milestones(h).map((m) => m.label)).toEqual([
      "registration opens",
      "starts",
      "projects due",
      "defense window opens",
      "defense window closes",
      "results",
      "ends",
    ]);
  });

  it("finds the next date, or none once all have passed", () => {
    expect(nextMilestone(h, new Date("2026-07-25T00:00:00Z"))?.label).toBe("defense window opens");
    expect(nextMilestone(h, new Date("2027-01-01T00:00:00Z"))).toBeNull();
  });

  it("gives new drafts dates in order", () => {
    const d = defaultDates(new Date("2026-10-03T10:15:00Z"));
    expect(d.registrationOpensAt < d.startsAt && d.startsAt < d.submissionDeadline && d.submissionDeadline < d.endsAt).toBe(true);
    const c = defaultCohortConfig(d.submissionDeadline);
    expect(d.submissionDeadline < c.defenseWindowStart && c.defenseWindowStart < c.defenseWindowEnd && c.defenseWindowEnd < c.resultsAt).toBe(true);
  });
});
