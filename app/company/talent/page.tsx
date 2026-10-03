// Owner: companies builder. Archetype: collection (talent pool of opted-in past finishers).
// Listed alphabetically with public-fact reasons only: no scores, no match score, no ranking.
import Link from "next/link";
import { Button, EmptyState, PageHeader, StatusPill, TextLink } from "@/components/ui";
import { InterviewRequestForm } from "@/components/company/interview-request-form";
import { check } from "@/lib/permissions";
import { requireCompanyPage } from "@/lib/company/page";
import { getCompanyRoles, getDashboard } from "@/lib/company/queries";
import { getTalentPool } from "@/lib/company/talent";

export default async function CompanyTalentPage({ searchParams }: PageProps<"/company/talent">) {
  const { company: slug } = await searchParams;
  const { user, company } = await requireCompanyPage(slug);
  const header = (
    <PageHeader
      eyebrow={`${company.name} talent pool`}
      title="past finishers"
      description={<p>builders who finished a Firefly hackathon and chose to be found by companies. listed by name.</p>}
    />
  );

  if (!(await check(user, "talentPool.browse", { companyId: company.id }))) {
    const { roles } = await getDashboard(company.id);
    return (
      <div className="flex flex-col gap-8">
        {header}
        <EmptyState
          action={
            <Button asChild variant="primary">
              <Link href={roles[0] ? `/company/roles/${roles[0].id}/enroll` : "/company/roles/new"}>{roles[0] ? `enroll ${roles[0].title} in a cohort` : "add a role"}</Link>
            </Button>
          }
        >
          the talent pool opens while one of your roles is enrolled in a hiring cohort that has not ended.
        </EmptyState>
      </div>
    );
  }

  const [people, roles] = await Promise.all([getTalentPool(), getCompanyRoles(company.id)]);
  return (
    <div className="flex flex-col gap-8">
      {header}
      {people.length === 0 ? (
        <EmptyState action={<TextLink href="/company">return to your shortlists</TextLink>}>
          no past finishers have opted in yet. people join after their hackathon ends.
        </EmptyState>
      ) : (
        <ul className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3" aria-label="past finishers">
          {people.map((p) => (
            <li key={p.id} className="card flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="type-display-4">{p.username ? <TextLink href={`/u/${p.username}`}>{p.name}</TextLink> : p.name}</h2>
                {p.headline ? <p className="type-body-s text-secondary">{p.headline}</p> : null}
              </div>
              <ul className="flex flex-col gap-1 type-body-s">
                {p.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <ul className="flex flex-col gap-2">
                {p.projects.map((proj) => (
                  <li key={proj.id} className="flex flex-wrap items-center gap-2">
                    <TextLink href={`/projects/${proj.id}`} className="type-body-s">{proj.title}</TextLink>
                    {proj.verified ? <StatusPill tone="success">verified</StatusPill> : null}
                  </li>
                ))}
              </ul>
              <InterviewRequestForm candidateId={p.id} roles={roles} compact />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
