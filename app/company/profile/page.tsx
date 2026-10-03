// Owner: companies builder. Archetype: workspace (company profile and team).
import { PageHeader, TextLink } from "@/components/ui";
import { AddMemberForm, CompanyForm, RemoveMemberButton } from "@/components/company/company-forms";
import { requireCompanyPage } from "@/lib/company/page";
import { getCompanyWithMembers } from "@/lib/company/queries";

export default async function CompanyProfilePage({ searchParams }: PageProps<"/company/profile">) {
  const { company: slug } = await searchParams;
  const { company: active } = await requireCompanyPage(slug);
  const company = (await getCompanyWithMembers(active.id))!;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader eyebrow="company profile" title={`${company.name} team`} description={<p>who can see your roles, shortlists, reports and invoices.</p>} />

      <section aria-labelledby="members" className="flex flex-col gap-4">
        <h2 id="members" className="type-display-3">team</h2>
        <ul className="flex flex-col">
          {company.members.map((m) => (
            <li key={m.id} className="row flex items-center justify-between gap-4 py-3">
              <span className="flex flex-col gap-1">
                <span className="type-display-4">{m.user.name ?? m.user.email}</span>
                <span className="type-body-s text-secondary">{[m.title, m.isOwner ? "owner" : null, m.user.email].filter(Boolean).join(", ")}</span>
              </span>
              {m.isOwner ? null : <RemoveMemberButton companyId={company.id} memberId={m.id} name={m.user.name ?? "this teammate"} />}
            </li>
          ))}
        </ul>
        <AddMemberForm companyId={company.id} />
      </section>

      <section aria-labelledby="profile" className="flex max-w-3xl flex-col gap-6">
        <h2 id="profile" className="type-display-3">profile</h2>
        <CompanyForm company={{ id: company.id, name: company.name, website: company.website, description: company.description, size: company.size, stage: company.stage, location: company.location }} />
      </section>

      <TextLink href="/company" className="target inline-flex items-center">back to the company workspace</TextLink>
    </div>
  );
}
