// The demo path depends on the seed's shape. These checks fail if a seed edit breaks it.
import { describe, expect, it } from "vitest";
import { CANDIDATES, blindCodeFor } from "@/prisma/seed/people";
import { FALL_PLAN, jitter } from "@/prisma/seed/review";

// What docs/build/demo-script.md step 4 tells Priya to enter for Maya (rubric A..F).
const PRIYA_DEMO_SCORES = [3, 3, 3, 4, 3, 3];

const gaps = (a: number[], b: number[]) => a.map((x, i) => Math.abs(x - b[i]));

describe("seed plan", () => {
  it("has 24 candidates with unique blind codes", () => {
    const ids = Object.values(CANDIDATES).map((c) => c.id);
    expect(ids).toHaveLength(24);
    expect(new Set(ids.map(blindCodeFor)).size).toBe(24);
    expect(CANDIDATES.maya.id).toBe("demo-candidate");
  });

  it("gives Maya exactly one flagged gap once Priya enters the demo scores", () => {
    const maya = FALL_PLAN.find((p) => p.key === "maya")!;
    expect(maya.pendingFirst).toBe(true);
    expect(maya.decision).toBeUndefined();
    expect(gaps(maya.base, PRIYA_DEMO_SCORES).filter((g) => g >= 2)).toHaveLength(1);
  });

  it("keeps every other seeded double review within 1, except Grace's reconciled gap", () => {
    FALL_PLAN.forEach((plan, n) => {
      if (plan.key === "maya") return;
      const second = plan.second ?? jitter(plan.base, n);
      const flagged = gaps(plan.base, second).filter((g) => g >= 2).length;
      expect(flagged).toBe(plan.key === "grace" ? 1 : 0);
    });
  });

  it("seeds 10 cohort projects with two reviewers each", () => {
    expect(FALL_PLAN).toHaveLength(10);
    for (const plan of FALL_PLAN) expect(new Set(plan.reviewers).size).toBe(2);
  });
});
