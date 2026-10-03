import { EmptyState, TextLink } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getHackathonForView } from "@/lib/discovery/queries";

// Archetype: record. Judging tab: criteria names and descriptions only. Scores never appear here (DESIGN.md D4).
export default async function HackathonJudgingPage({ params }: PageProps<"/hackathons/[slug]/judging">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const cohort = h.type === "HIRING_COHORT";

  const criteria = cohort
    ? await prisma.rubricDimension.findMany({ where: { universal: true }, orderBy: [{ sortOrder: "asc" }, { key: "asc" }], select: { id: true, name: true, description: true } })
    : await prisma.judgingCriterion.findMany({ where: { hackathonId: h.id }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, description: true } });

  return (
    <section aria-labelledby="judging-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 id="judging-heading" className="type-display-3">{cohort ? "how projects are reviewed" : "judging criteria"}</h2>
        {cohort ? (
          <ol className="flex list-decimal flex-col gap-2 ps-6 type-body measure">
            <li>two reviewers read each project on their own, with the builder&apos;s name hidden behind a code.</li>
            <li>every score cites evidence: a commit, an AI transcript excerpt, a decision log entry or a check-in.</li>
            <li>where the two reviewers differ by 2 levels or more, they talk it through and write down why.</li>
            <li>a person decides who advances, with a written reason. builders who advance defend their project in an interview.</li>
            <li>every builder who finishes and is not hired gets written feedback.</li>
          </ol>
        ) : (
          <p className="type-body text-secondary measure">judges assigned by the organizer read every posted project against these criteria. people pick the winners.</p>
        )}
        {cohort ? (
          <p className="type-body-s text-secondary measure">
            each enrolled company also adds a few criteria for its own role. those stay with the company and its reviewers.
          </p>
        ) : null}
      </div>

      {criteria.length === 0 ? (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/rules`}>read the rules</TextLink>}>
          the organizer has not published judging criteria yet.
        </EmptyState>
      ) : (
        <ul className="flex flex-col" aria-label={cohort ? "rubric dimensions" : "judging criteria"}>
          {criteria.map((c) => (
            <li key={c.id} className="row flex flex-col gap-2 py-4">
              <h3 className="type-display-4">{c.name}</h3>
              <p className="type-body measure">{c.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
