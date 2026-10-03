// Owner: companies builder. Archetype: record (candidate report, demo step 6).
// Scores render as numbers with their anchor text and rationale, per reviewer and per dimension.
// They are never totalled, averaged or ranked (DESIGN.md D4). Every view is audited (brief 4.4).
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, EmptyState, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { EvidenceLink, EvidenceSummaryCard, evidenceAnchor } from "@/components/evidence";
import { InterviewRequestForm } from "@/components/company/interview-request-form";
import { getCurrentUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { viewCandidateReport, type ReportSnapshot } from "@/lib/reports";

type Line = ReportSnapshot["rubric"][number]["scores"][number];
type Calibration = ReportSnapshot["rubric"][number]["calibration"];

function ScoreLines({ lines, maxLevel, projectId }: { lines: Line[]; maxLevel: number | null; projectId: string }) {
  if (lines.length === 0) return <p className="type-body-s text-secondary">no submitted scores for this yet.</p>;
  return (
    <ul className="flex flex-col gap-4">
      {lines.map((l) => (
        <li key={l.reviewer} className="flex flex-col gap-2">
          <p className="type-body">
            <span className="text-secondary">{l.reviewer}: </span>
            <span className="font-bold">{maxLevel ? `${l.score} of ${maxLevel}` : `${l.score}`}</span>
            {l.anchor ? <span className="text-secondary">, {l.anchor}</span> : null}
          </p>
          <p className="type-body-s measure whitespace-pre-line">{l.rationale}</p>
          {l.evidence.length ? (
            <ul className="flex flex-wrap gap-2" aria-label="evidence for this score">
              {l.evidence.map((ref) => (
                <li key={`${ref.kind}-${ref.id}`}>
                  <EvidenceLink evidence={ref} projectId={projectId} />
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function CalibrationNote({ calibration }: { calibration: Calibration }) {
  if (!calibration) return null;
  return (
    <p className="type-body-s text-secondary measure border-s border-line ps-4">
      calibration note{calibration.resolvedScore !== null ? `, settled at ${calibration.resolvedScore}` : ""}: {calibration.note}
    </p>
  );
}

export default async function CandidateReportPage({ params }: PageProps<"/company/reports/[roleId]/[candidateId]">) {
  const { roleId, candidateId } = await params;
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  await authorizePage(user, "report.view", { roleId, candidateId });
  const report = await viewCandidateReport(user!, roleId, candidateId);
  if (!report) notFound();
  const r = report.snapshot;
  const p = r.project;
  const latestDecision = r.decisions.at(-1);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow={`candidate report, ${r.role.title}`}
        title={r.candidate.name}
        description={
          <p>
            {p.title}, built in {p.hackathon}. this view is recorded in the audit log.
          </p>
        }
        actions={
          <Button asChild variant="primary">
            <Link href={`/company/roles/${r.role.id}/hire`}>report a hire</Link>
          </Button>
        }
      />

      <section aria-labelledby="project" className="flex flex-col gap-4">
        <h2 id="project" className="type-display-3">project</h2>
        <div className="flex flex-col gap-2">
          <p className="type-display-4">{p.title}</p>
          <p className="type-body measure">{p.tagline}</p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={p.verified ? "success" : "neutral"}>{p.verified ? "verified" : "not verified yet"}</StatusPill>
            {p.verified && p.verifiedAt ? <span className="type-body-s text-secondary">passed a defense interview <Time value={new Date(p.verifiedAt)} /></span> : null}
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-6">
          <li><TextLink href={`/projects/${p.id}`} className="target inline-flex items-center">project page</TextLink></li>
          <li><TextLink href={`/projects/${p.id}/evidence`} className="target inline-flex items-center">evidence locker</TextLink></li>
          {p.repoUrl ? <li><a href={p.repoUrl} className="link target inline-flex items-center" rel="noreferrer noopener" target="_blank">repository</a></li> : null}
          {p.links.map((l) => (
            <li key={l.url}><a href={l.url} className="link target inline-flex items-center" rel="noreferrer noopener" target="_blank">{l.label}</a></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="decision" className="flex flex-col gap-4">
        <h2 id="decision" className="type-display-3">decision</h2>
        {latestDecision ? (
          <ul className="flex flex-col gap-4">
            {r.decisions.map((d) => (
              <li key={d.decidedAt} className="flex flex-col gap-2">
                <p className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={d.outcome === "ADVANCE" ? "success" : "neutral"}>{d.label}</StatusPill>
                  <Time value={new Date(d.decidedAt)} className="type-body-s text-secondary" />
                </p>
                <p className="type-body measure whitespace-pre-line">{d.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body-s text-secondary">no decision is recorded yet.</p>
        )}
      </section>

      <EvidenceSummaryCard summary={r.summary ? { ...r.summary, generatedAt: new Date(r.summary.generatedAt) } : null} />

      <section aria-labelledby="rubric" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="rubric" className="type-display-3">rubric scores</h2>
          <p className="type-body-s text-secondary measure">each reviewer scored blind, with a rationale and evidence for every score. read each dimension on its own.</p>
        </div>
        {r.rubric.length === 0 ? (
          <p className="type-body-s text-secondary">no submitted reviews yet.</p>
        ) : (
          r.rubric.map((d) => (
            <article key={d.key} aria-labelledby={`dim-${d.key}`} className="card flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 id={`dim-${d.key}`} className="type-display-4">{d.name}</h3>
                <p className="type-body-s text-secondary measure">{d.description}</p>
              </div>
              <ScoreLines lines={d.scores} maxLevel={d.maxLevel} projectId={p.id} />
              <CalibrationNote calibration={d.calibration} />
            </article>
          ))
        )}
      </section>

      <section aria-labelledby="criteria" className="flex flex-col gap-6">
        <h2 id="criteria" className="type-display-3">{r.role.title} criteria</h2>
        {r.criteria.length === 0 ? (
          <p className="type-body-s text-secondary">this role has no company-specific criteria.</p>
        ) : (
          r.criteria.map((c) => (
            <article key={c.id} aria-labelledby={`crit-${c.id}`} className="card flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 id={`crit-${c.id}`} className="type-display-4">{c.name}</h3>
                <p className="type-body-s text-secondary measure">{c.description}</p>
              </div>
              <ScoreLines lines={c.scores} maxLevel={null} projectId={p.id} />
              <CalibrationNote calibration={c.calibration} />
            </article>
          ))
        )}
      </section>

      <section aria-labelledby="interview" className="flex flex-col gap-6">
        <h2 id="interview" className="type-display-3">defense interview</h2>
        {r.interviews.length === 0 ? (
          <EmptyState action={<InterviewRequestForm candidateId={r.candidate.id} roles={[{ id: r.role.id, title: r.role.title }]} />}>
            no defense interview yet. ask the Firefly team to schedule one.
          </EmptyState>
        ) : (
          r.interviews.map((iv) => (
            <article key={iv.id} className="flex flex-col gap-4">
              <p className="flex flex-wrap items-center gap-2">
                <StatusPill tone={iv.outcome === "PASS" ? "success" : "neutral"}>{iv.statusLabel}</StatusPill>
                <Time value={new Date(iv.scheduledAt)} format="datetime" className="type-body-s text-secondary" />
              </p>
              {iv.sections.length === 0 ? (
                <p className="type-body-s text-secondary">no scorecard yet.</p>
              ) : (
                <ol className="flex flex-col">
                  {iv.sections.map((s) => (
                    <li key={s.section} className="row flex flex-col gap-2 py-4">
                      <h3 className="type-display-4">{s.label}</h3>
                      {s.scores.map((sc) => (
                        <div key={sc.id} id={evidenceAnchor({ kind: "INTERVIEW_NOTE", id: sc.id })} className="flex flex-col gap-1">
                          <p className="type-body"><span className="text-secondary">{sc.panelist}: </span><span className="font-bold">{sc.score}</span></p>
                          <p className="type-body-s measure whitespace-pre-line">{sc.notes}</p>
                        </div>
                      ))}
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))
        )}
      </section>

      <TextLink href={`/company/roles/${r.role.id}/shortlist`} className="target inline-flex items-center">back to the {r.role.title} shortlist</TextLink>
    </div>
  );
}
