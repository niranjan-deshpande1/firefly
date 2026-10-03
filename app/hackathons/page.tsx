import type { Metadata } from "next";
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { FilterBar } from "@/components/discovery/filter-bar";
import { HackathonCard } from "@/components/discovery/hackathon-card";
import { activeKeys, parseFilters } from "@/lib/discovery/filters";
import { adjacentHackathons, listHackathons, listThemes } from "@/lib/discovery/queries";

export const metadata: Metadata = { title: "hackathons" };

// Archetype: collection. Public listing; drafts never appear (toWhere excludes them).
export default async function HackathonsPage({ searchParams }: PageProps<"/hackathons">) {
  const filters = parseFilters(await searchParams);
  const [hackathons, themes] = await Promise.all([listHackathons(filters), listThemes()]);
  const filtered = activeKeys(filters).length > 0;
  const adjacent = hackathons.length === 0 && filtered ? await adjacentHackathons(filters) : [];

  return (
    <>
      <PageHeader
        title="hackathons"
        description={<p>open hackathons anyone can join, and 2 week hiring cohorts where companies hire from the builders.</p>}
      />
      <FilterBar filters={filters} themes={themes} />

      {hackathons.length > 0 ? (
        <section aria-label="results" className="flex flex-col gap-4">
          <p className="type-body-s text-secondary" aria-live="polite">
            {hackathons.length === 1 ? "1 hackathon" : `${hackathons.length} hackathons`}
          </p>
          <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-6">
            {hackathons.map((h) => (
              <li key={h.id}>
                <HackathonCard hackathon={h} />
              </li>
            ))}
          </ul>
        </section>
      ) : filtered ? (
        <section aria-labelledby="empty-heading" className="flex flex-col gap-6">
          <h2 id="empty-heading" className="sr-only">no results</h2>
          <EmptyState action={<TextLink href="/hackathons">clear all filters</TextLink>}>
            no hackathons match these filters. remove one filter to see nearby events.
          </EmptyState>
          {adjacent.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h3 className="type-display-4">close to what you asked for</h3>
              <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-6">
                {adjacent.map((h) => (
                  <li key={h.id}>
                    <HackathonCard hackathon={h} headingLevel={3} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <EmptyState action={<TextLink href="/for-companies">see how companies hire through firefly</TextLink>}>
          no hackathons are listed yet. the first ones open soon.
        </EmptyState>
      )}
    </>
  );
}
