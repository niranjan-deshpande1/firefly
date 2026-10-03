// Archetype: workspace (organizer console). The organizer's hackathons, their status and the next date for each.
import Link from "next/link";
import { check, requireRole } from "@/lib/permissions";
import { listConsoleHackathons } from "@/lib/organize/queries";
import { count, nextMilestone } from "@/lib/organize/milestones";
import { Button, EmptyState, PageHeader, TextLink, Time } from "@/components/ui";
import { HackathonStatus, TYPE_LABEL } from "@/components/organize/console-frame";

export const metadata = { title: "organize" };

export default async function OrganizePage() {
  const user = await requireRole("ORGANIZER");
  const [hackathons, canCreate] = await Promise.all([listConsoleHackathons(user), check(user, "hackathon.create")]);
  const now = new Date();
  const create = canCreate ? (
    <Button asChild variant="primary">
      <Link href="/organize/new">create a hackathon</Link>
    </Button>
  ) : null;

  return (
    <>
      <PageHeader
        title="your hackathons"
        description={user.role === "ADMIN" ? "every hackathon and hiring cohort on firefly." : "the hackathons and hiring cohorts you run."}
        actions={hackathons.length > 0 ? create : null}
      />

      {hackathons.length === 0 ? (
        <EmptyState action={create ?? <TextLink href="/hackathons">browse hackathons</TextLink>}>
          you have not set up a hackathon yet. create one, then add its dates, rules and prizes.
        </EmptyState>
      ) : (
        <section aria-labelledby="hackathons-heading" className="flex flex-col gap-4">
          <h2 id="hackathons-heading" className="sr-only">
            hackathons
          </h2>
          <ul className="flex flex-col border-t border-line">
            {hackathons.map((h) => {
              const next = nextMilestone(h, now);
              return (
                <li key={h.id} className="flex flex-col gap-2 border-b border-line py-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6">
                  <div className="flex flex-col gap-1">
                    <Link href={`/organize/${h.slug}`} className="link type-display-4 inline-flex min-h-11 items-center">
                      {h.title}
                    </Link>
                    <p className="flex flex-wrap items-center gap-3 type-body-s text-secondary">
                      <span>{TYPE_LABEL[h.type]}</span>
                      <HackathonStatus status={h.status} />
                      <span>
                        {h._count.registrations} registered, {count(h._count.projects, "project")}
                      </span>
                      {user.role === "ADMIN" && h.organizer.name ? <span>run by {h.organizer.name}</span> : null}
                    </p>
                  </div>
                  <p className="type-body-s text-secondary tablet:text-end">
                    {next ? (
                      <>
                        {next.label} <Time value={next.at} format="datetime" timeZone={h.timeZone} className="text-primary" />
                      </>
                    ) : (
                      "every date has passed"
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
