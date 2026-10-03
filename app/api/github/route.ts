import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { canRefresh, fetchRepo, parseRepoUrl } from "@/lib/evidence/github";

const bodySchema = z.object({ projectId: z.string().min(1).max(100) });

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

/**
 * Reads the project's public GitHub repo (metadata and recent commits) and stores a snapshot.
 * Project members only. Code is never cloned or run. On any failure the existing (seeded) data stays.
 */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("that request was not understood, reload the page and try again.", 400);
  const { projectId } = parsed.data;

  const user = await getCurrentUser();
  if (!user) return fail("you are signed out, sign in and try again.", 401);
  // 404 rather than 403 so non-members learn nothing about the project.
  if (!(await check(user, "evidence.edit", { projectId }))) return fail("that project was not found, check the link.", 404);

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { repoUrl: true } });
  const repo = parseRepoUrl(project?.repoUrl);
  if (!project || !repo) return fail("the project has no github.com repo link, add one on the project page and try again.", 400);

  const lastLive = await prisma.repoSnapshot.findFirst({ where: { projectId, source: "GITHUB" }, orderBy: { fetchedAt: "desc" } });
  if (!canRefresh(lastLive?.fetchedAt)) return fail("the repo was read in the last 10 minutes, try again later.", 429);

  let fetched;
  try {
    fetched = await fetchRepo(repo.owner, repo.name);
  } catch {
    return fail("github could not be reached or the repo is not public, the saved commits are still shown.", 502);
  }

  await prisma.$transaction(async (tx) => {
    const snapshot = await tx.repoSnapshot.create({
      data: {
        projectId,
        repoUrl: project.repoUrl!,
        owner: repo.owner,
        name: repo.name,
        defaultBranch: fetched.defaultBranch,
        headSha: fetched.headSha,
        source: "GITHUB",
      },
    });
    for (const c of fetched.commits) {
      const data = { ...c, snapshotId: snapshot.id };
      await tx.commit.upsert({ where: { projectId_sha: { projectId, sha: c.sha } }, create: { projectId, ...data }, update: data });
    }
  });

  revalidatePath(`/projects/${projectId}/evidence`);
  return NextResponse.json({ ok: true, commits: fetched.commits.length });
}
