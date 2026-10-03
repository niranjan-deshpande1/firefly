// Owner: evaluation builder. Archetype: workspace (scoring workspace).
import { notFound } from "next/navigation";
import { auditAccess } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { authorizePage, requireRole } from "@/lib/permissions";
import { blindLabel, calibrationState, loadEvidence, loadProject, scoreItems, toDrafts } from "@/lib/review/queries";
import { Avatar, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { EvidencePanel } from "@/components/review/evidence-panel";
import { RevealButton } from "@/components/review/forms";
import { ScoreForm } from "@/components/review/score-form";

export const metadata = { title: "scoring workspace" };

export default async function ScoringWorkspacePage({ params }: PageProps<"/review/[projectId]">) {
  const { projectId } = await params;
  const user = await requireRole("REVIEWER");
  await authorizePage(user, "review.score", { projectId });
  const project = await loadProject(projectId);
  if (!project) notFound();

  const review = await prisma.review.findUnique({
    where: { projectId_reviewerId_kind: { projectId, reviewerId: user.id, kind: "RUBRIC" } },
    include: { scores: true },
  });
  const posted = review?.status === "SUBMITTED";
  const revealed = posted && !!review?.revealedAt;

  await auditAccess(user, "EVIDENCE_VIEW", project.ownerId, { type: "Project", id: project.id, metadata: { surface: "scoring workspace" } });

  const [items, evidence, drafts, assignments] = await Promise.all([
    scoreItems(project, "RUBRIC"),
    loadEvidence(project),
    toDrafts(review?.scores ?? []),
    prisma.reviewerAssignment.findMany({ where: { projectId }, include: { reviewer: { select: { id: true, name: true } } } }),
  ]);
  const calibration = posted ? await calibrationState(projectId, items.map((i) => i.key)) : null;
  const openFlags = calibration ? calibration.flags.filter((k) => !calibration.notes.some((n) => n.dimensionKey === k)).length : 0;
  const profile = project.owner.candidateProfile;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="scoring workspace"
        title={revealed ? (project.owner.name ?? blindLabel(project)) : blindLabel(project)}
        description={
          <p>
            {project.title}: {project.tagline}. {project.hackathon.title}.
          </p>
        }
      />

      <div className="grid gap-8 desktop:grid-cols-12">
        <aside aria-label="who is reviewing" className="flex flex-col gap-6 desktop:col-span-3">
          <section className="flex flex-col gap-3">
            <h2 className="type-eyebrow text-secondary">candidate</h2>
            {revealed ? (
              <div className="flex items-center gap-3">
                <Avatar name={project.owner.name ?? "candidate"} src={project.owner.image ?? undefined} size={44} />
                <div className="flex flex-col gap-1">
                  <p className="type-display-4">{project.owner.name}</p>
                  {project.owner.username ? <TextLink href={`/u/${project.owner.username}`}>profile</TextLink> : null}
                </div>
              </div>
            ) : (
              <p className="type-display-4">{blindLabel(project)}</p>
            )}
            {revealed && profile ? (
              <p className="type-body-s text-secondary">{[profile.headline, profile.school, profile.location].filter(Boolean).join(". ")}</p>
            ) : null}
            {!revealed ? <p className="type-body-s text-secondary">name, photo, school and commit authors stay hidden until you post your review.</p> : null}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-eyebrow text-secondary">reviewers</h2>
            <ul className="flex flex-col">
              {assignments.map((a) => (
                <li key={a.id} className="row flex min-h-11 items-center justify-between gap-3 type-body-s">
                  <span>{a.reviewer.id === user.id ? "you" : a.reviewer.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-eyebrow text-secondary">your review</h2>
            {posted ? (
              <p className="type-body-s">
                <StatusPill tone="success">posted</StatusPill>{" "}
                {review?.submittedAt ? <Time value={review.submittedAt} format="datetime" /> : null}
              </p>
            ) : (
              <StatusPill>{review ? "draft" : "not started"}</StatusPill>
            )}
            {posted && !revealed ? <RevealButton projectId={projectId} /> : null}
            {revealed && review?.revealedAt ? (
              <p className="type-body-s text-secondary">
                identity revealed <Time value={review.revealedAt} format="datetime" />
              </p>
            ) : null}
            {posted ? (
              <TextLink href={`/review/calibration/${projectId}`}>
                {openFlags > 0 ? `calibration: ${openFlags} gap${openFlags === 1 ? "" : "s"} to reconcile` : "calibration and decision"}
              </TextLink>
            ) : null}
          </section>
        </aside>

        <section aria-label="rubric" className="flex flex-col gap-6 desktop:col-span-6">
          {items.length === 0 ? (
            <p className="type-body text-secondary measure">the rubric hasn&apos;t been loaded yet. ask an operator to run the seed, then reload.</p>
          ) : (
            <ScoreForm
              projectId={projectId}
              kind="RUBRIC"
              items={items.map(({ key, name, group, description, anchors, isGate }) => ({ key, name, group, description, anchors, isGate }))}
              initial={drafts}
              evidence={evidence.options}
              readOnly={posted}
            />
          )}
        </section>

        <section aria-label="evidence" className="flex flex-col gap-4 desktop:col-span-3 desktop:sticky desktop:top-6 desktop:max-h-dvh desktop:self-start desktop:overflow-y-auto">
          <EvidencePanel evidence={evidence} blind={!revealed} />
        </section>
      </div>
    </div>
  );
}
