import { describe, expect, it } from "vitest";
import {
  allTags,
  commentSchema,
  filterByBuiltWith,
  galleryIsOpen,
  isBeforeDeadline,
  isHttpUrl,
  paramList,
  parseBuiltWith,
  postingProblems,
  projectInputSchema,
  showBuilderNames,
} from "@/lib/projects/schema";

const base = {
  projectId: null,
  hackathonId: "h1",
  title: "Tide Clock",
  tagline: "a clock for tides",
  story: "## how",
  builtWith: ["Next.js"],
  links: [],
  repoUrl: "",
  videoUrl: "",
  teamId: null,
  intent: "draft" as const,
};

describe("isHttpUrl", () => {
  it("accepts http and https only", () => {
    expect(isHttpUrl("https://example.com/a")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,hi")).toBe(false);
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false);
  });
});

describe("projectInputSchema", () => {
  it("turns blank optional urls into null", () => {
    const r = projectInputSchema.parse(base);
    expect(r.repoUrl).toBeNull();
    expect(r.videoUrl).toBeNull();
  });

  it("rejects non-http urls in every url field", () => {
    expect(projectInputSchema.safeParse({ ...base, repoUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...base, videoUrl: "ftp://x.y" }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...base, links: [{ label: "demo", url: "data:text/html,x" }] }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...base, links: [{ label: "demo", url: "https://x.y" }] }).success).toBe(true);
  });

  it("requires a title even for drafts", () => {
    expect(projectInputSchema.safeParse({ ...base, title: "  " }).success).toBe(false);
  });

  it("dedupes built-with tags", () => {
    expect(projectInputSchema.parse({ ...base, builtWith: ["React", "react", " Go "] }).builtWith).toEqual(["React", "Go"]);
  });
});

describe("postingProblems", () => {
  it("lists what blocks posting", () => {
    expect(postingProblems({ title: "x", tagline: "", story: " " })).toHaveLength(2);
    expect(postingProblems({ title: "x", tagline: "y", story: "z" })).toEqual([]);
  });
});

describe("parseBuiltWith", () => {
  it("splits a comma list", () => {
    expect(parseBuiltWith("react, Next.js,, postgres , React")).toEqual(["react", "Next.js", "postgres"]);
  });
});

describe("deadline and visibility", () => {
  const deadline = new Date("2026-07-22T17:00:00Z");
  it("allows changes up to the deadline", () => {
    expect(isBeforeDeadline(deadline, new Date("2026-07-22T17:00:00Z"))).toBe(true);
    expect(isBeforeDeadline(deadline, new Date("2026-07-22T17:00:01Z"))).toBe(false);
  });

  it("opens hiring-cohort galleries only after the deadline", () => {
    const before = new Date("2026-07-20T00:00:00Z");
    const after = new Date("2026-07-23T00:00:00Z");
    expect(galleryIsOpen({ hackathonType: "OPEN", submissionDeadline: deadline, now: before })).toBe(true);
    expect(galleryIsOpen({ hackathonType: "HIRING_COHORT", submissionDeadline: deadline, now: before })).toBe(false);
    expect(galleryIsOpen({ hackathonType: "HIRING_COHORT", submissionDeadline: deadline, now: after })).toBe(true);
  });

  it("hides builder names in hiring cohorts until results, except for insiders", () => {
    expect(showBuilderNames({ hackathonType: "OPEN", hackathonStatus: "JUDGING", viewerIsInsider: false })).toBe(true);
    expect(showBuilderNames({ hackathonType: "HIRING_COHORT", hackathonStatus: "JUDGING", viewerIsInsider: false })).toBe(false);
    expect(showBuilderNames({ hackathonType: "HIRING_COHORT", hackathonStatus: "JUDGING", viewerIsInsider: true })).toBe(true);
    expect(showBuilderNames({ hackathonType: "HIRING_COHORT", hackathonStatus: "COMPLETED", viewerIsInsider: false })).toBe(true);
  });
});

describe("gallery filter", () => {
  const projects = [
    { id: "a", builtWith: ["React", "Postgres"] },
    { id: "b", builtWith: ["react"] },
    { id: "c", builtWith: ["Go"] },
  ];
  it("keeps projects with every selected tag, case-insensitively", () => {
    expect(filterByBuiltWith(projects, ["react"]).map((p) => p.id)).toEqual(["a", "b"]);
    expect(filterByBuiltWith(projects, ["REACT", "postgres"]).map((p) => p.id)).toEqual(["a"]);
    expect(filterByBuiltWith(projects, []).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
  it("lists tags alphabetically, once", () => {
    expect(allTags(projects)).toEqual(["Go", "Postgres", "React"]);
  });
  it("reads one or many params", () => {
    expect(paramList(undefined)).toEqual([]);
    expect(paramList("go")).toEqual(["go"]);
    expect(paramList(["go", " "])).toEqual(["go"]);
  });
});

describe("commentSchema", () => {
  it("trims and bounds comments", () => {
    expect(commentSchema.safeParse({ projectId: "p", body: "   " }).success).toBe(false);
    expect(commentSchema.parse({ projectId: "p", body: " nice work " }).body).toBe("nice work");
    expect(commentSchema.safeParse({ projectId: "p", body: "x".repeat(2001) }).success).toBe(false);
  });
});
