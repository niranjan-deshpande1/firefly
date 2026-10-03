// Owner: ops builder. Archetype: collection (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { INVOICE_STATUSES } from "@/lib/db";
import { filterHref, invoiceFilterSchema, parseFilters } from "@/lib/admin/filters";
import { listInvoices } from "@/lib/admin/queries";
import { EmptyState, PageHeader, TextLink } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { InvoiceTable } from "@/components/admin/invoice-table";

export const metadata = { title: "invoices" };

export default async function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");

  const { status } = parseFilters(invoiceFilterSchema, await searchParams);
  const invoices = await listInvoices({ status });
  const choices = [{ label: "all", value: undefined }, ...INVOICE_STATUSES.map((s) => ({ label: s.toLowerCase(), value: s }))];

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="operator"
          title="invoices"
          description="cohort fees are charged at enrollment and are non-refundable. hire fees follow a reported hire. payment happens outside firefly; mark an invoice paid when the money arrives."
        />
        <AdminTabs />
      </div>

      <nav aria-label="invoice status" className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <TextLink key={c.label} href={filterHref("/admin/invoices", { status: c.value })} aria-current={status === c.value ? "page" : undefined} className="inline-flex min-h-11 items-center px-2">
            {c.label}
          </TextLink>
        ))}
      </nav>

      <section aria-labelledby="invoices-heading" className="flex flex-col gap-4">
        <h2 id="invoices-heading" className="sr-only">invoice list</h2>
        {invoices.length === 0 ? (
          <EmptyState action={<TextLink href="/admin/invoices">show every invoice</TextLink>}>no {status?.toLowerCase()} invoices right now.</EmptyState>
        ) : (
          <InvoiceTable invoices={invoices} operator caption="invoices, newest first" />
        )}
      </section>
    </>
  );
}
