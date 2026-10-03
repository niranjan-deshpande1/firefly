import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, parseLinks, parseSkills, profileSchema, randomBlindCode, safeNext, uniqueBlindCode } from "@/lib/profiles";
import { isProfileVisible } from "@/lib/profiles/queries";

describe("safeNext", () => {
  it("keeps same-origin relative paths with query and hash", () => {
    expect(safeNext("/hackathons/spring/register?x=1#a", "/dashboard")).toBe("/hackathons/spring/register?x=1#a");
  });
  it("rejects absolute, protocol-relative and backslash tricks", () => {
    for (const bad of ["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "dashboard", "", undefined, ["/a"], "/.//evil.test", "/%2e//evil.test", "/a/..//evil.test", "/./\\evil.test"]) {
      expect(safeNext(bad, "/dashboard")).toBe("/dashboard");
    }
  });
});

describe("blind codes", () => {
  it("are four uppercase hex characters", () => {
    expect(randomBlindCode(() => 0)).toBe("0000");
    expect(randomBlindCode(() => 0.99999)).toBe("FFFF");
    expect(randomBlindCode()).toMatch(/^[0-9A-F]{4}$/);
  });
  it("skip taken codes and give up after the try limit", async () => {
    const seq = [0, 0.5];
    const code = await uniqueBlindCode(async (c) => c === "0000", () => seq.shift() ?? 0.5);
    expect(code).toBe("8000");
    await expect(uniqueBlindCode(async () => true, Math.random, 3)).rejects.toThrow();
  });
});

describe("parseLinks", () => {
  it("reads label plus address, or address alone", () => {
    expect(parseLinks("portfolio site https://maya.example/work\n\nhttps://github.com/maya").links).toEqual([
      { label: "portfolio site", url: "https://maya.example/work" },
      { label: "github.com", url: "https://github.com/maya" },
    ]);
  });
  it("refuses non-web schemes and bare words", () => {
    expect(parseLinks("x javascript:alert(1)").error).toBeTruthy();
    expect(parseLinks("my site").error).toBeTruthy();
  });
  it("caps the list at 8", () => {
    expect(parseLinks(Array.from({ length: 9 }, (_, i) => `https://a.example/${i}`).join("\n")).error).toBeTruthy();
  });
});

describe("parseSkills", () => {
  it("trims, drops blanks and case-insensitive duplicates", () => {
    expect(parseSkills(" TypeScript, , typescript,Postgres ")).toEqual(["TypeScript", "Postgres"]);
  });
});

describe("profileSchema", () => {
  const base = { name: "Maya Chen", username: "MayaChen", headline: "", bio: "", skills: "", links: "", location: "", school: "", experienceLevel: "" };
  it("lowercases the username and turns blanks into null", () => {
    const parsed = profileSchema.parse(base);
    expect(parsed.username).toBe("mayachen");
    expect(parsed.headline).toBeNull();
    expect(parsed.experienceLevel).toBeNull();
  });
  it("rejects bad usernames and unknown experience levels", () => {
    expect(profileSchema.safeParse({ ...base, username: "-maya" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, username: "ma" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, experienceLevel: "WIZARD" }).success).toBe(false);
  });
});

describe("visibility", () => {
  it("shows public profiles to everyone and hidden ones to owner and admins only", () => {
    expect(isProfileVisible("PUBLIC", false)).toBe(true);
    expect(isProfileVisible("PRIVATE", false)).toBe(false);
    expect(isProfileVisible("PLATFORM", false)).toBe(false);
    expect(isProfileVisible("PRIVATE", true)).toBe(true);
  });
  it("has a dated consent version", () => {
    // A second change on the same day adds a suffix, for example 2026-10-03.2.
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}(\.\d+)?$/);
  });
});
