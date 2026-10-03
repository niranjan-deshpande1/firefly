import { Chip, Markdown, TextLink } from "@/components/ui";
import { getHackathonForView } from "@/lib/discovery/queries";

// Archetype: record. Overview tab: description, themes, the cohort prompt, eligibility.
export default async function HackathonOverviewPage({ params }: PageProps<"/hackathons/[slug]">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const cohort = h.cohortConfig;

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="about-heading" className="flex flex-col gap-4">
        <h2 id="about-heading" className="type-display-3">about</h2>
        {h.description.trim() ? (
          <Markdown className="measure">{h.description}</Markdown>
        ) : (
          <p className="type-body text-secondary measure">
            the organizer has not written a description yet. <TextLink href={`/hackathons/${h.slug}/rules`}>read the rules</TextLink>
          </p>
        )}
      </section>

      {h.themes.length > 0 ? (
        <section aria-labelledby="themes-heading" className="flex flex-col gap-4">
          <h2 id="themes-heading" className="type-display-3">themes</h2>
          <ul className="flex flex-wrap gap-3">
            {h.themes.map((t) => (
              <li key={t}>
                <Chip>{t}</Chip>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {cohort ? (
        <section aria-labelledby="prompt-heading" className="flex flex-col gap-4">
          <h2 id="prompt-heading" className="type-display-3">the prompt</h2>
          <p className="type-body-s text-secondary measure">
            a 2 week build, about {cohort.suggestedHours} hours in total, with a written check-in each week. companies
            enrolled in this cohort hire from it after blind, evidence-linked review and a defense interview.
          </p>
          <Markdown className="measure">{cohort.prompt}</Markdown>
        </section>
      ) : null}

      <section aria-labelledby="eligibility-heading" className="flex flex-col gap-4">
        <h2 id="eligibility-heading" className="type-display-3">who can take part</h2>
        {h.eligibility.trim() ? (
          <Markdown className="measure">{h.eligibility}</Markdown>
        ) : (
          <p className="type-body measure">anyone can take part.</p>
        )}
        <p className="type-body-s text-secondary">
          {h.teamPolicy === "TEAMS_ALLOWED" ? `teams of up to ${h.maxTeamSize} are welcome.` : "everyone builds solo."}{" "}
          <TextLink href={`/hackathons/${h.slug}/schedule`}>see the full schedule</TextLink>
        </p>
      </section>
    </div>
  );
}
