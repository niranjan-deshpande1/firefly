import { prisma } from "@/lib/db";
import { hasCurrentConsent } from "@/lib/profiles";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getDashboard } from "@/lib/participation/queries";
import { NAV } from "@/components/shell/nav";
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { FeedbackSection, HackathonBlock, InvitesSection, OpenHackathons, PastHackathons, TalentPoolPrompt } from "@/components/participation/dashboard";

// Owner: participation builder. Archetype: workspace.
// The builder's room: what they're in, what's due, what they made, and what came back.
export const metadata = { title: "your dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  if (user.role !== "CANDIDATE") redirect(NAV[user.role][0].href);
  // First sign-in (for example through GitHub): agree to the consent terms before anything else.
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id }, select: { consentAt: true, consentVersion: true } });
  if (!hasCurrentConsent(profile)) redirect("/onboarding?next=/dashboard");

  const now = new Date();
  const data = await getDashboard(user.id, now);
  // Rows already satisfy visibleAt <= now (the results time); feedback.read is checked per row.
  const feedback = data.feedback.filter((f) => can(user, "feedback.read", { isSelf: f.candidateId === user.id, resultsPublished: true }));
  const { registered } = await searchParams;
  const justRegistered = typeof registered === "string" ? data.current.find((h) => h.slug === registered) : undefined;
  const firstName = user.name?.split(/\s+/)[0];
  const lead = data.current[0];

  return (
    <div className="flex flex-col gap-16 desktop:gap-24">
      <PageHeader
        title={firstName ? `hi ${firstName}` : "your dashboard"}
        description={
          <>
            {justRegistered ? <p role="status">you&apos;re registered for {justRegistered.title}. we emailed you the details.</p> : null}
            <p>{lead ? `${lead.title}: ${lead.stateLine}.` : "your hackathons, check-ins, projects and feedback live here."}</p>
          </>
        }
      />

      <InvitesSection invites={data.invites} />

      {data.current.length > 0 ? (
        data.current.map((h, i) => <HackathonBlock key={h.id} hackathon={h} now={now} primary={i === 0} />)
      ) : (
        <section aria-labelledby="start-title" className="flex flex-col gap-6">
          <h2 id="start-title" className="type-display-3">
            nothing running for you right now
          </h2>
          <EmptyState action={<TextLink href="/hackathons">browse hackathons</TextLink>}>
            {data.past.length > 0
              ? "your last hackathon is a record now. pick the next one to build in."
              : "you haven't joined a hackathon yet. pick one that fits your next 2 weeks."}
          </EmptyState>
          <OpenHackathons hackathons={data.openHackathons} />
        </section>
      )}

      <FeedbackSection feedback={feedback} />
      {data.talentPool ? <TalentPoolPrompt optedIn={data.talentPool.optedIn} /> : null}
      <PastHackathons hackathons={data.past} />
    </div>
  );
}
