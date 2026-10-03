// Owner: ops builder. Archetype: workspace (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { getFunnel } from "@/lib/admin/queries";
import { funnelRows } from "@/lib/admin/funnel";
import { formatCents } from "@/lib/billing/math";
import { PageHeader, Stat, TextLink } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { FunnelChart } from "@/components/admin/funnel-chart";

export const metadata = { title: "operator overview" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");

  const [{ counts, revenue }, unpaid, openRequests, interviewRequests] = await Promise.all([
    getFunnel(),
    prisma.invoice.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.dataRequest.count({ where: { status: "OPEN" } }),
    prisma.interviewRequest.count({ where: { status: "PENDING" } }),
  ]);
  const rows = funnelRows(counts);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="operator" title="how firefly is doing" description="every builder, project and hire to date, from signup to paid invoice." />
        <AdminTabs />
      </div>

      <section aria-labelledby="funnel-heading" className="flex flex-col gap-8">
        <h2 id="funnel-heading" className="type-display-3">funnel</h2>
        <dl className="grid grid-cols-2 gap-6 tablet:grid-cols-3 desktop:grid-cols-5">
          {rows.map((r) => (
            <Stat key={r.key} label={r.label} value={r.value} />
          ))}
        </dl>
        <FunnelChart rows={rows} />
      </section>

      <section aria-labelledby="revenue-heading" className="flex flex-col gap-8">
        <h2 id="revenue-heading" className="type-display-3">revenue</h2>
        <dl className="grid grid-cols-2 gap-6 tablet:grid-cols-3">
          <Stat label="invoiced" value={formatCents(revenue.invoicedCents)} />
          <Stat label="paid" value={formatCents(revenue.paidCents)} />
          <Stat label="outstanding" value={formatCents(revenue.outstandingCents)} />
        </dl>
        <p className="type-body-s text-secondary measure">invoiced counts sent and paid invoices. drafts are left out until they are sent.</p>
      </section>

      <section aria-labelledby="next-heading" className="flex flex-col gap-4">
        <h2 id="next-heading" className="type-display-4">waiting on you</h2>
        <ul className="flex flex-col gap-3 type-body">
          <li>
            {unpaid === 0 ? "every invoice is paid. " : `${unpaid} ${unpaid === 1 ? "invoice is" : "invoices are"} not paid yet. `}
            <TextLink href="/admin/invoices">open invoices</TextLink>
          </li>
          <li>
            {openRequests === 0 ? "no data requests are open. " : `${openRequests} data ${openRequests === 1 ? "request is" : "requests are"} open. `}
            <TextLink href="/admin/data-requests">open data requests</TextLink>
          </li>
          <li>
            {interviewRequests === 0
              ? "no company interview requests are waiting. "
              : `${interviewRequests} company interview ${interviewRequests === 1 ? "request is" : "requests are"} waiting. `}
            <TextLink href="/interviews/requests">open interview requests</TextLink>
          </li>
          <li>
            who saw which candidate report is in the <TextLink href="/admin/audit?action=REPORT_VIEW">audit log of report views</TextLink>
          </li>
        </ul>
      </section>
    </>
  );
}
