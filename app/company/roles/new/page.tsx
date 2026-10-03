// Owner: companies builder. Archetype: passage (role intake).
import { PageHeader, TextLink } from "@/components/ui";
import { RoleForm } from "@/components/company/role-form";
import { requireCompanyPage } from "@/lib/company/page";

export default async function NewRolePage({ searchParams }: PageProps<"/company/roles/new">) {
  const { company: slug } = await searchParams;
  const { company } = await requireCompanyPage(slug);
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader
        eyebrow={`${company.name} role intake`}
        title="describe the role"
        description={<p>what the job needs, what it pays, and the job-related criteria reviewers will score. it takes about 20 minutes.</p>}
      />
      <RoleForm companyId={company.id} />
      <TextLink href="/company" className="target inline-flex items-center">back to the company workspace</TextLink>
    </div>
  );
}
