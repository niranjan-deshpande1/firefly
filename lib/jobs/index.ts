import "server-only";
import { subMonths } from "date-fns";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { deleteStoredFile } from "@/lib/storage";

// Scheduled jobs. Plain functions, run by `npm run jobs` (cron) or the admin settings button.
// Each job is safe to run again at any time: a second run finds nothing left to do.

/** Emails candidates whose held feedback has become visible. Each row is claimed before sending, so two runs never double-send. */
export async function releaseHeldFeedback(now: Date): Promise<{ feedbackEmails: number }> {
  const due = await prisma.feedback.findMany({
    where: { visibleAt: { lte: now }, notifiedAt: null },
    select: { id: true, projectId: true, candidate: { select: { email: true, name: true } } },
  });
  let feedbackEmails = 0;
  for (const f of due) {
    const claim = await prisma.feedback.updateMany({ where: { id: f.id, notifiedAt: null }, data: { notifiedAt: now } });
    if (claim.count === 0) continue; // another run got it first
    if (!f.candidate.email) continue;
    try {
      await sendEmail(f.candidate.email, "feedbackReady", { name: f.candidate.name ?? "there" }, { projectId: f.projectId });
    } catch (error) {
      // Release the claim so the next run retries this row.
      await prisma.feedback.updateMany({ where: { id: f.id, notifiedAt: now }, data: { notifiedAt: null } });
      throw error;
    }
    feedbackEmails++;
  }
  return { feedbackEmails };
}

export type RetentionCounts = {
  hackathons: number;
  projects: number;
  transcripts: number;
  files: number;
  decisionLogEntries: number;
  commits: number;
  repoSnapshots: number;
  evidenceSummaries: number;
  candidateReports: number;
  checkIns: number;
};

/** First moment that is still inside the retention window. Hackathons that ended before it are purged. */
export const retentionCutoff = (now: Date, retentionMonths: number) => subMonths(now, retentionMonths);

/**
 * Enforces the consent promise (components/profiles/consent-copy.tsx): process evidence from each hackathon is
 * deleted `retentionMonths` after that hackathon ends, except evidence of a project someone was hired from and the
 * check-ins of the builder who was hired. Projects, reviews, decisions, interviews, invoices, hires and audit rows stay.
 * Writes one RETENTION_RUN audit entry per run.
 */
export async function enforceRetention(now: Date, actorId: string | null = null): Promise<RetentionCounts> {
  const { retentionMonths } = await getSettings();
  const cutoff = retentionCutoff(now, retentionMonths);
  const hackathonIds = (await prisma.hackathon.findMany({ where: { endsAt: { lt: cutoff } }, select: { id: true } })).map((h) => h.id);

  const hired = await prisma.shortlistEntry.findMany({
    where: { status: "HIRED", project: { hackathonId: { in: hackathonIds } } },
    select: { projectId: true, candidateId: true, project: { select: { hackathonId: true } } },
  });
  const projectIds = (
    await prisma.project.findMany({
      where: { hackathonId: { in: hackathonIds }, id: { notIn: hired.map((h) => h.projectId) } },
      select: { id: true },
    })
  ).map((p) => p.id);
  const inProjects = { projectId: { in: projectIds } };

  // Files first: if the run stops halfway, the transcript rows remain and the next run finishes the job.
  const fileIds = (await prisma.aITranscript.findMany({ where: { ...inProjects, fileId: { not: null } }, select: { fileId: true } })).map((t) => t.fileId!);
  const files = await prisma.storedFile.findMany({ where: { id: { in: fileIds } }, select: { id: true } });
  for (const f of files) await deleteStoredFile(f.id);

  const [transcripts, decisionLogEntries, commits, repoSnapshots, evidenceSummaries, candidateReports, checkIns] = await prisma.$transaction([
    prisma.aITranscript.deleteMany({ where: inProjects }),
    prisma.decisionLogEntry.deleteMany({ where: inProjects }),
    prisma.commit.deleteMany({ where: inProjects }),
    prisma.repoSnapshot.deleteMany({ where: inProjects }),
    prisma.evidenceSummary.deleteMany({ where: inProjects }),
    // Reports are a cached copy that includes the evidence summary; they rebuild from live rows on the next view.
    prisma.candidateReport.deleteMany({ where: inProjects }),
    prisma.checkIn.deleteMany({
      where: { hackathonId: { in: hackathonIds }, NOT: hired.map((h) => ({ hackathonId: h.project.hackathonId, userId: h.candidateId })) },
    }),
  ]);

  const counts: RetentionCounts = {
    hackathons: hackathonIds.length,
    projects: projectIds.length,
    transcripts: transcripts.count,
    files: files.length,
    decisionLogEntries: decisionLogEntries.count,
    commits: commits.count,
    repoSnapshots: repoSnapshots.count,
    evidenceSummaries: evidenceSummaries.count,
    candidateReports: candidateReports.count,
    checkIns: checkIns.count,
  };
  await audit({ actorId, action: "RETENTION_RUN", resourceType: "AppSetting", metadata: { retentionMonths, cutoff: cutoff.toISOString(), ...counts } });
  return counts;
}

export type JobCounts = { feedbackEmails: number; retention: RetentionCounts };

/** Runs every scheduled job once. `actorId` is the admin who pressed the button, or null for cron. */
export async function runJobs(now: Date = new Date(), actorId: string | null = null): Promise<JobCounts> {
  const { feedbackEmails } = await releaseHeldFeedback(now);
  const retention = await enforceRetention(now, actorId);
  return { feedbackEmails, retention };
}
