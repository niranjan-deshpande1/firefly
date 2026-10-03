import { describe, expect, it } from "vitest";
import { dollarsToCents, fieldErrors, findProxyTerm, roleFromForm, slugify, splitList, zCriterion, zHire, zRole } from "@/lib/company/schemas";
import { interviewStatusLabel, salaryRangeLabel } from "@/lib/company/labels";
import { talentReasons } from "@/lib/company/talent-reasons";
import { formatCents } from "@/lib/billing/math";

const criterion = { name: "API design", description: "designs small, consistent endpoints with clear errors.", jobRelated: "the role owns our public API from day one." };

function roleForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const values: Record<string, string> = {
    title: "Founding Engineer",
    level: "MID",
    description: "build the first version of our scheduling product with the founders.",
    requiredSkills: "TypeScript, Postgres, TypeScript",
    numberOfHires: "1",
    salaryMin: "130,000",
    salaryMax: "$160000",
    remote: "HYBRID",
    "criteria.0.name": criterion.name,
    "criteria.0.description": criterion.description,
    "criteria.0.jobRelated": criterion.jobRelated,
    ...overrides,
  };
  for (const [k, v] of Object.entries(values)) form.set(k, v);
  return form;
}

describe("findProxyTerm", () => {
  it("catches culture fit and protected-trait proxies", () => {
    expect(findProxyTerm("Strong Culture Fit")).toBe("culture fit");
    expect(findProxyTerm("young and energetic team")).toBe("young");
    expect(findProxyTerm("no pregnancy plans")).toBe("pregnan");
  });

  it("leaves job-related wording alone", () => {
    expect(findProxyTerm("debugs race conditions in a single page app")).toBeNull();
    expect(findProxyTerm("manages database migrations")).toBeNull();
  });
});

describe("zCriterion", () => {
  it("accepts a written, job-related criterion", () => {
    expect(zCriterion.safeParse(criterion).success).toBe(true);
  });

  it("requires a job-related justification", () => {
    const result = zCriterion.safeParse({ ...criterion, jobRelated: "" });
    expect(result.success).toBe(false);
  });

  it("refuses proxies in any field", () => {
    const result = zCriterion.safeParse({ ...criterion, name: "culture fit" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error.issues).name).toMatch(/not a job-related criterion/);
  });
});

describe("roleFromForm and zRole", () => {
  it("parses the intake form into cents, a skill list and criteria", () => {
    const { input, salaryInvalid } = roleFromForm(roleForm());
    expect(salaryInvalid).toBe(false);
    const parsed = zRole.parse(input);
    expect(parsed.salaryMinCents).toBe(13_000_000);
    expect(parsed.salaryMaxCents).toBe(16_000_000);
    expect(parsed.requiredSkills).toEqual(["TypeScript", "Postgres"]);
    expect(parsed.criteria).toHaveLength(1);
    expect(parsed.domainKnowledge).toBeNull();
  });

  it("requires at least one criterion", () => {
    const { input } = roleFromForm(roleForm({ "criteria.0.name": "", "criteria.0.description": "", "criteria.0.jobRelated": "" }));
    const result = zRole.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error.issues).criteria).toBeDefined();
  });

  it("rejects an upside-down salary range and proxy traits", () => {
    const { input } = roleFromForm(roleForm({ salaryMin: "200000", salaryMax: "100000", traits: "great culture fit" }));
    const result = zRole.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error.issues);
      expect(errors.salaryMaxCents).toBeDefined();
      expect(errors.traits).toBeDefined();
    }
  });

  it("flags a salary that is not a number", () => {
    expect(roleFromForm(roleForm({ salaryMin: "lots" })).salaryInvalid).toBe(true);
  });
});

describe("small helpers", () => {
  it("converts dollars to cents", () => {
    expect(dollarsToCents("140,000")).toBe(14_000_000);
    expect(dollarsToCents("")).toBeNull();
    expect(dollarsToCents("1e5")).toBeNaN();
  });

  it("splits lists and slugs names", () => {
    expect(splitList("a, b\nc,,a")).toEqual(["a", "b", "c"]);
    expect(slugify("Northwind Labs!")).toBe("northwind-labs");
    expect(slugify("!!!")).toBe("company");
  });

  it("validates hire input", () => {
    expect(zHire.safeParse({ roleId: "r", candidateId: "c", salaryCents: 14_000_000, startDate: "2026-11-02" }).success).toBe(true);
    expect(zHire.safeParse({ roleId: "r", candidateId: "c", salaryCents: 500, startDate: "2026-11-02" }).success).toBe(false);
    expect(zHire.safeParse({ roleId: "r", candidateId: "", salaryCents: 14_000_000, startDate: "2026-11-02" }).success).toBe(false);
  });

  it("labels interview status and salary ranges", () => {
    expect(interviewStatusLabel(null)).toBe("no interview yet");
    expect(interviewStatusLabel({ status: "COMPLETED", outcome: "PASS", scheduledAt: new Date() })).toBe("defense passed");
    expect(interviewStatusLabel({ status: "SCHEDULED", outcome: null, scheduledAt: new Date() })).toBe("interview scheduled");
    expect(salaryRangeLabel(13_000_000, 16_000_000, formatCents)).toBe("$130,000 to $160,000");
    expect(salaryRangeLabel(null, null, formatCents)).toBe("not set");
  });

  it("builds talent pool reasons from public facts only", () => {
    const reasons = talentReasons({ hackathons: ["Open Build Weekend", "Open Build Weekend"], verifiedCount: 1, skills: ["Go"], builtWith: ["Next.js"], location: "Seattle" });
    expect(reasons).toEqual(["finished Open Build Weekend", "1 verified project", "built with Next.js, Go", "based in Seattle"]);
    expect(reasons.join(" ")).not.toMatch(/score|match|rank/);
  });
});
