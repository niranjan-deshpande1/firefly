import { describe, expect, it } from "vitest";
import { identifiersFor, maskEvidence, maskIdentity, maskRow } from "@/lib/evidence/mask";

const maya = { name: "Maya Chen", username: "mayachen", email: "maya.chen@example.test" };
const ids = identifiersFor([maya], "https://github.com/example-mayachen/reschedule-desk");

describe("identifiersFor", () => {
  it("collects full name, name parts of 3+ letters, username, email and the repo owner", () => {
    expect(ids).toEqual(expect.arrayContaining(["Maya Chen", "Maya", "Chen", "mayachen", "maya.chen@example.test", "example-mayachen"]));
  });

  it("skips name parts shorter than 3 letters and missing fields", () => {
    const list = identifiersFor([{ name: "Al Bo Ng", username: null, email: null }], null);
    expect(list).toEqual(["Al Bo Ng"]);
  });

  it("includes team members and ignores a non-GitHub repo", () => {
    const list = identifiersFor([maya, { name: "Lina Haddad", username: "linahaddad" }], "https://gitlab.example.test/x/y");
    expect(list).toEqual(expect.arrayContaining(["Lina", "Haddad", "linahaddad"]));
    expect(list).not.toContain("x");
  });
});

describe("maskIdentity", () => {
  it("masks the full name as one token, case-insensitively", () => {
    expect(maskIdentity("hi, I'm MAYA CHEN and maya chen wrote this", ids)).toBe("hi, I'm [builder] and [builder] wrote this");
  });

  it("masks single name parts, the username, the email and the handle", () => {
    expect(maskIdentity("Chen here. ping @mayachen or maya.chen@example.test, repo example-mayachen", ids)).toBe(
      "[builder] here. ping @[builder] or [builder], repo [builder]",
    );
  });

  it("only matches whole words", () => {
    expect(maskIdentity("the Mayan calendar, chenille, mayachens", ids)).toBe("the Mayan calendar, chenille, mayachens");
  });

  it("treats regex characters in names literally", () => {
    const odd = identifiersFor([{ name: "J.R. (Bob) O'Neil+", username: "a.b*c" }], null);
    expect(maskIdentity("by J.R. (Bob) O'Neil+ and a.b*c", odd)).toBe("by [builder] and [builder]");
    expect(odd).toEqual(expect.arrayContaining(["Bob", "O'Neil"]));
    expect(odd).not.toContain("J.R.");
    expect(maskIdentity("aXbbbc stays, so does J.R. alone", odd)).toBe("aXbbbc stays, so does J.R. alone");
  });

  it("matches names with letters outside ASCII", () => {
    const list = identifiersFor([{ name: "Zoë Álvarez" }], null);
    expect(maskIdentity("zoë and ÁLVAREZ, not zoëy", list)).toBe("[builder] and [builder], not zoëy");
  });

  it("leaves text alone with no identifiers", () => {
    expect(maskIdentity("Maya Chen", [])).toBe("Maya Chen");
  });
});

describe("maskRow and maskEvidence", () => {
  it("masks free-text fields and leaves ids, urls and dates alone", () => {
    const at = new Date();
    const row = { id: "proj-maya-c0", title: "Maya's notes", url: "https://github.com/example-mayachen/x", decidedAt: at };
    expect(maskRow(row, ids)).toEqual({ id: "proj-maya-c0", title: "[builder]'s notes", url: "https://github.com/example-mayachen/x", decidedAt: at });
  });

  it("masks every evidence list and the summary without changing the input", () => {
    const input = {
      commits: [{ message: "chen: init" }],
      transcripts: [{ content: "me (maya): hello" }],
      decisions: [{ reasoning: "Maya picked it" }],
      checkIns: [{ progress: "mayachen shipped" }],
      summary: { content: "Maya Chen tests first", model: null },
    };
    const out = maskEvidence(input, ids);
    expect(out.commits[0].message).toBe("[builder]: init");
    expect(out.transcripts[0].content).toBe("me ([builder]): hello");
    expect(out.decisions[0].reasoning).toBe("[builder] picked it");
    expect(out.checkIns[0].progress).toBe("[builder] shipped");
    expect(out.summary?.content).toBe("[builder] tests first");
    expect(input.summary.content).toBe("Maya Chen tests first");
  });
});
