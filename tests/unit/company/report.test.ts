import { describe, expect, it } from "vitest";
import { buildReport, type ReportRows } from "@/lib/reports/build";

const anchors = JSON.stringify([
  { level: 1, text: "not shown" },
  { level: 2, text: "partly shown" },
  { level: 3, text: "shown with evidence" },
  { level: 4, text: "shown and explained" },
]);
const dimension = (key: string, sortOrder: number) => ({ key, name: `dimension ${key}`, description: "what it measures", anchors, sortOrder });
const commit = JSON.stringify([{ kind: "COMMIT", id: "c1", label: "a1b2c3d" }]);

function rows(): ReportRows {
  return {
    role: { id: "role1", title: "Founding Engineer", companyId: "co1", criteria: [{ id: "crit1", name: "API design", description: "clear endpoints", sortOrder: 0 }] },
    candidate: { id: "cand1", name: "Maya Chen", username: "mayachen" },
    project: { id: "p1", title: "Tidepool", tagline: "tide tables", repoUrl: null, links: "[]", verified: true, verifiedAt: new Date("2026-09-20T00:00:00Z"), hackathon: { title: "Fall Builders Cohort", slug: "fall" } },
    reviews: [
      {
        id: "rev2",
        submittedAt: new Date("2026-09-10T00:00:00Z"),
        scores: [
          { score: 2, rationale: "second", evidenceRefs: "[]", dimension: dimension("A", 0), roleCriterionId: null },
          { score: 3, rationale: "criterion", evidenceRefs: commit, dimension: null, roleCriterionId: "crit1" },
          { score: 4, rationale: "other company", evidenceRefs: "[]", dimension: null, roleCriterionId: "foreign" },
        ],
      },
      {
        id: "rev1",
        submittedAt: new Date("2026-09-09T00:00:00Z"),
        scores: [
          { score: 4, rationale: "first", evidenceRefs: commit, dimension: dimension("A", 0), roleCriterionId: null },
          { score: 3, rationale: "b", evidenceRefs: "[]", dimension: dimension("B", 1), roleCriterionId: null },
        ],
      },
      { id: "draft", submittedAt: null, scores: [{ score: 1, rationale: "draft", evidenceRefs: "[]", dimension: dimension("A", 0), roleCriterionId: null }] },
    ],
    calibrationNotes: [
      { dimensionKey: "A", note: "settled after reading the transcript", resolvedScore: 3, createdAt: new Date() },
      { dimensionKey: "criterion:foreign", note: "not ours", resolvedScore: null, createdAt: new Date() },
    ],
    decisions: [{ outcome: "ADVANCE", reason: "strong defense of tradeoffs", decidedAt: new Date("2026-09-12T00:00:00Z") }],
    interviews: [
      {
        id: "iv1",
        status: "COMPLETED",
        outcome: "PASS",
        model: "WE_RUN",
        scheduledAt: new Date("2026-09-18T17:00:00Z"),
        completedAt: new Date("2026-09-18T18:15:00Z"),
        scores: [
          { id: "s2", section: "PLANTED_BUG", score: 3, notes: "found it in 6 minutes", scoredById: "u1" },
          { id: "s3", section: "WALKTHROUGH", score: 2, notes: "company view", scoredById: "u2" },
          { id: "s1", section: "WALKTHROUGH", score: 4, notes: "clear walkthrough", scoredById: "u1" },
        ],
      },
    ],
    summary: null,
  };
}

describe("buildReport", () => {
  const report = buildReport(rows(), new Date("2026-10-03T00:00:00Z"));

  it("keeps each reviewer's score with its anchor text, rationale and evidence", () => {
    const a = report.rubric.find((d) => d.key === "A")!;
    expect(a.scores).toEqual([
      { reviewer: "reviewer 1", score: 4, anchor: "shown and explained", rationale: "first", evidence: [{ kind: "COMMIT", id: "c1", label: "a1b2c3d" }] },
      { reviewer: "reviewer 2", score: 2, anchor: "partly shown", rationale: "second", evidence: [] },
    ]);
    expect(a.maxLevel).toBe(4);
    expect(a.calibration).toEqual({ note: "settled after reading the transcript", resolvedScore: 3 });
  });

  it("ignores draft reviews and orders dimensions by rubric order", () => {
    expect(report.rubric.map((d) => d.key)).toEqual(["A", "B"]);
    expect(report.rubric.flatMap((d) => d.scores).some((s) => s.rationale === "draft")).toBe(false);
  });

  it("includes only this role's criteria", () => {
    expect(report.criteria).toHaveLength(1);
    expect(report.criteria[0].scores.map((s) => s.rationale)).toEqual(["criterion"]);
    expect(JSON.stringify(report)).not.toContain("other company");
    expect(JSON.stringify(report)).not.toContain("not ours");
  });

  it("never totals or averages scores", () => {
    const keys = JSON.stringify(report).toLowerCase();
    for (const word of ["total", "average", "mean", "overall", "rank"]) expect(keys).not.toContain(`"${word}`);
  });

  it("labels decisions and orders the interview scorecard by script section", () => {
    expect(report.decisions[0].label).toBe("advance");
    expect(report.interviews[0].statusLabel).toBe("defense passed");
    expect(report.interviews[0].sections.map((s) => s.section)).toEqual(["WALKTHROUGH", "PLANTED_BUG"]);
  });

  it("shows each panelist's interview score with its notes, never averaged", () => {
    expect(report.interviews[0].sections[0].scores).toEqual([
      { id: "s1", panelist: "panelist 1", score: 4, notes: "clear walkthrough" },
      { id: "s3", panelist: "panelist 2", score: 2, notes: "company view" },
    ]);
  });

  it("is JSON-safe for the CandidateReport snapshot", () => {
    expect(JSON.parse(JSON.stringify(report))).toEqual(report);
    expect(report.generatedAt).toBe("2026-10-03T00:00:00.000Z");
  });
});
