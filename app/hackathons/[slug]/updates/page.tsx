import { EmptyState, Markdown, TextLink, Time } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getHackathonForView } from "@/lib/discovery/queries";

// Archetype: stream. Updates tab: organizer posts, newest first.
export default async function HackathonUpdatesPage({ params }: PageProps<"/hackathons/[slug]/updates">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const updates = await prisma.update.findMany({
    where: { hackathonId: h.id, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <section aria-labelledby="updates-heading" className="flex flex-col gap-8 measure-stream">
      <h2 id="updates-heading" className="type-display-3">updates</h2>
      {updates.length === 0 ? (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/schedule`}>see the schedule</TextLink>}>
          the organizer has not posted an update yet. registered builders also get each update by email.
        </EmptyState>
      ) : (
        <ol className="flex flex-col">
          {updates.map((u) => (
            <li key={u.id} className="row flex flex-col gap-3 py-6">
              <article aria-labelledby={`update-${u.id}`} className="flex flex-col gap-3">
                <h3 id={`update-${u.id}`} className="type-display-4">{u.title}</h3>
                <p className="type-body-s text-secondary">
                  <Time value={u.publishedAt} format="datetime" timeZone={h.timeZone} />
                </p>
                <Markdown className="measure">{u.body}</Markdown>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
