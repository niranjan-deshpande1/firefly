import { describe, expect, it } from "vitest";
import { isValidTimeZone, timeZoneList, utcToZonedLocal, zonedLocalToUtc } from "@/lib/organize/time";
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

  it("lists IANA zones including UTC", () => {
    const zones = timeZoneList();
    expect(zones).toContain("UTC");
    expect(zones).toContain("America/Los_Angeles");
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
