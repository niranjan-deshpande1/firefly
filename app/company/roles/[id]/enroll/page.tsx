// Owner: companies builder. Archetype: passage (cohort enrollment, demo step 2).
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { EnrollForm } from "@/components/company/enroll-form";
import { requireRolePage } from "@/lib/company/page";
import { getEnrollableCohorts } from "@/lib/company/queries";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/format/date";

export default async function EnrollPage({ params }: PageProps<"/company/roles/[id]/enroll">) {
  const { id } = await params;
  const { role } = await requireRolePage(id, "cohort.enroll");
  const [cohorts, settings] = await Promise.all([getEnrollableCohorts(role.id), getSettings()]);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader
        eyebrow={`enroll ${role.title}`}
        title="choose a hiring cohort"
        description={<p>a cohort is a 2-week build with weekly check-ins, blind review and defense interviews. candidates who advance reach this role&apos;s shortlist.</p>}
      />
      {cohorts.length === 0 ? (
        <EmptyState action={<TextLink href="/hackathons">see every hackathon and cohort</TextLink>}>
          no upcoming or open hiring cohort is taking this role right now.
        </EmptyState>
      ) : (
        <EnrollForm
          roleId={role.id}
          roleTitle={role.title}
          feeCents={settings.flatFeeCents}
          cohorts={cohorts.map((c) => ({
            id: c.id,
            title: c.title,
            dates: `${c.status === "OPEN" ? "open now" : "upcoming"}, builds ${formatDate(c.startsAt)} to ${formatDate(c.submissionDeadline)}, results by ${formatDate(c.endsAt)}`,
          }))}
        />
      )}
      <TextLink href={`/company/roles/${role.id}`} className="target inline-flex items-center">back to {role.title}</TextLink>
    </div>
  );
}
