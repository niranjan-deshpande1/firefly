import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { saveFile, UploadError } from "@/lib/storage";

// A route handler (not a server action) because transcripts may be up to 2 MB and actions cap bodies at 1 MB.
const fieldsSchema = z.object({
  title: z.string().trim().min(1, "add a title, then upload the transcript.").max(140, "keep the title under 140 characters, then upload again."),
  tool: z
    .string()
    .trim()
    .max(60, "keep the tool name under 60 characters, then upload again.")
    .transform((v) => v || null),
});

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("you are signed out, sign in and try again.", 401);
  if (!(await check(user, "evidence.edit", { projectId }))) return fail("that project was not found, check the link.", 404);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return fail("no file was attached, choose a .txt or .md transcript.", 400);
  const parsed = fieldsSchema.safeParse({ title: form.get("title") ?? "", tool: form.get("tool") ?? "" });
  if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

  let stored;
  try {
    stored = await saveFile(user.id, "TRANSCRIPT", file);
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message, 400);
    throw e;
  }
  // saveFile has already checked UTF-8; the text is kept as plain, untrusted content.
  const content = new TextDecoder().decode(await file.arrayBuffer());
  const transcript = await prisma.aITranscript.create({
    data: { projectId, title: parsed.data.title, tool: parsed.data.tool, content, fileId: stored.id },
    select: { id: true },
  });

  revalidatePath(`/projects/${projectId}/evidence`);
  return NextResponse.json({ ok: true, id: transcript.id });
}
