// Archetype: collection. Owner: projects builder.
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { cn, EmptyState, PageHeader, TextLink, Time } from "@/components/ui";
import { ProjectCard } from "@/components/projects/project-card";
import { getCurrentUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { getGallery, getHackathonBySlug } from "@/lib/projects/queries";
import { allTags, filterByBuiltWith, galleryIsOpen, isBeforeDeadline, paramList, showBuilderNames } from "@/lib/projects/schema";

const PARAM = "built-with";

function filterHref(base: string, tags: string[]) {
  const q = new URLSearchParams(tags.map((t) => [PARAM, t]));
  return q.size ? `${base}?${q}` : base;
}

export default async function HackathonProjectsPage({ params, searchParams }: PageProps<"/hackathons/[slug]/projects">) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();
  const user = await getCurrentUser();
  await authorizePage(user, "hackathon.view", { hackathonId: hackathon.id });

  const base = `/hackathons/${slug}/projects`;
  const isOrganizer = !!user && (user.role === "ADMIN" || user.id === hackathon.organizerId);

  if (!isOrganizer && !galleryIsOpen({ hackathonType: hackathon.type, submissionDeadline: hackathon.submissionDeadline })) {
    return (
      <section aria-labelledby="page-title" className="flex flex-col gap-8">
        <PageHeader level={2} title="projects" />
        <EmptyState action={<TextLink href={`/hackathons/${slug}/schedule`}>see the schedule</TextLink>}>
          projects in this cohort appear after the posting deadline on <Time value={hackathon.submissionDeadline} format="datetime" />.
        </EmptyState>
      </section>
    );
  }

  const selected = paramList((await searchParams)[PARAM]);
  const all = await getGallery(hackathon.id);
  const tags = allTags(all);
  const shown = filterByBuiltWith(all, selected);
  const names = showBuilderNames({ hackathonType: hackathon.type, hackathonStatus: hackathon.status, viewerIsInsider: isOrganizer });

  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-8">
      <PageHeader level={2}
        title="projects"
        description={<p>everything posted to {hackathon.title}, in alphabetical order.</p>}
      />

      {tags.length > 0 ? (
        <nav aria-label="filter by built-with" className="flex flex-col gap-3">
          <p className="type-label text-secondary">filter by built-with</p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const on = selected.some((s) => s.toLowerCase() === tag.toLowerCase());
              const next = on ? selected.filter((s) => s.toLowerCase() !== tag.toLowerCase()) : [...selected, tag];
              return (
                <li key={tag}>
                  <NextLink
                    href={filterHref(base, next)}
                    aria-label={on ? `remove filter ${tag}` : `filter by ${tag}`}
                    className={cn("chip", on && "border-focus")}
                    scroll={false}
                  >
                    {tag}
                    {on ? <span aria-hidden="true">×</span> : null}
                  </NextLink>
                </li>
              );
            })}
          </ul>
          {selected.length > 0 ? (
            <p className="type-body-s text-secondary" aria-live="polite">
              showing projects built with {selected.join(" and ")}. <TextLink href={base} scroll={false}>clear filters</TextLink>
            </p>
          ) : null}
        </nav>
      ) : null}

      {all.length === 0 ? (
        isBeforeDeadline(hackathon.submissionDeadline) ? (
          <EmptyState action={<TextLink href={`/hackathons/${slug}/submit`}>post your project</TextLink>}>
            no projects are posted yet. registered builders can post theirs until <Time value={hackathon.submissionDeadline} format="datetime" />.
          </EmptyState>
        ) : (
          <EmptyState action={<TextLink href="/hackathons">browse other hackathons</TextLink>}>
            no projects were posted to this hackathon.
          </EmptyState>
        )
      ) : shown.length === 0 ? (
        <EmptyState action={<TextLink href={filterHref(base, selected.slice(0, -1))}>remove the last filter</TextLink>}>
          no projects match these filters. remove one filter to see nearby work.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-x-4 gap-y-16 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-x-6">
          {shown.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} showNames={names} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
