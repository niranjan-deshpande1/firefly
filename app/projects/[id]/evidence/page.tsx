// Owner: evidence builder. Archetype: record (cartoon-free evidence surface, manual 5.3).
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can, loadFacts } from "@/lib/permissions";
import { auditAccess } from "@/lib/audit";
import { isBlindViewer, loadIdentifiers, loadLocker } from "@/lib/evidence/queries";
import { maskEvidence } from "@/lib/evidence/mask";
import { isSummaryEnabled } from "@/lib/evidence/summary";
import { parseRepoUrl } from "@/lib/evidence/github";
import { PageHeader, TextLink, Time } from "@/components/ui";
import { CheckInHistory, CommitTimeline, DecisionLog, EvidenceSummaryCard, TranscriptViewer } from "@/components/evidence";
import { DecisionEditor, RepoRefresh, SummaryRefresh, TranscriptUpload } from "@/components/evidence/locker-controls";

const SECTIONS = [
  { id: "commits", label: "commits" },
  { id: "summary", label: "summary" },
  { id: "transcripts", label: "AI transcripts" },
  { id: "decisions", label: "decision log" },
  { id: "check-ins", label: "check-ins" },
];

export default async function EvidenceLockerPage({ params }: PageProps<"/projects/[id]/evidence">) {
  const { id } = await params;
  const user = await requireUser();
  const facts = await loadFacts(user, { projectId: id });
  if (!can(user, "evidence.view", facts)) notFound();

  const locker = await loadLocker(id);
  if (!locker) notFound();
  const { project, latestSnapshot } = locker;

  const blind = isBlindViewer(user.role, facts);
  // A builder may have typed their own name into any free text, so a blind viewer gets it masked.
  const { commits, transcripts, decisions, checkIns, summary } = blind ? maskEvidence(locker, await loadIdentifiers(project.id)) : locker;
  const canEdit = can(user, "evidence.edit", facts);

  // Every view by someone outside the project is logged, and each transcript shown counts as opened (brief 4.4).
  if (!facts.isProjectMember) {
    await auditAccess(user, "EVIDENCE_VIEW", project.ownerId, { type: "Project", id: project.id, metadata: { blind } });
    await Promise.all(
      transcripts.map((t) => auditAccess(user, "TRANSCRIPT_VIEW", project.ownerId, { type: "AITranscript", id: t.id, metadata: { projectId: project.id, blind } })),
    );
  }

  const repo = parseRepoUrl(project.repoUrl);
  const who = blind ? `candidate ${project.owner.candidateProfile?.blindCode ?? "hidden"}` : (project.owner.name ?? "this builder");

  return (
    <div className="flex flex-col gap-12 desktop:gap-24">
      <PageHeader
        title="evidence locker"
        description={
          <p>
            how <TextLink href={`/projects/${project.id}`}>{project.title}</TextLink> was built, by {who}.
            {blind ? " this review is blind: names, faces, repo links and commit authors stay hidden until you post your review." : ""}
          </p>
        }
        actions={canEdit ? <DecisionEditor projectId={project.id} primary /> : undefined}
      />

      <div className="grid grid-cols-1 gap-8 desktop:grid-cols-12 desktop:gap-6">
        <section aria-labelledby="commits" className="flex min-w-0 flex-col gap-4 desktop:col-span-8">
          <h2 id="commits" className="type-display-3 scroll-mt-8">
            commit timeline
          </h2>
          <CommitTimeline commits={commits} blind={blind} />
        </section>

        <aside aria-label="repo and sections" className="flex flex-col gap-6 desktop:col-span-4">
          <dl className="flex flex-col gap-3">
            {repo && !blind ? (
              <div className="flex flex-col gap-1">
                <dt className="type-label text-secondary">repo</dt>
                <dd className="type-body-s break-all">
                  <TextLink href={project.repoUrl!} target="_blank" rel="noreferrer noopener">
                    {repo.owner}/{repo.name}
                  </TextLink>
                </dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <dt className="type-label text-secondary">source</dt>
              <dd className="type-body-s">
                {latestSnapshot?.source === "GITHUB" ? (
                  <>
                    read from github <Time value={latestSnapshot.fetchedAt} format="datetime" />
                  </>
                ) : (
                  "prepared data, not read from github yet"
                )}
              </dd>
            </div>
            <p className="type-label text-secondary measure">commit dates are set by whoever commits. the read time above is ours.</p>
          </dl>
          {canEdit && repo ? <RepoRefresh projectId={project.id} /> : null}
          {canEdit && !repo ? (
            <p className="type-body-s text-secondary measure">
              add a github.com repo link on <TextLink href={`/projects/${project.id}/edit`}>the project form</TextLink> to read commits.
            </p>
          ) : null}
          <nav aria-label="evidence sections">
            <ul className="flex flex-col">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="link type-body-s target inline-flex items-center">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <div id="summary" className="flex scroll-mt-8 flex-col gap-3 desktop:w-2/3">
        <EvidenceSummaryCard summary={summary} />
        {isSummaryEnabled() ? <SummaryRefresh projectId={project.id} /> : null}
      </div>

      <section aria-labelledby="transcripts" className="flex flex-col gap-4 desktop:w-2/3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="transcripts" className="type-display-3 scroll-mt-8">
            AI transcripts
          </h2>
          {canEdit ? <TranscriptUpload projectId={project.id} /> : null}
        </div>
        <TranscriptViewer transcripts={transcripts} />
      </section>

      <section aria-labelledby="decisions" className="flex flex-col gap-4 desktop:w-2/3">
        <h2 id="decisions" className="type-display-3 scroll-mt-8">
          decision log
        </h2>
        <DecisionLog entries={decisions} />
        {canEdit && decisions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {decisions.map((d) => (
              <DecisionEditor key={d.id} projectId={project.id} entry={d} />
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="check-ins" className="flex flex-col gap-4 desktop:w-2/3">
        <h2 id="check-ins" className="type-display-3 scroll-mt-8">
          check-ins
        </h2>
        <CheckInHistory checkIns={checkIns} />
      </section>

      <p className="type-body-s">
        next, <TextLink href={`/projects/${project.id}`}>return to {project.title}</TextLink>.
      </p>
    </div>
  );
}
