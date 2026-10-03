import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { fileUrl, saveFile, UploadError } from "@/lib/storage";
import { imageMetaSchema, isBeforeDeadline } from "@/lib/projects/schema";

// Image upload for the posting flow. A route handler (instead of a server action) because server actions
// cap request bodies at 1 MB and images may be up to 5 MB (lib/storage LIMITS).
const MAX_IMAGES = 8;

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!(await check(user, "project.edit", { projectId: id }))) return fail("not found", 404);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("choose an image file first, then upload it.");
  const meta = imageMetaSchema.safeParse({ projectId: id, alt: form?.get("alt") ?? "" });
  if (!meta.success) return fail(meta.error.issues[0].message);

  const project = await prisma.project.findUnique({
    where: { id },
    select: { hackathon: { select: { slug: true, submissionDeadline: true } }, _count: { select: { images: true } } },
  });
  if (!project) return fail("not found", 404);
  if (!isBeforeDeadline(project.hackathon.submissionDeadline)) return fail("the posting deadline passed, changes are closed.");
  if (project._count.images >= MAX_IMAGES) return fail(`a project holds ${MAX_IMAGES} images, remove one first.`);

  try {
    const stored = await saveFile(user!.id, "IMAGE", file);
    const image = await prisma.projectImage.create({
      data: { projectId: id, url: fileUrl(stored.id), alt: meta.data.alt, sortOrder: project._count.images },
      select: { id: true, url: true, alt: true },
    });
    revalidatePath(`/projects/${id}`);
    revalidatePath(`/hackathons/${project.hackathon.slug}/projects`);
    return NextResponse.json({ ok: true, image });
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message);
    throw e;
  }
}
