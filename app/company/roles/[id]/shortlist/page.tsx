// Owner: companies builder. Archetype: collection (shortlist per role, demo step 6).
import { EmptyState, PageHeader, StatusPill, TextLink } from "@/components/ui";
import { requireRolePage } from "@/lib/company/page";
import { getShortlist } from "@/lib/company/queries";
import { interviewStatusLabel } from "@/lib/company/labels";

export default async function ShortlistPage({ params }: PageProps<"/company/roles/[id]/shortlist">) {
  const { id } = await params;
  const { role } = await requireRolePage(id, "shortlist.view");
  const entries = await getShortlist(role.id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={`${role.title} shortlist`}
        title="who advanced"
        description={<p>candidates a reviewer advanced, listed in the order they were added. open a report to read the scores, evidence and interview notes.</p>}
      />
      {entries.length === 0 ? (
        <EmptyState action={<TextLink href={role.enrollments.length ? `/company/roles/${role.id}` : `/company/roles/${role.id}/enroll`}>{role.enrollments.length ? `review the ${role.title} role` : "enroll this role in a hiring cohort"}</TextLink>}>
          no one has advanced for this role yet. candidates appear here when a reviewer advances them after the cohort.
        </EmptyState>
      ) : (
        <ul className="flex flex-col" aria-label={`${role.title} shortlist`}>
          {entries.map((e) => {
            const interview = e.project.interviews.find((iv) => iv.candidateId === e.candidate.id) ?? null;
            return (
              <li key={e.id} className="row flex flex-col gap-3 py-4 tablet:flex-row tablet:items-center tablet:justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="type-display-4">{e.candidate.name ?? "unnamed candidate"}</h2>
                  <p className="type-body-s">
                    <TextLink href={`/projects/${e.project.id}`}>{e.project.title}</TextLink>
                    <span className="text-secondary">, {e.project.hackathon.title}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={e.project.verified ? "success" : "neutral"}>{e.project.verified ? "verified" : "not verified yet"}</StatusPill>
                    <StatusPill>{interviewStatusLabel(interview)}</StatusPill>
                    {e.status === "HIRED" ? <StatusPill>hired</StatusPill> : null}
                  </div>
                </div>
                <TextLink href={`/company/reports/${role.id}/${e.candidate.id}`} className="target inline-flex items-center">
                  open {e.candidate.name ?? "candidate"}&apos;s report
                </TextLink>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap gap-x-6">
        <TextLink href={`/company/roles/${role.id}/hire`} className="target inline-flex items-center">report a hire for {role.title}</TextLink>
        <TextLink href={`/company/roles/${role.id}`} className="target inline-flex items-center">back to {role.title}</TextLink>
      </div>
    </div>
  );
}
