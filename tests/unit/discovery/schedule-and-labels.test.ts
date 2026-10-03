import { describe, expect, it } from "vitest";
import { buildSchedule } from "@/lib/discovery/schedule";
import { dateRange, isListedParticipant, safeUrl, statusLabel, typeLabel } from "@/lib/discovery/labels";
import { currentTabHref, tabItems } from "@/lib/discovery/tabs";

const d = (iso: string) => new Date(iso);

describe("buildSchedule", () => {
  const deadline = d("2026-10-20T07:00:00Z");

  it("adds the project deadline for an open hackathon and sorts by time", () => {
    const entries = buildSchedule({
      items: [{ id: "k", kind: "KICKOFF", title: "kickoff", description: null, startsAt: d("2026-10-06T16:00:00Z"), endsAt: null, link: null }],
      submissionDeadline: deadline,
      cohort: null,
    });
    expect(entries.map((e) => e.kind)).toEqual(["KICKOFF", "DEADLINE"]);
  });

  it("includes cohort check-ins, office hours, defense window and results", () => {
    const entries = buildSchedule({
      items: [],
      submissionDeadline: deadline,
      cohort: {
        checkInSchedule: JSON.stringify([
          { week: 1, dueAt: "2026-10-12T07:00:00Z", prompt: "what did you build" },
          { week: 2, dueAt: "not a date" },
        ]),
        officeHours: JSON.stringify([{ startsAt: "2026-10-09T17:00:00Z", endsAt: "2026-10-09T18:00:00Z", link: "https://example.com/oh" }]),
        defenseWindowStart: d("2026-10-22T16:00:00Z"),
        defenseWindowEnd: d("2026-10-29T00:00:00Z"),
        resultsAt: d("2026-11-02T17:00:00Z"),
      },
    });
    expect(entries.map((e) => e.kind)).toEqual(["OFFICE_HOURS", "CHECK_IN", "DEADLINE", "DEFENSE", "RESULTS"]);
    expect(entries[1].title).toBe("week 1 check-in due");
    expect(entries[0].endsAt).toEqual(d("2026-10-09T18:00:00Z"));
  });

  it("lets an organizer item replace the derived one at the same time", () => {
    const entries = buildSchedule({
      items: [{ id: "x", kind: "DEADLINE", title: "posting closes", description: null, startsAt: deadline, endsAt: null, link: null }],
      submissionDeadline: deadline,
      cohort: null,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe("posting closes");
  });
});

describe("labels", () => {
  it("names types and statuses in lowercase copy", () => {
    expect(typeLabel("HIRING_COHORT")).toBe("hiring cohort");
    expect(statusLabel("DEFENSE")).toBe("defense interviews");
    expect(statusLabel("DRAFT")).toBe("draft");
  });

  it("always names the zone on a date range", () => {
    expect(dateRange(d("2026-10-06T16:00:00Z"), d("2026-10-20T16:00:00Z"), "America/Los_Angeles")).toBe(
      "6 oct to 20 oct, America/Los_Angeles",
    );
  });

  it("only renders http(s) links", () => {
    expect(safeUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("not a url")).toBeNull();
    expect(safeUrl(null)).toBeNull();
  });
});

describe("participant visibility", () => {
  it("lists public profiles to everyone, platform profiles to signed-in viewers, private never", () => {
    expect(isListedParticipant("PUBLIC", false)).toBe(true);
    expect(isListedParticipant("PLATFORM", false)).toBe(false);
    expect(isListedParticipant("PLATFORM", true)).toBe(true);
    expect(isListedParticipant("PRIVATE", true)).toBe(false);
    expect(isListedParticipant(undefined, true)).toBe(false);
  });
});

describe("tabs", () => {
  it("keeps the projects and teams tabs owned by other builders", () => {
    const labels = tabItems("x").map((t) => t.label);
    expect(labels).toContain("projects");
    expect(labels).toContain("teams");
  });

  it("marks overview only on the exact base and other tabs on their subtree", () => {
    expect(currentTabHref("/hackathons/x", "x")).toBe("/hackathons/x");
    expect(currentTabHref("/hackathons/x/prizes", "x")).toBe("/hackathons/x/prizes");
    expect(currentTabHref("/hackathons/x/teams/abc", "x")).toBe("/hackathons/x/teams");
    expect(currentTabHref("/hackathons/x/register", "x")).toBe("");
  });
});
