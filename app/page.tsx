import NextLink from "next/link";
import { Button, Card, EmptyState, TextLink } from "@/components/ui";
import { HackathonCard } from "@/components/discovery/hackathon-card";
import { listHackathons } from "@/lib/discovery/queries";
import { formatCents } from "@/lib/billing/math";
import { getSettings } from "@/lib/settings";

const COHORT_STEPS = [
  "a company enrolls a role in a cohort and writes down what the job needs.",
  "builders spend 2 weeks making a project from one shared prompt, with a written check-in each week. AI is allowed.",
  "the repo history, AI transcripts and a decision log go into an evidence locker next to the project.",
  "two reviewers read each project blind, behind a code like candidate 7F3A, and every score points at evidence.",
  "builders who advance defend their project in an interview: a walkthrough, a live change and a planted bug.",
  "the company meets the shortlist and decides. builders who are not hired get written feedback.",
];

// Archetype: marketing (the one marketing surface). Static display-type hero, no reel, no artwork
// (DESIGN.md). Array appears once here (manual 3.5). Leading sticker cards are allowed on this page.
export default async function HomePage() {
  const [upcoming, settings] = await Promise.all([
    listHackathons({ sort: "start" }, 12),
    getSettings(),
  ]);
  const next = upcoming.filter((h) => h.status !== "COMPLETED").slice(0, 3);

  return (
    <>
      <section aria-labelledby="page-title" className="flex flex-col items-center gap-8 py-12 text-center desktop:py-32">
        <h1 id="page-title" tabIndex={-1} className="type-poster max-w-[12ch] outline-none">
          hackathons built for hiring
        </h1>
        <p className="type-body-l measure text-secondary">
          builders show how they build with AI. companies see the evidence, meet the builders who can defend their work, and
          hire. a person makes every decision.
        </p>
        <div className="flex flex-col items-center gap-4 tablet:flex-row">
          <Button asChild variant="primary">
            <NextLink href="/hackathons">browse hackathons</NextLink>
          </Button>
          <TextLink href="/for-companies">hiring? see how cohorts work</TextLink>
        </div>
      </section>

      <section aria-label="who firefly is for" className="grid gap-8 tablet:grid-cols-2 tablet:gap-6">
        <Card leading tilt="a" className="flex flex-col gap-4">
          <h2 className="type-display-3">for builders</h2>
          <ul className="flex list-disc flex-col gap-2 ps-6 type-body">
            <li>join an open hackathon on your own or with a team, post a project, and get judged on it.</li>
            <li>or apply to a 2 week hiring cohort, where enrolled companies hire from the builders.</li>
            <li>your projects and wins stay on your profile, and you choose who can see it.</li>
          </ul>
          <TextLink href="/hackathons?type=HIRING_COHORT" className="type-body-s">
            see open hiring cohorts
          </TextLink>
        </Card>
        <Card leading tilt="b" className="flex flex-col gap-4">
          <h2 className="type-display-3">for companies</h2>
          <ul className="flex list-disc flex-col gap-2 ps-6 type-body">
            <li>enroll a role in a cohort and add the criteria that matter for it.</li>
            <li>read evidence-backed candidate reports and meet builders who passed a defense interview.</li>
            <li>
              pay {formatCents(settings.flatFeeCents)} per cohort you join, and {settings.hireFeeBps / 100}% of first-year salary
              per hire.
            </li>
          </ul>
          <TextLink href="/for-companies" className="type-body-s">
            see pricing and how review works
          </TextLink>
        </Card>
      </section>

      <section aria-labelledby="cohort-heading" className="flex flex-col gap-6">
        <h2 id="cohort-heading" className="type-display-2">how a hiring cohort works</h2>
        <ol className="flex flex-col">
          {COHORT_STEPS.map((step, n) => (
            <li key={step} className="row grid grid-cols-[4ch_minmax(0,1fr)] gap-2 py-4 type-body">
              <span className="text-secondary">{n + 1}</span>
              <span className="measure">{step}</span>
            </li>
          ))}
        </ol>
        <p className="type-body text-secondary measure">
          open hackathons run the familiar way: anyone can join, post a project before the deadline, and judges pick the
          winners for each prize.
        </p>
      </section>

      <section aria-labelledby="next-heading" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="next-heading" className="type-display-2">coming up</h2>
          <TextLink href="/hackathons">see every hackathon</TextLink>
        </div>
        {next.length > 0 ? (
          <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-6">
            {next.map((h) => (
              <li key={h.id}>
                <HackathonCard hackathon={h} headingLevel={3} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState action={<TextLink href="/hackathons?status=COMPLETED">browse finished hackathons</TextLink>}>
            nothing is open right now. finished hackathons keep their projects and winners.
          </EmptyState>
        )}
      </section>
    </>
  );
}
