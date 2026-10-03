import { EmptyState, StatusPill, TextLink } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/billing/math";
import { getHackathonForView } from "@/lib/discovery/queries";

// Archetype: record. Prizes tab. Awarded projects are plain text labels (DESIGN.md D3):
// organizer order, no trophy, podium or ranking.
export default async function HackathonPrizesPage({ params }: PageProps<"/hackathons/[slug]/prizes">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const prizes = await prisma.prize.findMany({
    where: { hackathonId: h.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      winners: {
        where: { announcedAt: { lte: new Date() }, project: { status: "SUBMITTED" } },
        orderBy: { project: { title: "asc" } },
        select: { id: true, project: { select: { id: true, title: true } } },
      },
    },
  });

  return (
    <section aria-labelledby="prizes-heading" className="flex flex-col gap-6">
      <h2 id="prizes-heading" className="type-display-3">prizes</h2>
      {prizes.length === 0 ? (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/judging`}>see how projects are judged</TextLink>}>
          {h.type === "HIRING_COHORT"
            ? "this hiring cohort has no prizes. builders who advance meet the enrolled companies in a defense interview."
            : "the organizer has not listed prizes yet."}
        </EmptyState>
      ) : (
        <ul className="flex flex-col">
          {prizes.map((p) => (
            <li key={p.id} className="row flex flex-col gap-2 py-6">
              <h3 className="type-display-4">{p.name}</h3>
              <p className="type-body-s text-secondary">
                {[p.valueCents != null ? formatCents(p.valueCents) : null, p.quantity > 1 ? `${p.quantity} awards` : null]
                  .filter(Boolean)
                  .join(", ") || "no cash value"}
              </p>
              {p.description ? <p className="type-body measure">{p.description}</p> : null}
              {p.winners.length > 0 ? (
                <ul className="flex flex-col gap-2 pt-2" aria-label={`awarded ${p.name}`}>
                  {p.winners.map((w) => (
                    <li key={w.id} className="flex flex-wrap items-center gap-3">
                      <TextLink href={`/projects/${w.project.id}`} className="type-body">
                        {w.project.title}
                      </TextLink>
                      <StatusPill>awarded: {p.name}</StatusPill>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
