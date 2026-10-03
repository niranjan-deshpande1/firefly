import Link from "next/link";
import type { ReactNode } from "react";
import type { Dashboard } from "@/lib/participation/queries";
import { Button, EmptyState, Markdown, StatusPill, TextLink, Time } from "@/components/ui";
import { InviteReply } from "./team-forms";

type HackathonView = Dashboard["current"][number];

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h3 id={id} className="type-display-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CheckInsPanel({ hackathon: h, now, primary }: { hackathon: HackathonView; now: Date; primary: boolean }) {
  const open = h.slots.find((s) => s.state === "open");
  const postedAt = new Map(h.checkIns.map((c) => [c.week, c.submittedAt]));
  return (
    <Panel id={`checkins-${h.id}`} title="weekly check-ins">
      <ul className="flex flex-col">
        {h.slots.map((s) => (
          <li key={s.week} className="row flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
            <span className="type-body w-16">week {s.week}</span>
            {s.state === "posted" ? (
              <span className="type-body-s text-secondary">
                <StatusPill tone="success">posted</StatusPill> <Time value={postedAt.get(s.week) ?? now} timeZone={h.timeZone} />
              </span>
            ) : s.state === "open" ? (
              <span className="type-body-s text-secondary">
                <StatusPill>open</StatusPill> due <Time value={s.dueAt} format="datetime" timeZone={h.timeZone} />
              </span>
            ) : s.state === "upcoming" ? (
              <span className="type-body-s text-secondary">due <Time value={s.dueAt} format="datetime" timeZone={h.timeZone} /></span>
            ) : (
              <span className="type-body-s text-secondary">not posted</span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        {open ? (
          <Button asChild variant={primary ? "primary" : "secondary"}>
            <Link href={`/hackathons/${h.slug}/check-ins`}>post your week {open.week} check-in</Link>
          </Button>
        ) : null}
        {h.checkIns.length > 0 ? <TextLink href={`/hackathons/${h.slug}/check-ins`}>read your check-ins</TextLink> : null}
      </div>
    </Panel>
  );
}

function ResultPills({ results }: { results: string[] }) {
  return results.length > 0 ? (
    <p className="flex flex-wrap gap-2">
      {results.map((r) => (
        <StatusPill key={r}>
          {r}
        </StatusPill>
      ))}
    </p>
  ) : null;
}

function ProjectsPanel({ hackathon: h }: { hackathon: HackathonView }) {
  return (
    <Panel id={`projects-${h.id}`} title={h.projects.length > 1 ? "your projects" : "your project"}>
      {h.projects.length === 0 ? (
        <EmptyState action={<Button asChild variant="primary"><Link href={`/hackathons/${h.slug}/submit`}>start your project</Link></Button>}>
          no project here yet. start a draft now and post it before the deadline.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-6">
          {h.projects.map((p) => (
            <li key={p.id} className="flex flex-col gap-2">
              <p className="flex flex-wrap items-center gap-3">
                <span className="type-display-4">{p.title}</span>
                <StatusPill tone={p.status === "SUBMITTED" ? "success" : "neutral"}>{p.status === "SUBMITTED" ? "posted" : "draft"}</StatusPill>
              </p>
              <p className="type-body text-secondary measure">{p.tagline}</p>
              <ResultPills results={p.results} />
              <p className="flex flex-wrap gap-x-6 gap-y-2 type-body-s">
                <TextLink href={`/projects/${p.id}`}>open the project page</TextLink>
                <TextLink href={`/projects/${p.id}/evidence`}>open the evidence locker</TextLink>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DeadlinesPanel({ hackathon: h }: { hackathon: HackathonView }) {
  return (
    <Panel id={`deadlines-${h.id}`} title="deadlines">
      {h.deadlines.length === 0 ? (
        <p className="type-body-s text-secondary">every date here has passed. results land on this page.</p>
      ) : (
        <ul className="flex flex-col">
          {h.deadlines.map((d) => (
            <li key={d.label} className="row flex flex-col gap-1 py-3">
              <span className="type-label text-secondary">{d.label}</span>
              <Time value={d.at} format="datetime" timeZone={h.timeZone} className="type-body-s" />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function HackathonBlock({ hackathon: h, now, primary }: { hackathon: HackathonView; now: Date; primary: boolean }) {
  return (
    <section aria-labelledby={`hackathon-${h.id}`} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 id={`hackathon-${h.id}`} className="type-display-3">
          {h.title}
        </h2>
        <p className="type-body text-secondary">{h.stateLine}</p>
        <p className="type-body-s">
          <TextLink href={`/hackathons/${h.slug}`}>open the {h.title} page</TextLink>
        </p>
      </div>
      <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
        <div className="flex flex-col gap-12 desktop:col-span-8">
          {h.isCohort ? <CheckInsPanel hackathon={h} now={now} primary={primary} /> : null}
          <ProjectsPanel hackathon={h} />
        </div>
        <div className="desktop:col-span-4">
          <DeadlinesPanel hackathon={h} />
        </div>
      </div>
    </section>
  );
}

export function InvitesSection({ invites }: { invites: Dashboard["invites"] }) {
  if (invites.length === 0) return null;
  return (
    <section aria-labelledby="invites-title" className="flex flex-col gap-4">
      <h2 id="invites-title" className="type-display-3">
        team invites
      </h2>
      <ul className="flex flex-col">
        {invites.map((i) => (
          <li key={i.id} className="row flex flex-col gap-3 py-4">
            <p className="type-body measure">
              {i.fromUser.name ?? i.fromUser.username} invited you to join {i.team.name} for{" "}
              <TextLink href={`/hackathons/${i.team.hackathon.slug}/teams`}>{i.team.hackathon.title}</TextLink>.
            </p>
            <InviteReply inviteId={i.id} teamName={i.team.name} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeedbackSection({ feedback }: { feedback: Dashboard["feedback"] }) {
  if (feedback.length === 0) return null;
  return (
    <section aria-labelledby="feedback-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="feedback-title" className="type-display-3">
          written feedback
        </h2>
        <p className="type-body-s text-secondary measure">written by the people who reviewed your project. only you can read it.</p>
      </div>
      {feedback.map((f) => (
        <article key={f.id} aria-labelledby={`feedback-${f.id}`} className="card flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 id={`feedback-${f.id}`} className="type-display-4">
              {f.project.title}
            </h3>
            {f.visibleAt ? (
              <p className="type-label text-secondary">
                shared <Time value={f.visibleAt} />
              </p>
            ) : null}
          </div>
          <Markdown className="measure">{f.body}</Markdown>
          <p className="type-body-s">
            <TextLink href={`/projects/${f.project.id}`}>open {f.project.title}</TextLink>
          </p>
        </article>
      ))}
    </section>
  );
}

export function TalentPoolPrompt({ optedIn }: { optedIn: boolean }) {
  return (
    <section aria-labelledby="talent-title" className="flex flex-col gap-4">
      <h2 id="talent-title" className="type-display-3">
        talent pool
      </h2>
      <p className="type-body measure">
        {optedIn
          ? "you're in the talent pool. companies enrolled in a current cohort can find your profile and projects. you can leave at any time."
          : "you finished a cohort, so you can join the talent pool. companies enrolled in a current cohort can then find your profile and projects. it's off until you turn it on."}
      </p>
      <p className="type-body-s">
        <TextLink href="/settings#talent-pool">{optedIn ? "change your talent pool setting" : "choose your talent pool setting"}</TextLink>
      </p>
    </section>
  );
}

export function PastHackathons({ hackathons }: { hackathons: Dashboard["past"] }) {
  if (hackathons.length === 0) return null;
  return (
    <section aria-labelledby="past-title" className="flex flex-col gap-4">
      <h2 id="past-title" className="type-display-3">
        past hackathons
      </h2>
      <ul className="flex flex-col">
        {hackathons.map((h) => (
          <li key={h.id} className="row flex flex-col gap-2 py-4">
            <TextLink href={`/hackathons/${h.slug}`} className="type-display-4">
              {h.title}
            </TextLink>
            {h.projects.length === 0 ? (
              <p className="type-body-s text-secondary">no project posted.</p>
            ) : (
              h.projects.map((p) => (
                <div key={p.id} className="flex flex-col gap-2">
                  <p className="type-body-s">
                    <TextLink href={`/projects/${p.id}`}>{p.title}</TextLink>
                  </p>
                  <ResultPills results={p.results} />
                </div>
              ))
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OpenHackathons({ hackathons }: { hackathons: Dashboard["openHackathons"] }) {
  if (hackathons.length === 0) return null;
  return (
    <ul className="flex flex-col" aria-label="open hackathons">
      {hackathons.map((h) => (
        <li key={h.id} className="row flex flex-col gap-1 py-4">
          <TextLink href={`/hackathons/${h.slug}`} className="type-display-4">
            {h.title}
          </TextLink>
          <p className="type-body-s text-secondary measure">
            {h.tagline} · starts <Time value={h.startsAt} timeZone={h.timeZone} />
          </p>
        </li>
      ))}
    </ul>
  );
}
