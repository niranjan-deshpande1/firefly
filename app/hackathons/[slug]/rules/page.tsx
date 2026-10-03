import { EmptyState, Markdown, TextLink } from "@/components/ui";
import { getHackathonForView } from "@/lib/discovery/queries";

// Archetype: record. Rules tab.
export default async function HackathonRulesPage({ params }: PageProps<"/hackathons/[slug]/rules">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);

  return (
    <section aria-labelledby="rules-heading" className="flex flex-col gap-4">
      <h2 id="rules-heading" className="type-display-3">rules</h2>
      {h.rules.trim() ? (
        <Markdown className="measure">{h.rules}</Markdown>
      ) : (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/updates`}>read the latest updates</TextLink>}>
          the organizer has not posted the rules yet. they will appear here and in an update.
        </EmptyState>
      )}
    </section>
  );
}
