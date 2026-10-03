import { describe, expect, it } from "vitest";
import {
  buildDay,
  checkInSlots,
  cohortStateLine,
  currentBeat,
  eligibilityItems,
  firstIssue,
  openSlot,
  registrationBlock,
  slotState,
  teamHasRoom,
  teamsAllowed,
  zCheckIn,
  zInvite,
} from "@/lib/participation/logic";

const DAY = 86_400_000;
const start = new Date("2026-10-01T16:00:00Z");
const at = (days: number) => new Date(start.getTime() + days * DAY);

const cohort = {
  type: "HIRING_COHORT",
  status: "OPEN",
  registrationOpensAt: at(-14),
  startsAt: start,
  submissionDeadline: at(14),
  endsAt: at(28),
};
const cohortDates = { defenseWindowStart: at(17), defenseWindowEnd: at(21), resultsAt: at(25) };

describe("buildDay", () => {
  it("counts the start day as day 1 and states the total in calendar days", () => {
    // 1 oct 09:00 to 15 oct 09:00 in Los Angeles spans 15 calendar dates.
    expect(buildDay(start, at(14), at(0.5))).toEqual({ day: 1, total: 15 });
    expect(buildDay(start, at(14), at(8.2))).toEqual({ day: 9, total: 15 });
    // A deadline at midnight ends the day before.
    expect(buildDay(new Date("2026-10-01T07:00:00Z"), new Date("2026-10-15T07:00:00Z"), at(1))).toEqual({ day: 2, total: 14 });
  });

  it("is null before the start and after the deadline", () => {
    expect(buildDay(start, at(14), at(-1))).toBeNull();
    expect(buildDay(start, at(14), at(15))).toBeNull();
  });
});

describe("currentBeat and cohortStateLine", () => {
  it("names each beat of a hiring cohort in order", () => {
    expect(currentBeat(cohort, cohortDates, at(-2))).toMatch(/^kickoff on /);
    expect(cohortStateLine(cohort, cohortDates, at(8.2))).toBe("day 9 of 15, building");
    expect(currentBeat(cohort, cohortDates, at(15))).toBe("reviews");
    expect(currentBeat(cohort, cohortDates, at(18))).toBe("defense interviews");
    expect(currentBeat(cohort, cohortDates, at(23))).toMatch(/^results on /);
    expect(currentBeat(cohort, cohortDates, at(26))).toBe("results are out");
  });

  it("treats a completed hackathon as having results", () => {
    expect(currentBeat({ ...cohort, type: "OPEN", status: "COMPLETED" }, null, at(3))).toBe("results are out");
  });

  it("never renders a percentage or a remaining-days figure", () => {
    for (const d of [-3, 0, 5, 13, 16, 19, 24, 30]) {
      const line = cohortStateLine(cohort, cohortDates, at(d));
      expect(line).not.toMatch(/%|left|remaining|behind|ahead/);
    }
  });
});

describe("check-in slots", () => {
  it("uses the organizer schedule when present, sorted by week", () => {
    const raw = [
      { week: 2, dueAt: at(14).toISOString(), prompt: "what changed" },
      { week: 1, dueAt: at(7).toISOString(), prompt: "what you started" },
    ];
    const slots = checkInSlots(raw, start, at(14));
    expect(slots.map((s) => s.week)).toEqual([1, 2]);
    expect(slots[0].prompt).toBe("what you started");
  });

  it("falls back to one slot per build week", () => {
    const slots = checkInSlots("not a schedule", start, at(14));
    expect(slots).toHaveLength(2);
    expect(slots[1].dueAt).toEqual(at(14));
  });

  it("opens a week 7 days before it is due and closes it at the due time", () => {
    const slots = checkInSlots([], start, at(14));
    const none = new Set<number>();
    expect(slotState(slots[0], none, at(3))).toBe("open");
    expect(slotState(slots[1], none, at(3))).toBe("upcoming");
    expect(slotState(slots[0], none, at(8))).toBe("not posted");
    expect(slotState(slots[0], new Set([1]), at(3))).toBe("posted");
    expect(openSlot(slots, new Set([1]), at(3))).toBeNull();
    expect(openSlot(slots, none, at(8))?.week).toBe(2);
  });
});

describe("registrationBlock", () => {
  it("is open between the registration time and the deadline", () => {
    expect(registrationBlock(cohort, at(-1))).toBeNull();
    expect(registrationBlock(cohort, at(5))).toBeNull();
  });

  it("explains each closed state in one sentence", () => {
    expect(registrationBlock({ ...cohort, status: "COMPLETED" }, at(1))).toMatch(/has ended/);
    expect(registrationBlock({ ...cohort, status: "JUDGING" }, at(1))).toMatch(/^registration closed on/);
    expect(registrationBlock(cohort, at(15))).toMatch(/^registration closed on/);
    expect(registrationBlock(cohort, at(-20))).toMatch(/^registration opens on/);
  });
});

describe("eligibilityItems", () => {
  it("turns each list item into its own statement", () => {
    expect(eligibilityItems("you must be:\n\n- 18 or older\n- able to work in the US\n* free for 2 weeks")).toEqual([
      "18 or older",
      "able to work in the US",
      "free for 2 weeks",
    ]);
  });

  it("uses the whole text when there is no list, and nothing when empty", () => {
    expect(eligibilityItems("open to everyone 18 or older.")).toEqual(["open to everyone 18 or older."]);
    expect(eligibilityItems("  ")).toEqual([]);
  });
});

describe("teams", () => {
  it("allows teams only on open hackathons with a team policy and room for 2", () => {
    expect(teamsAllowed({ type: "OPEN", teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 4 })).toBe(true);
    expect(teamsAllowed({ type: "HIRING_COHORT", teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 4 })).toBe(false);
    expect(teamsAllowed({ type: "OPEN", teamPolicy: "SOLO", maxTeamSize: 4 })).toBe(false);
    expect(teamsAllowed({ type: "OPEN", teamPolicy: "TEAMS_ALLOWED", maxTeamSize: 1 })).toBe(false);
  });

  it("counts pending invites against the team size", () => {
    expect(teamHasRoom(2, 1, 4)).toBe(true);
    expect(teamHasRoom(2, 2, 4)).toBe(false);
    expect(teamHasRoom(4, 0, 4)).toBe(false);
  });
});

describe("input schemas", () => {
  it("parses a check-in and drops empty optional fields", () => {
    const r = zCheckIn.parse({ hackathonId: "h1", week: "2", progress: " shipped auth ", blockers: "", hoursSpent: "" });
    expect(r).toEqual({ hackathonId: "h1", week: 2, progress: "shipped auth", blockers: undefined, nextSteps: undefined, aiUsage: undefined, hoursSpent: undefined });
    expect(zCheckIn.parse({ hackathonId: "h1", week: 1, progress: "x", hoursSpent: "12" }).hoursSpent).toBe(12);
  });

  it("names the field and the fix when a check-in is invalid", () => {
    const empty = zCheckIn.safeParse({ hackathonId: "h1", week: 1, progress: "   " });
    expect(empty.success).toBe(false);
    if (!empty.success) expect(firstIssue(empty.error)).toEqual({ field: "progress", message: "write what you made this week, then post the check-in." });
    const hours = zCheckIn.safeParse({ hackathonId: "h1", week: 1, progress: "x", hoursSpent: "500" });
    if (!hours.success) expect(firstIssue(hours.error).field).toBe("hoursSpent");
    expect(hours.success).toBe(false);
  });

  it("normalizes invite usernames", () => {
    expect(zInvite.parse({ teamId: "t1", username: " @MayaChen " }).username).toBe("mayachen");
    expect(zInvite.safeParse({ teamId: "t1", username: "@" }).success).toBe(false);
  });
});
