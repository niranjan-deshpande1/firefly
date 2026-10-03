// Owner: evaluation builder. Archetype: workspace (calibration and decision).
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { authorizePage, check, requireRole } from "@/lib/permissions";
import { blindLabel, calibrationState, loadProject, scoreItems } from "@/lib/review/queries";
import { decisionBlocker, feedbackBlocker, OUTCOME_LABEL } from "@/lib/review/rules";
import { evidenceAnchor } from "@/components/evidence/types";
import { EmptyState, Markdown, PageHeader, StatusPill, Table, Td, Th, TextLink, Time, Tr } from "@/components/ui";
import { CalibrationNoteForm, DecisionForm, FeedbackForm } from "@/components/review/forms";

export const metadata = { title: "calibration" };

export default async function CalibrationPage({ params }: PageProps<"/review/calibration/[projectId]">) {
  const { projectId } = await params;
  const user = await requireRole("REVIEWER");
  await authorizePage(user, "review.calibrate", { projectId });
  const project = await loadProject(projectId);
  if (!project) notFound();
  const label = blindLabel(project);

  // Other reviewers' scores stay hidden until this reviewer has posted, so they can't anchor on them.
  if (user.role !== "ADMIN" && !(await check(user, "identity.reveal", { projectId }))) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader eyebrow="calibration" title={`calibrate ${label}`} />
        <EmptyState action={<TextLink href={`/review/${projectId}`}>open the scoring workspace</TextLink>}>
          post your own review first. calibration opens after that.
        </EmptyState>
      </div>
    );
  }

  const items = await scoreItems(project, "RUBRIC");
  const [{ reviews, notes, flags }, decisions, feedback] = await Promise.all([
    calibrationState(projectId, items.map((i) => i.key)),
    prisma.decision.findMany({ where: { projectId }, orderBy: { decidedAt: "desc" }, include: { decidedBy: { select: { name: true } } } }),
    prisma.feedback.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } }),
  ]);
  const blocker = decisionBlocker(reviews.length, flags, notes.map((n) => n.dimensionKey));
  const latest = decisions[0]?.outcome ?? null;
  const hired = !!(await prisma.shortlistEntry.findFirst({ where: { projectId, status: "HIRED" }, select: { id: true } }));
  const canWriteFeedback = !feedbackBlocker(latest, hired);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="calibration"
        title={`calibrate ${label}`}
        description={<p>{project.title}. {project.hackathon.title}. scores differ by 2 or more levels where flagged; each flag needs a reconciliation note before a decision.</p>}
      />

      <div className="grid gap-8 desktop:grid-cols-12">
        <aside aria-label="reviewers" className="flex flex-col gap-3 desktop:col-span-3">
          <h2 className="type-eyebrow text-secondary">reviewers</h2>
          {reviews.length === 0 ? (
            <p className="type-body-s text-secondary">no posted reviews yet.</p>
          ) : (
            <ul className="flex flex-col">
              {reviews.map((r) => (
                <li key={r.id} className="row flex min-h-11 flex-col justify-center gap-1 py-2 type-body-s">
                  <span>{r.reviewer.id === user.id ? "you" : r.reviewer.name}</span>
                  {r.submittedAt ? <Time className="text-secondary" value={r.submittedAt} format="datetime" /> : null}
                </li>
              ))}
            </ul>
          )}
          <TextLink href={`/review/${projectId}`}>back to the scoring workspace</TextLink>
        </aside>

        <div className="flex flex-col gap-12 desktop:col-span-6">
          <section aria-labelledby="flags" className="flex flex-col gap-6">
            <h2 id="flags" className="type-display-3">flagged gaps</h2>
            {reviews.length < 2 ? (
              <p className="type-body text-secondary measure">calibration compares two posted reviews. the second reviewer hasn&apos;t posted yet.</p>
            ) : flags.length === 0 ? (
              <p className="type-body text-secondary measure">no gaps of 2 or more. the reviewers agree within one level on every item.</p>
            ) : (
              flags.map((key) => {
                const item = items.find((i) => i.key === key)!;
                const note = notes.find((n) => n.dimensionKey === key);
                return (
                  <article key={key} className="flex flex-col gap-4 border-t border-line pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="type-display-4">{item.name}</h3>
                      <StatusPill tone={note ? "success" : "warning"}>{note ? "reconciled" : "needs a note"}</StatusPill>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {reviews.map((r) => {
                        const s = r.scores[key];
                        return (
                          <li key={r.id} className="flex flex-col gap-2">
                            <p className="type-label">
                              {r.reviewer.id === user.id ? "you" : r.reviewer.name}: level {s?.score ?? "none"}
                            </p>
                            {s ? <p className="type-body-s measure">{s.rationale}</p> : null}
                            {s && s.evidenceRefs.length > 0 ? (
                              <ul className="flex flex-wrap gap-2" aria-label="linked evidence">
                                {s.evidenceRefs.map((ref) => (
                                  <li key={`${ref.kind}-${ref.id}`}>
                                    <a className="chip" href={`/review/${projectId}#${evidenceAnchor(ref)}`}>{ref.label}</a>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                    <CalibrationNoteForm projectId={projectId} itemKey={key} itemName={item.name} note={note?.note} resolvedScore={note?.resolvedScore} />
                    {note ? <p className="type-body-s text-secondary">last saved by {note.author.name}</p> : null}
                  </article>
                );
              })
            )}
          </section>

          {reviews.length >= 2 ? (
            <section aria-labelledby="levels" className="flex flex-col gap-4">
              <h2 id="levels" className="type-display-3">every level</h2>
              <div className="overflow-x-auto">
                <Table caption={`levels per reviewer for ${label}. never totalled or averaged.`}>
                  <thead>
                    <Tr>
                      <Th scope="col">item</Th>
                      {reviews.map((r) => (
                        <Th key={r.id} scope="col">{r.reviewer.id === user.id ? "you" : r.reviewer.name}</Th>
                      ))}
                    </Tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <Tr key={i.key}>
                        <Th scope="row">{i.name}{flags.includes(i.key) ? " (flagged)" : ""}</Th>
                        {reviews.map((r) => (
                          <Td key={r.id}>{r.scores[i.key]?.score ?? "none"}</Td>
                        ))}
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </section>
          ) : null}
        </div>

        <aside aria-label="decision" className="flex flex-col gap-8 desktop:col-span-3">
          <section aria-labelledby="decide" className="flex flex-col gap-4">
            <h2 id="decide" className="type-display-3">decision</h2>
            <DecisionForm projectId={projectId} blocker={blocker} />
            {decisions.length > 0 ? (
              <ol className="flex flex-col" aria-label="decision history">
                {decisions.map((d) => (
                  <li key={d.id} className="row flex flex-col gap-1 py-3">
                    <span className="type-label">{OUTCOME_LABEL[d.outcome] ?? d.outcome}</span>
                    <span className="type-body-s">{d.reason}</span>
                    <span className="type-body-s text-secondary">
                      {d.decidedBy.name}, <Time value={d.decidedAt} format="datetime" />
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>

          {canWriteFeedback ? (
            <section aria-labelledby="feedback" className="flex flex-col gap-4">
              <h2 id="feedback" className="type-display-3">feedback</h2>
              <p className="type-body-s text-secondary">every finisher who isn&apos;t advanced gets written feedback. it shows on their dashboard from results time.</p>
              <FeedbackForm projectId={projectId} body={feedback?.body} />
              {feedback ? (
                <div className="flex flex-col gap-2">
                  <p className="type-eyebrow text-secondary">what the candidate sees</p>
                  <Markdown>{feedback.body}</Markdown>
                </div>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
