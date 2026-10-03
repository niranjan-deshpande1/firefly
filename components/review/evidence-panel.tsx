import { CheckInHistory, CommitTimeline, DecisionLog, EvidenceSummaryCard, TranscriptViewer } from "@/components/evidence";
import type { loadEvidence } from "@/lib/review/queries";

type Evidence = Awaited<ReturnType<typeof loadEvidence>>;

/** Evidence beside the rubric. Commit authors stay masked until the reviewer reveals the identity. */
export function EvidencePanel({ evidence, blind }: { evidence: Evidence; blind: boolean }) {
  // Only the fields the components need, so author names and emails never reach the page while blind.
  const commits = evidence.commits.map((c) => ({
    id: c.id,
    sha: c.sha,
    message: c.message,
    authorName: blind ? "" : c.authorName,
    committedAt: c.committedAt,
    additions: c.additions,
    deletions: c.deletions,
    url: blind ? null : c.url,
  }));
  return (
    <div className="flex flex-col gap-8">
      <Section title="summary">
        <EvidenceSummaryCard summary={evidence.summary} />
      </Section>
      <Section title="commits">
        <CommitTimeline commits={commits} blind={blind} />
      </Section>
      <Section title="decision log">
        <DecisionLog entries={evidence.decisions} />
      </Section>
      <Section title="check-ins">
        <CheckInHistory checkIns={evidence.checkIns} />
      </Section>
      <Section title="AI transcripts">
        <TranscriptViewer transcripts={evidence.transcripts} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="type-eyebrow text-secondary">{title}</h2>
      {children}
    </section>
  );
}
