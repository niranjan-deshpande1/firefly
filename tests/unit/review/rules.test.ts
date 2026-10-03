import { describe, expect, it } from "vitest";
import { calibrationFlags, decisionBlocker, feedbackBlocker, postingProblems, type ScoreDraft } from "@/lib/review/rules";
import { RUBRIC_V0 } from "@/lib/review/rubric";

const items = [
  { key: "A", name: "A" },
  { key: "criterion:c1", name: "c1" },
];
const ref = { kind: "COMMIT" as const, id: "k1", label: "abc1234 init" };
const full = (key: string): ScoreDraft => ({ key, score: 3, rationale: "explained two edge cases", evidenceRefs: [ref] });

describe("postingProblems", () => {
  it("accepts a review where every item has a level, rationale and evidence", () => {
    expect(postingProblems(items, [full("A"), full("criterion:c1")], true)).toEqual({});
  });

  it("refuses a missing score, a blank rationale and missing evidence", () => {
    const problems = postingProblems(items, [{ ...full("A"), rationale: "   " }, { ...full("criterion:c1"), evidenceRefs: [] }], true);
    expect(Object.keys(problems)).toEqual(["A", "criterion:c1"]);
    expect(problems.A).toMatch(/rationale/);
    expect(problems["criterion:c1"]).toMatch(/evidence/);
    expect(postingProblems(items, [full("A")], true)["criterion:c1"]).toMatch(/level/);
    expect(postingProblems(items, [{ ...full("A"), score: null }, full("criterion:c1")], true).A).toMatch(/level/);
  });

  it("does not require evidence for judging", () => {
    expect(postingProblems(items, [{ ...full("A"), evidenceRefs: [] }, { ...full("criterion:c1"), evidenceRefs: [] }], false)).toEqual({});
  });
});

describe("calibrationFlags", () => {
  it("flags gaps of 2 or more only", () => {
    expect(calibrationFlags(["A", "B", "C"], [{ A: 1, B: 2, C: 4 }, { A: 3, B: 3, C: 1 }])).toEqual(["A", "C"]);
  });

  it("needs two reviews that both scored the item", () => {
    expect(calibrationFlags(["A"], [{ A: 1 }])).toEqual([]);
    expect(calibrationFlags(["A"], [{ A: 1 }, {}])).toEqual([]);
  });

  it("uses the widest gap when more than two reviews exist", () => {
    expect(calibrationFlags(["A"], [{ A: 2 }, { A: 3 }, { A: 4 }])).toEqual(["A"]);
  });
});

describe("decisionBlocker", () => {
  it("needs two posted reviews", () => {
    expect(decisionBlocker(1, [], [])).toMatch(/2 posted reviews/);
  });

  it("needs a reconciliation note on every flag", () => {
    expect(decisionBlocker(2, ["A", "C"], ["A"])).toMatch(/1 flagged score gap/);
    expect(decisionBlocker(2, ["A", "C"], ["A", "C"])).toBeNull();
    expect(decisionBlocker(2, [], [])).toBeNull();
  });
});

describe("feedbackBlocker", () => {
  it("allows feedback only after a decision that isn't advance", () => {
    expect(feedbackBlocker(null)).not.toBeNull();
    expect(feedbackBlocker("ADVANCE")).toBeNull();
    expect(feedbackBlocker("ADVANCE", true)).not.toBeNull();
    expect(feedbackBlocker("REJECT")).toBeNull();
    expect(feedbackBlocker("HOLD")).toBeNull();
  });
});

describe("RUBRIC_V0", () => {
  it("has six dimensions A to F with four anchors each and F as the only gate", () => {
    expect(RUBRIC_V0.map((d) => d.key)).toEqual(["A", "B", "C", "D", "E", "F"]);
    for (const d of RUBRIC_V0) expect(d.anchors.map((x) => x.level)).toEqual([1, 2, 3, 4]);
    expect(RUBRIC_V0.filter((d) => d.isGate).map((d) => d.key)).toEqual(["F"]);
  });
});
