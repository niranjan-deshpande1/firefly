// Upload validation, kept pure so it is unit tested. Content is sniffed; declared types are not trusted.
import type { FileKind } from "@/lib/db/enums";

export const LIMITS: Record<FileKind, number> = {
  IMAGE: 5 * 1024 * 1024,
  TRANSCRIPT: 2 * 1024 * 1024,
};

const IMAGE_SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/png", ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/gif", ext: "gif", test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

export type Validated = { ok: true; mime: string; ext: string } | { ok: false; error: string };

export function validateUpload(kind: FileKind, name: string, bytes: Uint8Array): Validated {
  if (bytes.byteLength === 0) return { ok: false, error: "The file is empty." };
  if (bytes.byteLength > LIMITS[kind]) {
    return { ok: false, error: `The file is too large. The limit is ${LIMITS[kind] / (1024 * 1024)} MB.` };
  }
  if (kind === "IMAGE") {
    const match = IMAGE_SIGNATURES.find((s) => s.test(bytes));
    return match ? { ok: true, mime: match.mime, ext: match.ext } : { ok: false, error: "Upload a PNG, JPEG, GIF or WebP image." };
  }
  const lower = name.toLowerCase();
  const ext = lower.endsWith(".md") || lower.endsWith(".markdown") ? "md" : lower.endsWith(".txt") ? "txt" : null;
  if (!ext) return { ok: false, error: "Transcripts must be .txt or .md files." };
  if (bytes.includes(0)) return { ok: false, error: "Transcripts must be plain text." };
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "Transcripts must be UTF-8 text." };
  }
  return { ok: true, mime: ext === "md" ? "text/markdown" : "text/plain", ext };
}
