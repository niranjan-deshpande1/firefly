import "server-only";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma, type FileKind } from "@/lib/db";
import { validateUpload } from "./validate";

export { LIMITS, validateUpload } from "./validate";

// Runtime uploads dir; keep it out of the bundle trace.
const ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "storage");

export class UploadError extends Error {}

/** Validates and stores an uploaded file under ./storage. Returns the StoredFile row. */
export async function saveFile(ownerId: string, kind: FileKind, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = validateUpload(kind, file.name, bytes);
  if (!result.ok) throw new UploadError(result.error);
  const relative = path.join(/*turbopackIgnore: true*/ kind.toLowerCase(), `${randomUUID()}.${result.ext}`);
  const absolute = path.join(/*turbopackIgnore: true*/ ROOT, relative);
  await mkdir(path.dirname(/*turbopackIgnore: true*/ absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return prisma.storedFile.create({
    data: {
      ownerId,
      path: relative,
      kind,
      mimeType: result.mime,
      sizeBytes: bytes.byteLength,
      originalName: file.name.slice(0, 200),
    },
  });
}

/** Reads a stored file's bytes. Paths come only from the database, never from the request. */
export async function readStoredFile(relativePath: string): Promise<Buffer> {
  const absolute = path.resolve(/*turbopackIgnore: true*/ ROOT, relativePath);
  if (!absolute.startsWith(ROOT + path.sep)) throw new UploadError("Invalid path.");
  return readFile(absolute);
}

export async function deleteStoredFile(id: string): Promise<void> {
  const row = await prisma.storedFile.delete({ where: { id } });
  await unlink(path.resolve(/*turbopackIgnore: true*/ ROOT, row.path)).catch(() => undefined);
}

/** URL the app uses to serve a stored file through the authenticated route handler. */
export const fileUrl = (id: string) => `/api/files/${id}`;
