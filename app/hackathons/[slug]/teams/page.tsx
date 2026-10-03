import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { teamHasRoom, teamsAllowed } from "@/lib/participation/logic";
import { getHackathonBySlug, getRegistration, getTeamsPage } from "@/lib/participation/queries";
import { CreateTeamForm, InviteForm, InviteFromBoard, InviteReply, LeaveTeamButton, LookingForTeamForm } from "@/components/participation/team-forms";
import { Avatar, EmptyState, PageHeader, StatusPill, TextLink } from "@/components/ui";

// Owner: participation builder. Archetype: workspace.
// Who is in the room (your team, people looking) and what you can do next (invite, join, start).
export const metadata = { title: "teams" };

type Person = { name: string | null; username: string | null; image?: string | null; candidateProfile?: { visibility: string } | null };

function PersonName({ person }: { person: Person }) {
  const label = person.name ?? person.username ?? "a builder";
  // Only public profiles resolve at /u/<name>.
  const linked = person.username && person.candidateProfile?.visibility === "PUBLIC";
  return linked ? <TextLink href={`/u/${person.username}`}>{label}</TextLink> : <span>{label}</span>;
}

export default async function TeamsPage({ params }: PageProps<"/hackathons/[slug]/teams">) {
  const { slug } = await params;
  const user = await requireUser();
  const h = await getHackathonBySlug(slug);
  if (!h) notFound();
  await authorizePage(user, "hackathon.view", { hackathonId: h.id });

  if (!teamsAllowed(h)) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader level={2} title="teams" />
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}`}>open the {h.title} overview</TextLink>}>
          {h.type === "HIRING_COHORT"
            ? "hiring cohorts are solo. each builder makes and defends their own project, so there are no teams here."
            : `${h.title} is solo. each builder posts their own project, so there are no teams here.`}
        </EmptyState>
      </div>
    );
  }

  const [{ myTeam, otherTeams, myInvites, board }, registration] = await Promise.all([getTeamsPage(h.id, user.id), getRegistration(h.id, user.id)]);
  const registered = user.role === "CANDIDATE" && !!registration && registration.status !== "WITHDRAWN";
  const editable = registered && h.status !== "COMPLETED";
  const hasRoom = !!myTeam && teamHasRoom(myTeam.members.length, myTeam.invites.length, h.maxTeamSize);

  return (
    <div className="flex flex-col gap-16">
      <PageHeader level={2}
        title={myTeam ? myTeam.name : "teams"}
        description={<p>teams in {h.title} hold up to {h.maxTeamSize} builders. you can also build solo.</p>}
      />

      {/* Your room first: who is on your team, or how to get on one. */}
      {!registered ? (
        user.role === "CANDIDATE" && h.status !== "COMPLETED" ? (
          <EmptyState action={<TextLink href={`/hackathons/${h.slug}/register`}>register for {h.title}</TextLink>}>
            register first, then start a team or join one from the board below.
          </EmptyState>
        ) : null
      ) : myTeam ? (
        <section aria-labelledby="my-team-title" className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
          <div className="flex flex-col gap-6 desktop:col-span-7">
            <h2 id="my-team-title" className="type-display-3">
              your team
            </h2>
            {myTeam.description ? <p className="type-body measure">{myTeam.description}</p> : null}
            <ul className="flex flex-col" aria-label={`members of ${myTeam.name}`}>
              {myTeam.members.map((m) => (
                <li key={m.userId} className="row flex items-center gap-3 py-2">
                  <Avatar name={m.user.name ?? m.user.username ?? "builder"} src={m.user.image} />
                  <span className="type-body">
                    <PersonName person={m.user} />
                  </span>
                  {m.isLead ? <StatusPill>started the team</StatusPill> : null}
                </li>
              ))}
              {myTeam.invites.map((i) => (
                <li key={i.id} className="row flex items-center gap-3 py-2">
                  <span className="type-body text-secondary">
                    {i.toUser.name ?? i.toUser.username}, invited
                  </span>
                </li>
              ))}
            </ul>
            {editable ? <LeaveTeamButton teamId={myTeam.id} teamName={myTeam.name} isLast={myTeam.members.length === 1} /> : null}
          </div>
          {editable ? (
            <div className="flex flex-col gap-4 desktop:col-span-5">
              <h2 className="type-display-4">invite a teammate</h2>
              {hasRoom ? (
                <InviteForm teamId={myTeam.id} primary />
              ) : (
                <p className="type-body-s text-secondary measure">
                  your team has {myTeam.members.length + myTeam.invites.length} of {h.maxTeamSize} seats taken, counting open invites. a seat frees up when an invite is answered.
                </p>
              )}
            </div>
          ) : null}
        </section>
      ) : editable ? (
        <section aria-label="get on a team" className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
          <div className="flex flex-col gap-8 desktop:col-span-7">
            {myInvites.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="type-display-3">invites for you</h2>
                <ul className="flex flex-col">
                  {myInvites.map((i) => (
                    <li key={i.id} className="row flex flex-col gap-3 py-4">
                      <p className="type-body">
                        <PersonName person={i.fromUser} /> invited you to join {i.team.name}.
                      </p>
                      <InviteReply inviteId={i.id} teamName={i.team.name} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <CreateTeamForm hackathonId={h.id} />
          </div>
          <div className="flex flex-col gap-4 desktop:col-span-5">
            <h2 className="type-display-4">looking for teammates</h2>
            <LookingForTeamForm hackathonId={h.id} looking={registration!.lookingForTeam} note={registration!.lookingForNote} />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="board-title" className="flex flex-col gap-4">
        <h2 id="board-title" className="type-display-3">
          looking for teammates
        </h2>
        {board.length === 0 ? (
          <p className="type-body text-secondary measure">no one is on the board right now. the teams below show who is already building together.</p>
        ) : (
          <ul className="flex flex-col">
            {board.map((b) => (
              <li key={b.user.id} className="row flex flex-wrap items-center gap-3 py-3">
                <Avatar name={b.user.name ?? b.user.username ?? "builder"} src={b.user.image} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="type-body">
                    <PersonName person={b.user} />
                  </span>
                  {b.lookingForNote ? <p className="type-body-s text-secondary measure">{b.lookingForNote}</p> : null}
                </div>
                {editable && myTeam && hasRoom && b.user.username && b.user.id !== user.id ? (
                  <InviteFromBoard teamId={myTeam.id} username={b.user.username} name={b.user.name ?? b.user.username} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="teams-title" className="flex flex-col gap-4">
        <h2 id="teams-title" className="type-display-3">
          {myTeam ? "other teams" : "teams"}
        </h2>
        {otherTeams.length === 0 ? (
          <p className="type-body text-secondary measure">no other teams yet. builders on the board above are looking for one.</p>
        ) : (
          <ul className="flex flex-col">
            {otherTeams.map((t) => (
              <li key={t.id} className="row flex flex-col gap-2 py-4">
                <span className="type-display-4">{t.name}</span>
                {t.description ? <p className="type-body-s text-secondary measure">{t.description}</p> : null}
                <p className="flex flex-wrap gap-x-4 gap-y-1 type-body-s">
                  {t.members.map((m) => (
                    <PersonName key={m.userId} person={m.user} />
                  ))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
