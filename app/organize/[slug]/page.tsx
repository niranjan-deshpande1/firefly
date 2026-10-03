// Archetype: workspace. One hackathon's console: where setup stands, who is in it, and the next dated thing.
import { prisma } from "@/lib/db";
import { managedHackathon } from "@/lib/organize/guard";
import { count, milestones } from "@/lib/organize/milestones";
import { REVIEWERS_PER_PROJECT } from "@/lib/organize/schemas";
import { Button, StatusPill, TextLink, Time } from "@/components/ui";
import { ConsoleFrame } from "@/components/organize/console-frame";
import Link from "next/link";

export default async function HackathonConsolePage({ params }: PageProps<"/organize/[slug]">) {
  const { slug } = await params;
  const { hackathon } = await managedHackathon(slug);
  const isCohort = hackathon.type === "HIRING_COHORT";
  const base = `/organize/${slug}`;

  const [registrations, projects, prizes, schedule, criteria, resources, updates, judges, winners, coverage] = await Promise.all([
    prisma.registration.count({ where: { hackathonId: hackathon.id, status: { not: "WITHDRAWN" } } }),
    prisma.project.count({ where: { hackathonId: hackathon.id, status: "SUBMITTED" } }),
    prisma.prize.count({ where: { hackathonId: hackathon.id } }),
    prisma.scheduleItem.count({ where: { hackathonId: hackathon.id } }),
    prisma.judgingCriterion.count({ where: { hackathonId: hackathon.id } }),
    prisma.resource.count({ where: { hackathonId: hackathon.id } }),
    prisma.update.count({ where: { hackathonId: hackathon.id } }),
    prisma.judgeAssignment.count({ where: { hackathonId: hackathon.id } }),
    prisma.winner.count({ where: { hackathonId: hackathon.id } }),
    isCohort
      ? prisma.project.findMany({ where: { hackathonId: hackathon.id, status: "SUBMITTED" }, select: { _count: { select: { reviewerAssignments: true } } } })
      : Promise.resolve([]),
  ]);
  const short = coverage.filter((p) => p._count.reviewerAssignments < REVIEWERS_PER_PROJECT).length;
  const now = new Date();

  const setup: { href: string; label: string; state: string }[] = [
    { href: `${base}/edit/basics`, label: "basics", state: hackathon.tagline ? "set" : "missing" },
    { href: `${base}/edit/dates`, label: "dates", state: "set" },
    { href: `${base}/edit/rules`, label: "rules and eligibility", state: hackathon.rules && hackathon.eligibility ? "set" : "missing" },
    { href: `${base}/edit/format`, label: "format and teams", state: "set" },
    { href: `${base}/edit/cover`, label: "cover image", state: hackathon.coverImage ? "set" : "none" },
    ...(isCohort
      ? [
          { href: `${base}/edit/brief`, label: "cohort prompt", state: hackathon.cohortConfig?.prompt ? "set" : "missing" },
          { href: `${base}/edit/defense`, label: "defense window and results", state: "set" },
          { href: `${base}/edit/check-ins`, label: "weekly check-ins", state: hackathon.cohortConfig?.checkInSchedule !== "[]" ? "set" : "none" },
          { href: `${base}/edit/office-hours`, label: "office hours", state: hackathon.cohortConfig?.officeHours !== "[]" ? "set" : "none" },
        ]
      : []),
    { href: `${base}/edit/status`, label: "status", state: hackathon.status.toLowerCase() },
  ];

  const counts: { href: string; label: string }[] = [
    { href: `${base}/participants`, label: `${registrations} registered` },
    { href: `${base}/participants`, label: count(projects, "posted project") },
    { href: `${base}/prizes`, label: count(prizes, "prize") },
    { href: `${base}/schedule`, label: count(schedule, "schedule item") },
    { href: `${base}/criteria`, label: count(criteria, "judging criterion", "judging criteria") },
    { href: `${base}/resources`, label: count(resources, "resource") },
    { href: `${base}/updates`, label: `${count(updates, "update")} posted` },
    isCohort
      ? { href: `${base}/reviewers`, label: `${count(short, "project")} short of reviewers` }
      : { href: `${base}/judges`, label: count(judges, "judge assignment") },
    ...(isCohort ? [] : [{ href: `${base}/winners`, label: `${count(winners, "award")} picked` }]),
  ];

  return (
    <ConsoleFrame
      hackathon={hackathon}
      title="console"
      actions={
        <Button asChild variant="primary">
          <Link href={`${base}/updates`}>post an update</Link>
        </Button>
      }
    >
      {isCohort && short > 0 ? (
        <p role="status" className="type-body text-warning measure">
          {short} posted {short === 1 ? "project has" : "projects have"} fewer than {REVIEWERS_PER_PROJECT} reviewers.{" "}
          <TextLink href={`${base}/reviewers`}>assign reviewers</TextLink>
        </p>
      ) : null}

      <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
        <section aria-labelledby="setup-heading" className="flex flex-col gap-4 desktop:col-span-4">
          <h2 id="setup-heading" className="type-display-3">setup</h2>
          <ul className="flex flex-col border-t border-line">
            {setup.map((s) => (
              <li key={s.href} className="flex min-h-11 items-center justify-between gap-4 border-b border-line py-2">
                <TextLink href={s.href}>{s.label}</TextLink>
                <StatusPill tone={s.state === "missing" ? "warning" : "neutral"}>{s.state}</StatusPill>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="people-heading" className="flex flex-col gap-4 desktop:col-span-4">
          <h2 id="people-heading" className="type-display-3">people and work</h2>
          <ul className="flex flex-col border-t border-line">
            {counts.map((c) => (
              <li key={c.label} className="flex min-h-11 items-center border-b border-line py-2">
                <TextLink href={c.href}>{c.label}</TextLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dates-heading" className="flex flex-col gap-4 desktop:col-span-4">
          <h2 id="dates-heading" className="type-display-3">dates</h2>
          <ul className="flex flex-col border-t border-line">
            {milestones(hackathon).map((m) => (
              <li key={m.label} className="flex flex-col gap-1 border-b border-line py-3">
                <span className={m.at < now ? "type-body-s text-secondary" : "type-body-s text-primary"}>{m.label}</span>
                <Time value={m.at} format="datetime" className="type-body-s text-secondary" />
              </li>
            ))}
          </ul>
          <TextLink href={`${base}/edit/dates`}>edit dates</TextLink>
        </section>
      </div>
    </ConsoleFrame>
  );
}
