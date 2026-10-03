// Owner: companies builder. Archetype: passage (report a hire, demo step 6).
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { HireForm } from "@/components/company/hire-form";
import { requireRolePage } from "@/lib/company/page";
import { getHireCandidates } from "@/lib/company/queries";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";

export default async function HirePage({ params }: PageProps<"/company/roles/[id]/hire">) {
  const { id } = await params;
  const { role } = await requireRolePage(id, "hire.report");
  const [candidates, settings, hired, planned] = await Promise.all([
    getHireCandidates(role.id),
    getSettings(),
    prisma.hire.count({ where: { roleId: role.id } }),
    prisma.role.findUnique({ where: { id: role.id }, select: { numberOfHires: true } }),
  ]);
  const feePercent = `${settings.hireFeeBps / 100}%`;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader
        eyebrow={`${role.title} hire`}
        title="report a hire"
        description={<p>tell us who accepted an offer for this role, their first-year salary and when they start.</p>}
      />
      {planned && hired >= planned.numberOfHires ? (
        <p role="status" className="type-body measure border-s border-line ps-4">
          you planned {planned.numberOfHires} {planned.numberOfHires === 1 ? "hire" : "hires"} for this role and have reported {hired}. you can still report another; it is billed the same way.
        </p>
      ) : null}
      {candidates.length === 0 ? (
        <EmptyState action={<TextLink href={`/company/roles/${role.id}/shortlist`}>open the {role.title} shortlist</TextLink>}>
          no active candidates on this role&apos;s shortlist to report as hired.
        </EmptyState>
      ) : (
        <HireForm roleId={role.id} candidates={candidates} feePercent={feePercent} />
      )}
      <TextLink href={`/company/roles/${role.id}`} className="target inline-flex items-center">back to {role.title}</TextLink>
    </div>
  );
}
