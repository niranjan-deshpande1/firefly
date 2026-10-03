import { Avatar, EmptyState, TextLink } from "@/components/ui";
import { prisma, parseJson } from "@/lib/db";
import { getHackathonForView } from "@/lib/discovery/queries";
import { isListedParticipant, isRegistrationOpen } from "@/lib/discovery/labels";

// Archetype: collection. Participants tab: public profiles only, by CandidateProfile.visibility.
// Never shows blind codes, scores, decisions or registration status.
export default async function HackathonParticipantsPage({ params }: PageProps<"/hackathons/[slug]/participants">) {
  const { slug } = await params;
  const { hackathon: h, user } = await getHackathonForView(slug);

  const registrations = await prisma.registration.findMany({
    where: { hackathonId: h.id, status: { not: "WITHDRAWN" } },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          candidateProfile: { select: { visibility: true, headline: true, skills: true } },
        },
      },
    },
  });

  const people = registrations
    .map((r) => r.user)
    .filter((u) => isListedParticipant(u.candidateProfile?.visibility))
    .map((u) => ({ ...u, skills: parseJson<string[]>(u.candidateProfile?.skills, []).slice(0, 4) }))
    .sort((a, b) => (a.name ?? a.username ?? "").localeCompare(b.name ?? b.username ?? ""));

  return (
    <section aria-labelledby="participants-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="participants-heading" className="type-display-3">builders</h2>
        <p className="type-body-s text-secondary measure">
          builders who chose a public profile. everyone else takes part without being listed.
        </p>
      </div>
      {people.length === 0 ? (
        <EmptyState
          action={
            isRegistrationOpen(h.status) ? (
              <TextLink href={`/hackathons/${h.slug}/register`}>register for {h.title}</TextLink>
            ) : (
              <TextLink href={`/hackathons/${h.slug}/projects`}>browse the projects</TextLink>
            )
          }
        >
          no builder here has a public profile yet.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-6">
          {people.map((p) => {
            const name = p.name ?? p.username ?? "builder";
            return (
              <li key={p.id} className="card flex items-start gap-4">
                <span aria-hidden="true">
                  <Avatar name={name} src={p.image} />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  {p.username ? (
                    <TextLink href={`/u/${p.username}`} className="type-display-4">
                      {name}
                    </TextLink>
                  ) : (
                    <p className="type-display-4">{name}</p>
                  )}
                  {p.candidateProfile?.headline ? <p className="type-body-s text-secondary">{p.candidateProfile.headline}</p> : null}
                  {p.skills.length > 0 ? (
                    <ul className="flex flex-wrap gap-2" aria-label={`skills of ${name}`}>
                      {p.skills.map((s) => (
                        <li key={s} className="status">
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
