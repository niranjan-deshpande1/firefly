import { describe, expect, it } from "vitest";
import { canRefresh, listCommitPages, parseRepoUrl, REFRESH_COOLDOWN_MS } from "@/lib/evidence/github";
import { commitsPerDay, dayKey, dayLabel } from "@/lib/evidence/timeline";
import { excerptId, highlightSegments, matchesQuery, splitExcerpts } from "@/lib/evidence/transcript";
import { isBlindViewer } from "@/lib/evidence/queries";
import { evidenceAnchor } from "@/components/evidence/types";

describe("parseRepoUrl", () => {
  it.each([
    ["https://github.com/northwind/parser", { owner: "northwind", name: "parser" }],
    ["https://github.com/northwind/parser.git", { owner: "northwind", name: "parser" }],
    ["https://www.github.com/a-b/c.d/tree/main", { owner: "a-b", name: "c.d" }],
  ])("accepts %s", (url, expected) => expect(parseRepoUrl(url)).toEqual(expected));

  it.each([
    null,
    "",
    "http://github.com/a/b",
    "https://gitlab.com/a/b",
    "https://github.com.evil.example/a/b",
    "https://github.com/onlyowner",
    "https://github.com/a/..",
    "https://github.com/a/b%2F..",
    "not a url",
  ])("rejects %s", (url) => expect(parseRepoUrl(url)).toBeNull());
});

describe("canRefresh", () => {
  const now = new Date("2026-07-22T12:00:00Z");
  it("allows the first fetch", () => expect(canRefresh(null, now)).toBe(true));
  it("refuses within 10 minutes", () => expect(canRefresh(new Date(now.getTime() - REFRESH_COOLDOWN_MS + 1000), now)).toBe(false));
  it("allows after 10 minutes", () => expect(canRefresh(new Date(now.getTime() - REFRESH_COOLDOWN_MS), now)).toBe(true));
});

describe("commitsPerDay", () => {
  it("counts per day in the zone and keeps empty days as zero", () => {
    const days = commitsPerDay(
      [new Date("2026-07-20T18:00:00Z"), new Date("2026-07-20T19:00:00Z"), new Date("2026-07-23T01:00:00Z")],
      "America/Los_Angeles",
    );
    // 23 jul 01:00 UTC is 22 jul in Los Angeles.
    expect(days).toEqual([
      { day: "2026-07-20", count: 2 },
      { day: "2026-07-21", count: 0 },
      { day: "2026-07-22", count: 1 },
    ]);
  });

  it("returns nothing for no commits", () => expect(commitsPerDay([])).toEqual([]));

  it("caps the span to the last 90 days", () => {
    const days = commitsPerDay([new Date("2026-01-01T12:00:00Z"), new Date("2026-07-01T12:00:00Z")], "UTC");
    expect(days).toHaveLength(90);
    expect(days[days.length - 1]).toEqual({ day: "2026-07-01", count: 1 });
  });

  it("labels days the product way", () => {
    expect(dayLabel("2026-07-02")).toBe("2 jul");
    expect(dayKey(new Date("2026-07-02T12:00:00Z"), "UTC")).toBe("2026-07-02");
  });
});

describe("transcript excerpts", () => {
  it("splits at blank lines and normalises line endings", () => {
    expect(splitExcerpts("one\r\ntwo\r\n\r\n\nthree\n  \n")).toEqual(["one\ntwo", "three"]);
  });

  it("builds excerpt anchors that EvidenceLink can target", () => {
    expect(evidenceAnchor({ kind: "TRANSCRIPT", id: excerptId("ckabc", 0) })).toBe("evidence-transcript-ckabc-1");
  });

  it("matches case-insensitively and highlights every hit", () => {
    expect(matchesQuery("Parser Bug", "bug")).toBe(true);
    expect(matchesQuery("anything", "  ")).toBe(true);
    expect(highlightSegments("a Bug and a bug", "bug")).toEqual([
      { text: "a ", match: false },
      { text: "Bug", match: true },
      { text: " and a ", match: false },
      { text: "bug", match: true },
    ]);
  });

  it("keeps markup as text segments", () => {
    expect(highlightSegments("<script>x</script>", "")).toEqual([{ text: "<script>x</script>", match: false }]);
  });
});

describe("isBlindViewer", () => {
  it("is blind for an assigned reviewer before their review is posted", () => {
    expect(isBlindViewer("REVIEWER", { isAssignedReviewer: true })).toBe(true);
  });
  it("stays blind after posting until the reviewer reveals (the reveal is audited)", () => {
    expect(isBlindViewer("REVIEWER", { isAssignedReviewer: true, reviewSubmitted: true })).toBe(true);
    expect(isBlindViewer("REVIEWER", { isAssignedReviewer: true, reviewSubmitted: true, identityRevealed: true })).toBe(false);
  });
  it("is never blind for members, companies or admins", () => {
    expect(isBlindViewer("CANDIDATE", { isProjectMember: true })).toBe(false);
    expect(isBlindViewer("COMPANY", { isOnCompanyShortlist: true })).toBe(false);
    expect(isBlindViewer("ADMIN", {})).toBe(false);
  });
});

describe("listCommitPages", () => {
  const pageOf = (n: number) => Array.from({ length: n }, (_, i) => i);

  it("stops at the first short page", async () => {
    const calls: number[] = [];
    const all = await listCommitPages(async (page) => {
      calls.push(page);
      return page === 1 ? pageOf(100) : pageOf(7);
    });
    expect(calls).toEqual([1, 2]);
    expect(all).toHaveLength(107);
  });

  it("reads at most 5 pages, 500 commits", async () => {
    const calls: number[] = [];
    const all = await listCommitPages(async (page) => {
      calls.push(page);
      return pageOf(100);
    });
    expect(calls).toEqual([1, 2, 3, 4, 5]);
    expect(all).toHaveLength(500);
  });

  it("passes a failed page through so the caller keeps existing data", async () => {
    await expect(listCommitPages(async (page) => (page === 2 ? Promise.reject(new Error("rate limited")) : pageOf(100)))).rejects.toThrow("rate limited");
  });
});
