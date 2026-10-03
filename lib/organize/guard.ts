import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, type AuditAction } from "@/lib/db";
import { audit } from "@/lib/audit";
import type { CurrentUser } from "@/lib/auth";
import { authorize, authorizePage, ForbiddenError, requireRole, requireRoleForAction, type Action } from "@/lib/permissions";
import type { ActionResult } from "./schemas";

/** Page guard: the hackathon by slug, 404 unless the user organizes it (or is an admin). Cached per request. */
export const managedHackathon = cache(async (slug: string) => {
  const user = await requireRole("ORGANIZER");
  const hackathon = await prisma.hackathon.findUnique({ where: { slug }, include: { cohortConfig: true } });
  if (!hackathon) notFound();
  await authorizePage(user, "hackathon.manage", { hackathonId: hackathon.id });
  return { user, hackathon };
});

const zHackathonId = z.string().min(1).max(64);

/** Action guard: reads hackathonId from the form, checks the permission, returns the row. */
export async function managedForAction(form: FormData, action: Action = "hackathon.manage") {
  const user: CurrentUser = await requireRoleForAction("ORGANIZER");
  const parsed = zHackathonId.safeParse(form.get("hackathonId"));
  if (!parsed.success) throw new ForbiddenError("that hackathon was not found, reload the page and try again.");
  const hackathon = await prisma.hackathon.findUnique({ where: { id: parsed.data }, include: { cohortConfig: true } });
  if (!hackathon) throw new ForbiddenError("that hackathon was not found, reload the page and try again.");
  await authorize(user, action, { hackathonId: hackathon.id });
  return { user, hackathon };
}

/** Turns permission failures into an error result; everything else (redirects included) propagates. */
export async function guarded<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Every page that shows organizer-managed data for this hackathon. */
export function revalidateHackathon(slug: string) {
  revalidatePath("/organize");
  revalidatePath(`/organize/${slug}`, "layout");
  revalidatePath(`/hackathons/${slug}`, "layout");
  revalidatePath("/hackathons");
}

/** Unique-constraint violation (Prisma P2002), e.g. a slug taken between check and write. */
export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";
}

/** Audit row for an organizer change to a hackathon. Keep metadata to ids and changed field names. */
export function auditHackathon(actorId: string, action: AuditAction, hackathonId: string, metadata?: Record<string, unknown>) {
  return audit({ actorId, action, resourceType: "Hackathon", resourceId: hackathonId, metadata });
}
