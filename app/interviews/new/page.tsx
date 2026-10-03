// Owner: interviews builder. Archetype: passage (schedule a defense interview).
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { ScheduleForm } from "@/components/interviews/schedule-form";
import { requireRole } from "@/lib/permissions";
import { getSchedulingOptions } from "@/lib/interviews/queries";
import { DEFAULT_TIME_ZONE } from "@/lib/format/date";

export default async function NewInterviewPage({ searchParams }: PageProps<"/interviews/new">) {
  // interview.schedule: organizers and admins (requireRole lets admins through).
  const user = await requireRole("ORGANIZER");
  const { projectId } = await searchParams;
  const options = await getSchedulingOptions(user);
  const zones = Intl.supportedValuesOf("timeZone").filter((z) => z.includes("/"));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="defense interviews"
        title="schedule an interview"
        description={<p>pick an advanced candidate, who runs the interview, where, when and the panel. the candidate gets an email.</p>}
      />
      {options.projects.length === 0 ? (
        <EmptyState action={<TextLink href="/organize">open your cohorts</TextLink>}>
          no candidate has an advance decision yet. reviewers decide in the review queue, then candidates appear here.
        </EmptyState>
      ) : (
        <ScheduleForm {...options} zones={zones} defaultZone={DEFAULT_TIME_ZONE} defaultProjectId={typeof projectId === "string" ? projectId : undefined} />
      )}
    </div>
  );
}
