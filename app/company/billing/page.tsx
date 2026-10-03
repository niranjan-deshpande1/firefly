// Owner: ops builder. Archetype: collection.
import { notFound } from "next/navigation";
import { authorizePage } from "@/lib/permissions";
import { requireCompanyUser } from "@/lib/company/page";
import { prisma } from "@/lib/db";
import { listInvoices } from "@/lib/admin/queries";
import { revenueFrom } from "@/lib/admin/funnel";
import { formatCents } from "@/lib/billing/math";
import { getSettings } from "@/lib/settings";
import { EmptyState, PageHeader, Stat, TextLink } from "@/components/ui";
import { InvoiceTable } from "@/components/admin/invoice-table";

export const metadata = { title: "billing" };

export default async function CompanyBillingPage() {
  const user = await requireCompanyUser();
  // ponytail: one company per member in v1; the first membership is the billing company.
  const membership = await prisma.companyMember.findFirst({ where: { userId: user.id }, include: { company: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } });
  if (!membership) notFound();
  await authorizePage(user, "invoice.view", { companyId: membership.companyId });

  const [invoices, settings] = await Promise.all([listInvoices({ companyId: membership.companyId }), getSettings()]);
  const totals = revenueFrom(invoices);

  return (
    <>
      <PageHeader
        eyebrow={membership.company.name}
        title="billing"
        description={`a ${formatCents(settings.flatFeeCents)} cohort fee per role at enrollment, non-refundable, and ${settings.hireFeeBps / 100}% of first-year salary for each hire you report. pay by bank transfer; firefly marks an invoice paid when it arrives.`}
      />

      {invoices.length === 0 ? (
        <EmptyState action={<TextLink href="/company">enroll a role in a hiring cohort</TextLink>}>
          no invoices yet. your first one is issued when you enroll a role in a hiring cohort.
        </EmptyState>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-6 tablet:grid-cols-3">
            <Stat label="invoiced" value={formatCents(totals.invoicedCents)} />
            <Stat label="paid" value={formatCents(totals.paidCents)} />
            <Stat label="due" value={formatCents(totals.outstandingCents)} />
          </dl>
          <section aria-labelledby="invoices-heading" className="flex flex-col gap-4">
            <h2 id="invoices-heading" className="type-display-3">invoices</h2>
            <InvoiceTable invoices={invoices} operator={false} caption={`${membership.company.name} invoices, newest first`} />
          </section>
          <p className="type-body-s text-secondary measure">
            questions about an invoice? reply to the invoice email. to add a hire, report it from the <TextLink href="/company">company dashboard</TextLink>.
          </p>
        </>
      )}
    </>
  );
}
