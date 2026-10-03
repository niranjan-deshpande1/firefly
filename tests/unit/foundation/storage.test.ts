import { describe, expect, it } from "vitest";
import { LIMITS, validateUpload } from "@/lib/storage/validate";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("validateUpload", () => {
  it("accepts a real PNG regardless of name", () => {
    expect(validateUpload("IMAGE", "x.txt", png)).toEqual({ ok: true, mime: "image/png", ext: "png" });
  });
  it("rejects a non-image disguised as an image", () => {
    expect(validateUpload("IMAGE", "x.png", new TextEncoder().encode("<svg onload=alert(1)>")).ok).toBe(false);
  });
  it("enforces size limits", () => {
    expect(validateUpload("IMAGE", "x.png", new Uint8Array(LIMITS.IMAGE + 1)).ok).toBe(false);
    expect(validateUpload("TRANSCRIPT", "t.md", new Uint8Array(LIMITS.TRANSCRIPT + 1).fill(97)).ok).toBe(false);
  });
  it("accepts UTF-8 .md and .txt transcripts only", () => {
    const text = new TextEncoder().encode("User: hi\nAssistant: hello");
    expect(validateUpload("TRANSCRIPT", "chat.md", text)).toMatchObject({ ok: true, mime: "text/markdown" });
    expect(validateUpload("TRANSCRIPT", "chat.txt", text)).toMatchObject({ ok: true, mime: "text/plain" });
    expect(validateUpload("TRANSCRIPT", "chat.html", text).ok).toBe(false);
    expect(validateUpload("TRANSCRIPT", "chat.md", new Uint8Array([0x61, 0x00, 0x62])).ok).toBe(false);
    expect(validateUpload("TRANSCRIPT", "chat.md", new Uint8Array([0xff, 0xfe, 0xfd])).ok).toBe(false);
  });
  it("rejects empty files", () => {
    expect(validateUpload("TRANSCRIPT", "a.md", new Uint8Array()).ok).toBe(false);
  });
});
