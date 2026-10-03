import { StatusPill, Time } from "@/components/ui";
import { prisma } from "@/lib/db";
import { DEFAULT_TIME_ZONE } from "@/lib/format/date";
import { getHackathonForView } from "@/lib/discovery/queries";
import { buildSchedule, KIND_LABELS } from "@/lib/discovery/schedule";
import { safeUrl } from "@/lib/discovery/labels";

// Archetype: record. Schedule tab: every item with its IANA zone, including cohort check-ins and office hours.
export default async function HackathonSchedulePage({ params }: PageProps<"/hackathons/[slug]/schedule">) {
  const { slug } = await params;
  const { hackathon: h } = await getHackathonForView(slug);
  const items = await prisma.scheduleItem.findMany({ where: { hackathonId: h.id } });
  const entries = buildSchedule({ items, submissionDeadline: h.submissionDeadline, cohort: h.cohortConfig });
  const tz = DEFAULT_TIME_ZONE;

  return (
    <section aria-labelledby="schedule-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="schedule-heading" className="type-display-3">schedule</h2>
        <p className="type-body-s text-secondary">all times in {tz}.</p>
      </div>
      <ol className="flex flex-col">
        {entries.map((e) => (
          <li key={e.key} className="row grid gap-2 py-4 tablet:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] tablet:gap-6">
            <p className="type-body-s text-secondary">
              <Time value={e.startsAt} format="datetime" timeZone={tz} />
              {e.endsAt ? (
                <>
                  {" "}until <Time value={e.endsAt} format="datetime" timeZone={tz} />
                </>
              ) : null}
            </p>
            <div className="flex flex-col items-start gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="type-display-4">{e.title}</h3>
                <StatusPill>{KIND_LABELS[e.kind] ?? e.kind.toLowerCase()}</StatusPill>
              </div>
              {e.description ? <p className="type-body measure">{e.description}</p> : null}
              {safeUrl(e.link) ? (
                <a className="link type-body-s" href={safeUrl(e.link)!} rel="noopener noreferrer" target="_blank">
                  open the link for {e.title}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
