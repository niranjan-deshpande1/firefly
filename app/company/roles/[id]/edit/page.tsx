// Owner: companies builder. Archetype: passage (role intake, editing).
import { PageHeader, TextLink } from "@/components/ui";
import { RoleForm } from "@/components/company/role-form";
import { requireRolePage } from "@/lib/company/page";

export default async function EditRolePage({ params }: PageProps<"/company/roles/[id]/edit">) {
  const { id } = await params;
  const { role } = await requireRolePage(id);
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader eyebrow={`${role.company.name} role intake`} title={`edit ${role.title}`} description={<p>changes apply to reviews that have not started yet.</p>} />
      <RoleForm
        companyId={role.companyId}
        role={{
          id: role.id,
          title: role.title,
          level: role.level,
          description: role.description,
          requiredSkills: role.requiredSkills,
          domainKnowledge: role.domainKnowledge,
          traits: role.traits,
          numberOfHires: role.numberOfHires,
          salaryMinCents: role.salaryMinCents,
          salaryMaxCents: role.salaryMaxCents,
          location: role.location,
          remote: role.remote,
          status: role.status,
          criteria: role.criteria.map(({ id: cid, name, description, jobRelated }) => ({ id: cid, name, description, jobRelated })),
        }}
      />
      <TextLink href={`/company/roles/${role.id}`} className="target inline-flex items-center">back to {role.title}</TextLink>
    </div>
  );
}
