import "server-only";
import { prisma, toJson } from "@/lib/db";
import { auditAccess } from "@/lib/audit";
import type { CurrentUser } from "@/lib/auth";
import { buildReport, type ReportSnapshot } from "./build";

export { buildReport, type ReportSnapshot } from "./build";

/**
 * Builds the candidate report from live rows, upserts the CandidateReport snapshot and audits the view.
 * Call only after `authorizePage(user, "report.view", { roleId, candidateId })`.
 * Returns null when the candidate is not on this role's shortlist.
 */
export async function viewCandidateReport(user: CurrentUser, roleId: string, candidateId: string): Promise<{ id: string; snapshot: ReportSnapshot } | null> {
  const entry = await prisma.shortlistEntry.findFirst({
    where: { candidateId, shortlist: { roleId } },
    select: { projectId: true },
  });
  if (!entry) return null;
  const projectId = entry.projectId;

  const [role, candidate, project, reviews, calibrationNotes, decisions, interviews, summary] = await Promise.all([
    prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      select: { id: true, title: true, companyId: true, criteria: { select: { id: true, name: true, description: true, sortOrder: true } } },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: candidateId }, select: { id: true, name: true, username: true } }),
    prisma.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { id: true, title: true, tagline: true, repoUrl: true, links: true, verified: true, verifiedAt: true, hackathon: { select: { title: true, slug: true } } },
    }),
    prisma.review.findMany({
      where: { projectId, kind: "RUBRIC", status: "SUBMITTED" },
      select: {
        id: true,
        submittedAt: true,
        scores: {
          select: {
            score: true,
            rationale: true,
            evidenceRefs: true,
            roleCriterionId: true,
            dimension: { select: { key: true, name: true, description: true, anchors: true, sortOrder: true } },
          },
        },
      },
    }),
    prisma.calibrationNote.findMany({ where: { projectId }, select: { dimensionKey: true, note: true, resolvedScore: true, createdAt: true } }),
    prisma.decision.findMany({ where: { projectId }, select: { outcome: true, reason: true, decidedAt: true } }),
    prisma.interview.findMany({
      // Only interviews we ran (no role) or ones for this role; never another company's panel.
      where: { projectId, candidateId, OR: [{ roleId: null }, { roleId }] },
      select: { id: true, status: true, outcome: true, model: true, scheduledAt: true, completedAt: true, scores: { orderBy: { createdAt: "asc" }, select: { id: true, section: true, score: true, notes: true, scoredById: true } } },
    }),
    prisma.evidenceSummary.findFirst({ where: { projectId }, orderBy: { generatedAt: "desc" }, select: { content: true, model: true, seeded: true, generatedAt: true } }),
  ]);

  const snapshot = buildReport({ role, candidate, project, reviews, calibrationNotes, decisions, interviews, summary });
  const report = await prisma.candidateReport.upsert({
    where: { roleId_candidateId: { roleId, candidateId } },
    create: { companyId: role.companyId, roleId, candidateId, projectId, snapshot: toJson(snapshot) },
    update: { projectId, snapshot: toJson(snapshot) },
  });
  await auditAccess(user, "REPORT_VIEW", candidateId, { type: "CandidateReport", id: report.id, metadata: { roleId, projectId } });
  return { id: report.id, snapshot };
}
