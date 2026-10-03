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

/**
 * Logs a view of a candidate's report, evidence locker or transcript by anyone other than that candidate.
 * Returns true when an entry was written.
 */
export async function auditAccess(
  actor: Actor,
  action: Extract<AuditAction, "REPORT_VIEW" | "EVIDENCE_VIEW" | "TRANSCRIPT_VIEW" | "IDENTITY_REVEAL">,
  subjectUserId: string,
  resource: { type: string; id: string; metadata?: Record<string, unknown> },
): Promise<boolean> {
  if (!needsAccessAudit(actor, subjectUserId)) return false;
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
