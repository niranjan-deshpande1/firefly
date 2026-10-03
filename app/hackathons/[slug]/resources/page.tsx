import { EmptyState, TextLink } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getHackathonForView } from "@/lib/discovery/queries";
import { safeUrl } from "@/lib/discovery/labels";

// Archetype: record. Resources tab: organizer-provided links.
export default async function HackathonResourcesPage({ params }: PageProps<"/hackathons/[slug]/resources">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const resources = await prisma.resource.findMany({ where: { hackathonId: h.id }, orderBy: { title: "asc" } });

  return (
    <section aria-labelledby="resources-heading" className="flex flex-col gap-6">
      <h2 id="resources-heading" className="type-display-3">resources</h2>
      {resources.length === 0 ? (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/schedule`}>see the schedule</TextLink>}>
          no resources are posted yet. the organizer adds docs and starter links here before the build starts.
        </EmptyState>
      ) : (
        <ul className="flex flex-col">
          {resources.map((r) => {
            const href = safeUrl(r.url);
            return (
              <li key={r.id} className="row flex flex-col items-start gap-2 py-4">
                {href ? (
                  <a className="link type-body" href={href} rel="noopener noreferrer" target="_blank">
                    {r.title}
                  </a>
                ) : (
                  <span className="type-body">{r.title}</span>
                )}
                {r.description ? <p className="type-body-s text-secondary measure">{r.description}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
