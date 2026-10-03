import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

// Images are public (they illustrate submitted projects). Transcript files are only for their owner and admins;
// everyone else reads transcripts through the evidence locker, which checks permissions and writes the audit log.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await prisma.storedFile.findUnique({ where: { id } });
  if (!file) return new NextResponse("Not found", { status: 404 });
  if (file.kind !== "IMAGE") {
    const user = await getCurrentUser();
    if (!user || (user.id !== file.ownerId && user.role !== "ADMIN")) return new NextResponse("Not found", { status: 404 });
  }
  const bytes = await readStoredFile(file.path);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(bytes.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
      "Content-Disposition": `${file.kind === "IMAGE" ? "inline" : "attachment"}; filename="${file.id}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
