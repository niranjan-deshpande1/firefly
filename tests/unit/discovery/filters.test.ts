import { describe, expect, it } from "vitest";
import { activeKeys, filterChips, parseFilters, toOrderBy, toQueryString, toWhere } from "@/lib/discovery/filters";

describe("parseFilters", () => {
  it("defaults to start-date sort with no filters", () => {
    expect(parseFilters({})).toEqual({ sort: "start" });
  });

  it("drops invalid values instead of throwing", () => {
    const f = parseFilters({ type: "BOGUS", status: "DRAFT", from: "yesterday", sort: "popular", format: "HYBRID" });
    expect(activeKeys(f)).toEqual([]);
    expect(f.sort).toBe("start");
  });

  it("keeps valid values and takes the first of repeated params", () => {
    const f = parseFilters({ q: "  agents ", type: ["HIRING_COHORT", "OPEN"], from: "2026-10-01", sort: "deadline" });
    expect(f).toMatchObject({ q: "agents", type: "HIRING_COHORT", from: "2026-10-01", sort: "deadline" });
  });
});

describe("toWhere", () => {
  it("always excludes drafts", () => {
    expect(toWhere(parseFilters({}))).toEqual({ AND: [{ status: { not: "DRAFT" } }] });
  });

  it("matches a theme inside the JSON column and counts hybrid as online", () => {
    const where = toWhere(parseFilters({ theme: "climate", format: "ONLINE" }));
    expect(where.AND).toContainEqual({ themes: { contains: '"climate"' } });
    expect(where.AND).toContainEqual({ format: { in: ["ONLINE", "HYBRID"] } });
  });

  it("filters dates by overlap with the range", () => {
    const where = toWhere(parseFilters({ from: "2026-10-01", to: "2026-10-31" }));
    expect(where.AND).toContainEqual({ endsAt: { gte: new Date("2026-10-01T00:00:00Z") } });
    expect(where.AND).toContainEqual({ startsAt: { lte: new Date("2026-10-31T23:59:59Z") } });
  });
});

describe("sorting", () => {
  it("sorts by start date or deadline, never by popularity", () => {
    expect(toOrderBy(parseFilters({}))[0]).toEqual({ startsAt: "asc" });
    expect(toOrderBy(parseFilters({ sort: "deadline" }))[0]).toEqual({ submissionDeadline: "asc" });
  });
});

describe("chips", () => {
  it("gives one removable chip per active filter, each keeping the others", () => {
    const f = parseFilters({ type: "OPEN", theme: "health", sort: "deadline" });
    const chips = filterChips(f);
    expect(chips.map((c) => c.label)).toEqual(["open hackathon", "theme: health"]);
    expect(chips[0].href).toBe("/hackathons?theme=health&sort=deadline");
    expect(chips[1].href).toBe("/hackathons?type=OPEN&sort=deadline");
  });

  it("builds an empty query string for the default state", () => {
    expect(toQueryString(parseFilters({}))).toBe("");
  });
});
