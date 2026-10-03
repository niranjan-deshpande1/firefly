// Owner: evaluation builder. Archetype: workspace (judging).
import { notFound } from "next/navigation";
import { parseJson, prisma, type LinkItem } from "@/lib/db";
import { authorizePage, requireRole } from "@/lib/permissions";
import { loadProject, scoreItems, toDrafts } from "@/lib/review/queries";
import { Markdown, PageHeader, StatusPill, TextLink } from "@/components/ui";
import { ScoreForm } from "@/components/review/score-form";

export const metadata = { title: "judging" };

export default async function JudgeProjectPage({ params }: PageProps<"/judge/[projectId]">) {
  const { projectId } = await params;
  const user = await requireRole("REVIEWER");
  await authorizePage(user, "judge.score", { projectId });
  const project = await loadProject(projectId);
  if (!project || project.status !== "SUBMITTED") notFound();

  const review = await prisma.review.findUnique({
    where: { projectId_reviewerId_kind: { projectId, reviewerId: user.id, kind: "JUDGING" } },
    include: { scores: true },
  });
  const [items, drafts] = await Promise.all([scoreItems(project, "JUDGING"), toDrafts(review?.scores ?? [])]);
  const posted = review?.status === "SUBMITTED";
  const links: LinkItem[] = [
    ...(project.repoUrl ? [{ label: "repository", url: project.repoUrl }] : []),
    ...(project.videoUrl ? [{ label: "demo video", url: project.videoUrl }] : []),
    ...parseJson<LinkItem[]>(project.links, []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={`judging ${project.hackathon.title}`} title={project.title} description={<p>{project.tagline}</p>} />
      <div className="grid gap-8 desktop:grid-cols-12">
        <aside aria-label="project" className="flex flex-col gap-4 desktop:col-span-3">
          <h2 className="type-eyebrow text-secondary">your scores</h2>
          <span>
            <StatusPill tone={posted ? "success" : "neutral"}>{posted ? "posted" : review ? "draft" : "not started"}</StatusPill>
          </span>
          {links.map((l) => (
            <TextLink key={l.url} href={l.url} rel="noreferrer">
              {l.label}
            </TextLink>
          ))}
          <TextLink href="/judge">back to judging</TextLink>
        </aside>
        <section aria-label="criteria" className="flex flex-col gap-6 desktop:col-span-6">
          {items.length === 0 ? (
            <p className="type-body text-secondary measure">this hackathon has no judging criteria yet. the organizer adds them from their console.</p>
          ) : (
            <ScoreForm
              projectId={projectId}
              kind="JUDGING"
              items={items.map(({ key, name, group, description, anchors, isGate }) => ({ key, name, group, description, anchors, isGate }))}
              initial={drafts}
              evidence={[]}
              readOnly={posted}
            />
          )}
        </section>
        <section aria-label="story" className="flex flex-col gap-3 desktop:col-span-3">
          <h2 className="type-eyebrow text-secondary">story</h2>
          {project.story ? <Markdown>{project.story}</Markdown> : <p className="type-body-s text-secondary">no story written.</p>}
        </section>
      </div>
    </div>
  );
}
