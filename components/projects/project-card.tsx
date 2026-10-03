import NextLink from "next/link";
import { StatusPill } from "@/components/ui";
import type { GalleryItem } from "@/lib/projects/queries";

/**
 * Project card (manual 7.14): interactive-flat, equal size, media first, attribution at body-s.
 * Builder text is shown exactly as written. No counts, no rotation, no featured treatment.
 */
export function ProjectCard({ project, showNames }: { project: GalleryItem; showNames: boolean }) {
  const byline = showNames ? (project.teamName ?? project.members.map((m) => m.name).join(", ")) : null;
  return (
    <article className="group flex h-full flex-col gap-3">
      <NextLink
        href={`/projects/${project.id}`}
        className="flex flex-col gap-3 rounded-card outline-offset-2 transition-state"
        aria-describedby={`card-${project.id}-meta`}
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-raised">
          {project.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.cover.url} alt={project.cover.alt} loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-end p-4">
              <p className="type-body-s text-secondary measure line-clamp-4">{project.tagline}</p>
            </div>
          )}
        </div>
        <h2 className="type-display-4 text-primary group-hover:underline">{project.title}</h2>
      </NextLink>
      <div id={`card-${project.id}-meta`} className="flex flex-col gap-2">
        {project.cover ? <p className="type-body-s text-secondary line-clamp-2">{project.tagline}</p> : null}
        {byline ? <p className="type-body-s text-secondary">by {byline}</p> : null}
        {project.awards.length > 0 || project.verified ? (
          <ul className="flex flex-wrap gap-2" aria-label="labels">
            {project.verified ? (
              <li>
                <StatusPill tone="success">verified</StatusPill>
              </li>
            ) : null}
            {project.awards.map((name) => (
              <li key={name}>
                <StatusPill tone="accent">awarded: {name}</StatusPill>
              </li>
            ))}
          </ul>
        ) : null}
        {project.builtWith.length > 0 ? (
          <p className="type-label text-muted">{project.builtWith.slice(0, 5).join(" · ")}</p>
        ) : null}
      </div>
    </article>
  );
}
