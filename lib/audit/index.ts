import "server-only";
import { prisma, toJson, type AuditAction } from "@/lib/db";
import { needsAccessAudit, type Actor } from "@/lib/permissions/rules";

export type AuditInput = {
  actorId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  subjectUserId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function audit(input: AuditInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      subjectUserId: input.subjectUserId ?? null,
      metadata: toJson(input.metadata ?? {}),
    },
  });
}

// ponytail: a 10-minute window. Reloading the scoring workspace or locker re-renders every transcript; one row per
// person, resource and window keeps the log readable. Report views and identity reveals are always written.
export const ACCESS_DEDUPE_MS = 10 * 60 * 1000;
const DEDUPED: readonly AuditAction[] = ["EVIDENCE_VIEW", "TRANSCRIPT_VIEW"];

/**
 * Logs a view of a candidate's report, evidence locker or transcript by anyone other than that candidate.
 * Evidence and transcript views skip the write when the same actor viewed the same resource in the last 10 minutes.
 * Returns true when an entry was written.
 */
export async function auditAccess(
  actor: Actor,
  action: Extract<AuditAction, "REPORT_VIEW" | "EVIDENCE_VIEW" | "TRANSCRIPT_VIEW" | "IDENTITY_REVEAL">,
  subjectUserId: string,
  resource: { type: string; id: string; metadata?: Record<string, unknown> },
): Promise<boolean> {
  if (!needsAccessAudit(actor, subjectUserId)) return false;
  if (DEDUPED.includes(action)) {
    const recent = await prisma.auditLog.findFirst({
      where: {
        actorId: actor!.id,
        action,
        resourceType: resource.type,
        resourceId: resource.id,
        createdAt: { gte: new Date(Date.now() - ACCESS_DEDUPE_MS) },
      },
      select: { id: true },
    });
    if (recent) return false;
  }
  await audit({
    actorId: actor!.id,
    action,
    resourceType: resource.type,
    resourceId: resource.id,
    subjectUserId,
    metadata: resource.metadata,
  });
  return true;
}
