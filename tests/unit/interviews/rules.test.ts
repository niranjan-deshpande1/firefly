import { describe, expect, it } from "vitest";
import {
  completionError,
  formatElapsed,
  interviewerError,
  isValidTimeZone,
  manageError,
  missingSections,
  parseTimer,
  placeError,
  scoringError,
  utcToZonedLocal,
  zonedTimeToUtc,
} from "@/lib/interviews/rules";
import { SCRIPT } from "@/lib/interviews/script";
import { INTERVIEW_SECTIONS } from "@/lib/db/enums";

const reviewers = new Set(["r1", "r2"]);
const members = new Set(["c1"]);
const allScored = INTERVIEW_SECTIONS.map((section) => ({ section }));
const open = { status: "IN_PROGRESS", identityCheckedAt: new Date() };

describe("interviewerError", () => {
  it("accepts reviewers for we run it", () => expect(interviewerError("WE_RUN", ["r1", "r2"], reviewers, members)).toBeNull());
  it("rejects company members for we run it", () => expect(interviewerError("WE_RUN", ["r1", "c1"], reviewers, members)).toMatch(/reviewers only/));
  it("needs both sides for joint", () => {
    expect(interviewerError("JOINT", ["r1", "c1"], reviewers, members)).toBeNull();
    expect(interviewerError("JOINT", ["r1"], reviewers, members)).toMatch(/one reviewer and one company member/);
    expect(interviewerError("JOINT", ["c1"], reviewers, members)).toMatch(/one reviewer and one company member/);
  });
  it("accepts only company members for company runs it", () => {
    expect(interviewerError("COMPANY_RUN", ["c1"], reviewers, members)).toBeNull();
    expect(interviewerError("COMPANY_RUN", ["c1", "r1"], reviewers, members)).toMatch(/company members only/);
  });
  it("rejects an empty panel and outsiders", () => {
    expect(interviewerError("WE_RUN", [], reviewers, members)).toMatch(/no interviewers/);
    expect(interviewerError("WE_RUN", ["x"], reviewers, members)).toMatch(/not eligible/);
  });
});

describe("completion gate", () => {
  it("passes with an identity check and a score for every section", () => expect(completionError(open, allScored)).toBeNull());
  it("requires the identity check", () => expect(completionError({ ...open, identityCheckedAt: null }, allScored)).toMatch(/identity check/));
  it("requires a score for every section", () => {
    expect(completionError(open, allScored.slice(1))).toMatch(/1 section has no score/);
    expect(completionError(open, [])).toMatch(/5 sections have no score/);
    expect(missingSections(allScored.slice(2))).toEqual(["WALKTHROUGH", "WHAT_BREAKS_IF"]);
  });
  it("refuses a closed interview", () => expect(completionError({ ...open, status: "COMPLETED" }, allScored)).toMatch(/already closed/));
});

describe("scoring lock", () => {
  it("locks the script until the identity check", () => expect(scoringError({ status: "SCHEDULED", identityCheckedAt: null })).toMatch(/locked/));
  it("unlocks after the identity check", () => expect(scoringError(open)).toBeNull());
  it("locks after completion", () => expect(scoringError({ ...open, status: "COMPLETED" })).toMatch(/closed/));
});

describe("time helpers", () => {
  it("formats elapsed time as mm:ss", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(65_400)).toBe("01:05");
    expect(formatElapsed(75 * 60_000)).toBe("75:00");
  });
  it("converts wall time in a zone to UTC, across daylight time", () => {
    expect(zonedTimeToUtc("2026-10-14T10:00", "America/Los_Angeles")?.toISOString()).toBe("2026-10-14T17:00:00.000Z");
    expect(zonedTimeToUtc("2026-12-14T10:00", "America/Los_Angeles")?.toISOString()).toBe("2026-12-14T18:00:00.000Z");
    expect(zonedTimeToUtc("2026-10-14T10:00", "Asia/Kolkata")?.toISOString()).toBe("2026-10-14T04:30:00.000Z");
  });
  it("rejects bad zones and times", () => {
    expect(isValidTimeZone("PST")).toBe(false);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
    expect(zonedTimeToUtc("tomorrow", "UTC")).toBeNull();
  });
});

describe("manage rules", () => {
  it("refuses cancel and reschedule once closed", () => {
    expect(manageError("SCHEDULED", "cancel")).toBeNull();
    expect(manageError("IN_PROGRESS", "reschedule")).toBeNull();
    expect(manageError("COMPLETED", "cancel")).toMatch(/can't be cancelled/);
    expect(manageError("COMPLETED", "reschedule")).toMatch(/can't be rescheduled/);
    expect(manageError("CANCELLED", "cancel")).toMatch(/already cancelled/);
    expect(manageError("CANCELLED", "reschedule")).toMatch(/schedule a new interview/);
  });
  it("checks the place against the mode", () => {
    expect(placeError({ mode: "IN_PERSON", location: "room 4" })).toBeNull();
    expect(placeError({ mode: "IN_PERSON" })?.path).toBe("location");
    expect(placeError({ mode: "VIDEO", videoLink: "http://x" })?.path).toBe("videoLink");
    expect(placeError({ mode: "VIDEO", videoLink: "https://meet.example.com/abc" })).toBeNull();
  });
  it("round-trips wall time in a zone", () => {
    for (const zone of ["America/Los_Angeles", "Asia/Kolkata", "UTC"]) {
      expect(utcToZonedLocal(zonedTimeToUtc("2026-12-14T10:30", zone)!, zone)).toBe("2026-12-14T10:30");
    }
  });
});

describe("timer storage", () => {
  it("reads a saved timer and treats junk as a fresh one", () => {
    expect(parseTimer('{"elapsed":5000,"runningSince":123}')).toEqual({ elapsed: 5000, runningSince: 123 });
    expect(parseTimer('{"elapsed":5000,"runningSince":null}')).toEqual({ elapsed: 5000, runningSince: null });
    expect(parseTimer(null)).toEqual({ elapsed: 0, runningSince: null });
    expect(parseTimer("{not json")).toEqual({ elapsed: 0, runningSince: null });
    expect(parseTimer('{"elapsed":"x"}')).toEqual({ elapsed: 0, runningSince: null });
  });
});

describe("script", () => {
  it("covers every section in order with 4 anchors", () => {
    expect(SCRIPT.map((s) => s.section)).toEqual([...INTERVIEW_SECTIONS]);
    SCRIPT.forEach((s) => expect(s.anchors).toHaveLength(4));
  });
});
