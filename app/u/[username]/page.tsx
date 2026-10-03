// Owner: profiles and privacy builder. Archetype: record.
// Public facts only: no blind code, scores, decisions, feedback, check-ins or evidence.
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { check } from "@/lib/permissions";
import { EXPERIENCE_LABEL } from "@/lib/profiles";
import { getProfileByUsername, isProfileVisible } from "@/lib/profiles/queries";
import { EXPERIENCE_LEVELS } from "@/lib/db";
import { Avatar, Chip, EmptyState, Markdown, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";

// A fixed title, so the tab of a hidden or missing profile says nothing about it.
export const metadata = { title: "profile" };

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const [viewer, data] = await Promise.all([getCurrentUser(), getProfileByUsername(decodeURIComponent(username).toLowerCase())]);
  if (!data) notFound();

  const canManage = await check(viewer, "profile.edit", { subjectUserId: data.id });
  const isOwner = viewer?.id === data.id;
  if (!data.profile) {
    if (isOwner) redirect(`/onboarding?next=${encodeURIComponent(`/u/${data.username}`)}`);
    notFound();
  }
  if (!isProfileVisible(data.profile.visibility, canManage)) notFound();

  const { profile, projects, hackathons } = data;
  const wins = projects.flatMap((p) => p.winners.map((w) => ({ id: w.id, prize: w.prize.name, project: p.title, projectId: p.id, hackathon: p.hackathon.title })));
  const level = EXPERIENCE_LEVELS.find((l) => l === profile.experienceLevel);
  const links = profile.links.filter((l) => /^https?:\/\//i.test(l.url));
  const facts = [profile.location, profile.school, level ? EXPERIENCE_LABEL[level] : null].filter(Boolean);

  return (
    <div className="flex flex-col gap-16 desktop:gap-24">
      <div className="flex flex-col gap-6">
        <Avatar name={data.name} src={data.image} size={96} />
        <PageHeader
          eyebrow="builder"
          title={data.name}
          description={profile.headline ?? undefined}
          actions={isOwner ? <TextLink href="/settings">edit your profile</TextLink> : undefined}
        />
        {facts.length > 0 ? <p className="type-body-s text-secondary">{facts.join(" · ")}</p> : null}
        {profile.visibility !== "PUBLIC" ? (
          <p className="type-body-s text-warning measure">
            this profile is hidden. only {isOwner ? "you" : "its owner"} and firefly admins can see it.{" "}
            {isOwner ? <TextLink href="/settings#settings-privacy">change who can see it</TextLink> : null}
          </p>
        ) : null}
      </div>

      <div className="grid gap-16 desktop:grid-cols-12 desktop:gap-6">
        <div className="flex flex-col gap-16 desktop:col-span-8">
          <section aria-labelledby="profile-projects" className="flex flex-col gap-6">
            <h2 id="profile-projects" className="type-display-3">projects</h2>
            {projects.length === 0 ? (
              isOwner ? (
                <EmptyState action={<TextLink href="/hackathons">explore hackathons</TextLink>}>
                  no projects here yet. find a hackathon, then post what you&apos;re making.
                </EmptyState>
              ) : (
                <EmptyState action={<TextLink href="/hackathons">browse hackathons</TextLink>}>
                  this builder has not posted a project yet. see what people are making in hackathons.
                </EmptyState>
              )
            ) : (
              <ul className="flex flex-col gap-4">
                {projects.map((p) => (
                  <li key={p.id} className="card flex flex-col gap-3">
                    <TextLink href={`/projects/${p.id}`} className="min-h-11 inline-flex items-center type-display-4">{p.title}</TextLink>
                    <p className="type-body">{p.tagline}</p>
                    <p className="type-body-s text-secondary">
                      {p.hackathon.title}
                      {p.submittedAt ? <> · posted <Time value={p.submittedAt} /></> : null}
                    </p>
                    {p.verified || p.winners.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {p.verified ? <StatusPill tone="success">verified</StatusPill> : null}
                        {p.winners.map((w) => <StatusPill key={w.id}>awarded: {w.prize.name}</StatusPill>)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {projects.some((p) => p.verified) ? (
              <p className="type-body-s text-secondary measure">verified means the builder walked through, changed and defended this project live in a firefly interview.</p>
            ) : null}
          </section>

          {profile.bio ? (
            <section aria-labelledby="profile-about" className="flex flex-col gap-6">
              <h2 id="profile-about" className="type-display-3">about</h2>
              <Markdown className="measure">{profile.bio}</Markdown>
            </section>
          ) : null}
        </div>

        <aside aria-label="details" className="flex flex-col gap-12 desktop:col-span-4">
          {wins.length > 0 ? (
            <section aria-labelledby="profile-wins" className="flex flex-col gap-3">
              <h2 id="profile-wins" className="type-display-4">wins</h2>
              <ul className="flex flex-col">
                {wins.map((w) => (
                  <li key={w.id} className="row flex flex-col justify-center gap-1 py-2">
                    <span className="type-body-s">awarded: {w.prize}</span>
                    <span className="type-body-s text-secondary">{w.project}, {w.hackathon}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {profile.skills.length > 0 ? (
            <section aria-labelledby="profile-skills" className="flex flex-col gap-3">
              <h2 id="profile-skills" className="type-display-4">skills</h2>
              <ul className="flex flex-wrap gap-2">
                {profile.skills.map((s) => <li key={s}><Chip>{s}</Chip></li>)}
              </ul>
            </section>
          ) : null}

          {links.length > 0 ? (
            <section aria-labelledby="profile-links" className="flex flex-col gap-3">
              <h2 id="profile-links" className="type-display-4">links</h2>
              <ul className="flex flex-col">
                {links.map((l) => (
                  <li key={l.url} className="row flex items-center">
                    <a href={l.url} className="link type-body-s" rel="noopener noreferrer nofollow" target="_blank">{l.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="profile-hackathons" className="flex flex-col gap-3">
            <h2 id="profile-hackathons" className="type-display-4">hackathons</h2>
            {hackathons.length === 0 ? (
              <EmptyState action={<TextLink href="/hackathons">{isOwner ? "find an open hackathon" : "browse hackathons"}</TextLink>}>
                {isOwner ? "you have not joined a hackathon yet." : "this builder has not joined a hackathon yet."}
              </EmptyState>
            ) : (
              <ul className="flex flex-col">
                {hackathons.map((h) => (
                  <li key={h.id} className="row flex items-center">
                    <TextLink href={`/hackathons/${h.slug}`} className="min-h-11 inline-flex items-center type-body-s">{h.title}</TextLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
