import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";
import { cohortStateLine, openSlot, slotOpensAt, slotState } from "@/lib/participation/logic";
import { cohortDates, getHackathonBySlug, getOwnCheckIns, getRegistration, slotsFor } from "@/lib/participation/queries";
import { CheckInComposer } from "@/components/participation/check-in-composer";
import { CheckInHistory } from "@/components/evidence";
import { EmptyState, PageHeader, StatusPill, TextLink, Time } from "@/components/ui";

// Owner: participation builder. Archetype: stream.
// The builder's own weekly check-ins: composer first, then their history, newest first.
export const metadata = { title: "check-ins" };

export default async function CheckInsPage({ params }: PageProps<"/hackathons/[slug]/check-ins">) {
  const { slug } = await params;
  const user = await requireUser();
  const h = await getHackathonBySlug(slug);
  if (!h) notFound();
  await authorizePage(user, "hackathon.view", { hackathonId: h.id });
  // A builder reads their own check-ins here; reviewers read them in the evidence locker.
  await authorizePage(user, "checkin.view", { hackathonId: h.id, subjectUserId: user.id });

  if (h.type !== "HIRING_COHORT") {
    return (
      <div className="flex flex-col gap-8 measure-stream">
        <PageHeader level={2} title="check-ins" />
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}`}>open the {h.title} overview</TextLink>}>
          weekly check-ins are part of hiring cohorts. {h.title} doesn&apos;t use them.
        </EmptyState>
      </div>
    );
  }

  const now = new Date();
  const [registration, checkIns] = await Promise.all([getRegistration(h.id, user.id), getOwnCheckIns(h.id, user.id)]);
  const registered = !!registration && registration.status !== "WITHDRAWN";
  const slots = slotsFor(h);
  const posted = new Set(checkIns.map((c) => c.week));
  const open = registered ? openSlot(slots, posted, now) : null;
  const next = slots.find((s) => slotState(s, posted, now) === "upcoming");

  return (
    <div className="flex flex-col gap-12 measure-stream">
      <PageHeader level={2}
        title="weekly check-ins"
        description={
          <>
            <p>
              {h.title}: {cohortStateLine(h, cohortDates(h), now)}.
            </p>
            <p>your reviewers and the firefly team read check-ins. other builders don&apos;t.</p>
          </>
        }
      />

      {!registered ? (
        <EmptyState action={<TextLink href={`/hackathons/${h.slug}/register`}>register for {h.title}</TextLink>}>
          you aren&apos;t registered for this cohort. register to post a check-in each week.
        </EmptyState>
      ) : open ? (
        <CheckInComposer hackathonId={h.id} week={open.week} weekPrompt={open.prompt} />
      ) : (
        <p className="type-body">
          {next ? (
            <>
              your week {next.week} check-in opens on <Time value={slotOpensAt(next)} />. read your earlier ones below.
            </>
          ) : (
            "every check-in week for this cohort has closed. your check-ins stay with your project as evidence."
          )}
        </p>
      )}

      {registered ? (
        <section aria-labelledby="weeks-title" className="flex flex-col gap-4">
          <h2 id="weeks-title" className="type-display-4">
            weeks
          </h2>
          <ul className="flex flex-col">
            {slots.map((s) => {
              const state = slotState(s, posted, now);
              return (
                <li key={s.week} className="row flex flex-wrap items-center gap-x-4 gap-y-1 py-2 type-body-s">
                  <span className="type-body w-16">week {s.week}</span>
                  {state === "posted" ? <StatusPill tone="success">posted</StatusPill> : state === "open" ? <StatusPill>open</StatusPill> : null}
                  <span className="text-secondary">
                    {state === "not posted" ? "not posted, " : ""}due <Time value={s.dueAt} format="datetime" />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="history-title" className="flex flex-col gap-4">
        <h2 id="history-title" className="type-display-4">
          your check-ins
        </h2>
        <CheckInHistory checkIns={checkIns} />
      </section>
    </div>
  );
}
