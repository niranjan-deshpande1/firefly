// Archetype: record. Owner: projects builder.
// Cartoon-free surface (manual 5.3, 8.3): builder media first, no counts, no popularity signal.
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Button, Divider, Markdown, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";
import { LikeButton } from "@/components/projects/like-button";
import { CommentForm, HideCommentButton } from "@/components/projects/comment-controls";
import { getCurrentUser } from "@/lib/auth";
import { can, loadFacts } from "@/lib/permissions";
import { getProject, type ProjectView } from "@/lib/projects/queries";
import { showBuilderNames } from "@/lib/projects/schema";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  // One fact load serves every check on this page (same result as calling check() per action).
  const facts = await loadFacts(user, { projectId: id });
  if (!can(user, "project.view", facts)) notFound();
  const project = await getProject(id, user?.id ?? null);
  if (!project) notFound();

  const may = {
    edit: can(user, "project.edit", facts),
    evidence: can(user, "evidence.view", facts),
    like: can(user, "project.like", facts),
    comment: can(user, "comment.create", facts),
    moderate: can(user, "comment.moderate", facts),
  };
  const insider = !!facts.isProjectMember || !!facts.isHackathonOrganizer || user?.role === "ADMIN";
  const names = showBuilderNames({ hackathonType: project.hackathon.type, hackathonStatus: project.hackathon.status, viewerIsInsider: insider });
  const [cover, ...rest] = project.images;

  return (
    <article aria-labelledby="page-title" className="flex flex-col gap-8">
      <PageHeader
        title={project.title}
        description={project.tagline ? <p>{project.tagline}</p> : undefined}
        actions={
          may.edit ? (
            <Button asChild variant="secondary">
              <NextLink href={`/projects/${project.id}/edit`}>edit project</NextLink>
            </Button>
          ) : undefined
        }
      />

      <StatusRow project={project} />

      <div className="grid grid-cols-1 gap-12 desktop:grid-cols-12 desktop:gap-6">
        {cover || project.videoUrl ? (
          <section aria-label="media" className="flex flex-col gap-4 desktop:col-span-8">
            {cover ? (
              // Builder media at its own aspect ratio, never cropped (manual 8.3).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt={cover.alt} className="h-auto w-full" fetchPriority="high" />
            ) : null}
            {rest.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                {rest.map((img) => (
                  <li key={img.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} loading="lazy" className="h-auto w-full" />
                  </li>
                ))}
              </ul>
            ) : null}
            {project.videoUrl ? (
              <p className="type-body">
                <a className="link" href={project.videoUrl} target="_blank" rel="noopener noreferrer nofollow">
                  watch the demo video
                </a>
              </p>
            ) : null}
          </section>
        ) : null}

        <aside aria-label="about this project" className="flex flex-col gap-8 desktop:col-span-4 desktop:row-span-2">
          {may.like ? (
            <div className="self-start">
              <LikeButton projectId={project.id} initialLiked={project.likedByViewer} />
            </div>
          ) : null}
          <ProjectLinks project={project} showRepo={names} />
          <Members project={project} showNames={names} />
          <div className="flex flex-col gap-2">
            <h2 className="type-label text-secondary">hackathon</h2>
            <TextLink href={`/hackathons/${project.hackathon.slug}`} className="type-body">
              {project.hackathon.title}
            </TextLink>
          </div>
          {may.evidence ? (
            <div className="flex flex-col gap-2">
              <h2 className="type-label text-secondary">evidence</h2>
              <TextLink href={`/projects/${project.id}/evidence`} className="type-body">
                open the evidence locker
              </TextLink>
            </div>
          ) : null}
        </aside>

        <section aria-labelledby="story-heading" className="flex flex-col gap-6 desktop:col-span-8">
          <h2 id="story-heading" className="type-display-3">
            story
          </h2>
          {project.story.trim() ? (
            <Markdown>{project.story}</Markdown>
          ) : (
            <p className="type-body text-secondary">the story is not written yet.</p>
          )}
          {project.builtWith.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="type-label text-secondary">built with</h3>
              <ul className="flex flex-wrap gap-2">
                {project.builtWith.map((tag) => (
                  <li key={tag}>
                    <NextLink
                      className="chip"
                      href={`/hackathons/${project.hackathon.slug}/projects?built-with=${encodeURIComponent(tag)}`}
                      aria-label={`other projects built with ${tag}`}
                    >
                      {tag}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <Divider />

      <Comments project={project} may={may} signedIn={!!user} showNames={names} />
    </article>
  );
}

function StatusRow({ project }: { project: ProjectView }) {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="status">
      {project.status === "DRAFT" ? (
        <li>
          <StatusPill tone="warning">draft, visible to the team and organizers only</StatusPill>
        </li>
      ) : project.submittedAt ? (
        <li className="type-body-s text-secondary">
          posted <Time value={project.submittedAt} />
        </li>
      ) : null}
      {project.verified ? (
        <li>
          <StatusPill tone="success">verified</StatusPill>
        </li>
      ) : null}
      {project.awards.map((name) => (
        <li key={name}>
          <StatusPill>awarded: {name}</StatusPill>
        </li>
      ))}
    </ul>
  );
}

function ProjectLinks({ project, showRepo }: { project: ProjectView; showRepo: boolean }) {
  // The repo URL names the GitHub account, so it follows the same rule as builder names.
  const links = [...(project.repoUrl && showRepo ? [{ label: "source code", url: project.repoUrl }] : []), ...project.links];
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-label text-secondary">links</h2>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={`${l.label}-${l.url}`} className="type-body">
            <a className="link break-all" href={l.url} target="_blank" rel="noopener noreferrer nofollow">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Members({ project, showNames }: { project: ProjectView; showNames: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="type-label text-secondary">{project.team ? `team: ${project.team.name}` : "built by"}</h2>
      {showNames ? (
        <ul className="flex flex-col gap-3">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.name} src={m.image} size={44} />
              {m.username ? (
                <TextLink href={`/u/${m.username}`} className="type-display-4">
                  {m.name}
                </TextLink>
              ) : (
                <span className="type-display-4">{m.name}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body-s text-secondary measure">builder names in a hiring cohort appear once results are out.</p>
      )}
    </div>
  );
}

function Comments({
  project,
  may,
  signedIn,
  showNames,
}: {
  project: ProjectView;
  may: { comment: boolean; moderate: boolean };
  signedIn: boolean;
  showNames: boolean;
}) {
  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6 measure-stream">
      <h2 id="comments-heading" className="type-display-3">
        comments
      </h2>
      {project.comments.length === 0 ? (
        <p className="type-body text-secondary">no comments yet.{may.comment ? " ask the builders something about how they made it." : ""}</p>
      ) : (
        <ol className="flex flex-col">
          {project.comments.map((c) => (
            <li key={c.id} className="row flex flex-col gap-2 py-4">
              {c.hidden && !may.moderate ? (
                <p className="type-body-s text-muted">comment hidden by an organizer</p>
              ) : (
                <>
                  <p className="type-body-s text-secondary">
                    <span className="text-primary">{showNames ? c.author.name : "a participant"}</span>
                    {", "}
                    <Time value={c.createdAt} format="datetime" />
                    {c.hidden ? " (hidden from others)" : ""}
                  </p>
                  <p className="type-body whitespace-pre-wrap break-words">{c.body}</p>
                  {may.moderate ? (
                    <div>
                      <HideCommentButton commentId={c.id} hidden={c.hidden} />
                    </div>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
      {may.comment ? (
        <CommentForm projectId={project.id} />
      ) : !signedIn ? (
        <p className="type-body">
          <TextLink href="/signin">sign in to comment</TextLink>
        </p>
      ) : null}
      {!may.comment && signedIn && project.status === "DRAFT" ? (
        <p className="type-body-s text-secondary">comments open once the project is posted.</p>
      ) : null}
    </section>
  );
}
