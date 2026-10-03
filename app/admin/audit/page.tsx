// Owner: ops builder. Archetype: stream (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { AUDIT_ACTIONS, parseJson } from "@/lib/db";
import { auditFilterSchema, parseFilters } from "@/lib/admin/filters";
import { actionLabel, describeMetadata } from "@/lib/admin/labels";
import { listAudit } from "@/lib/admin/queries";
import { Button, EmptyState, Field, Input, PageHeader, Select, TextLink, Time } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Pager } from "@/components/admin/pager";

export const metadata = { title: "audit log" };

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");

  const filters = parseFilters(auditFilterSchema, await searchParams);
  const { rows, total } = await listAudit(filters);
  const filtered = Boolean(filters.action || filters.actor || filters.subject || filters.from || filters.to);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="operator" title="audit log" description="every report view, evidence view, identity reveal, decision, hire, invoice and settings change, newest first." />
        <AdminTabs />
      </div>

      <form method="get" aria-label="filter the audit log" className="grid grid-cols-1 items-end gap-4 tablet:grid-cols-2 desktop:grid-cols-6">
        <Field label="action">
          {({ id }) => (
            <Select id={id} name="action" defaultValue={filters.action ?? ""}>
              <option value="">all actions</option>
              {AUDIT_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {actionLabel(a)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="actor">
          {({ id }) => <Input id={id} name="actor" defaultValue={filters.actor ?? ""} placeholder="name or email" />}
        </Field>
        <Field label="subject">
          {({ id }) => <Input id={id} name="subject" defaultValue={filters.subject ?? ""} placeholder="name or email" />}
        </Field>
        <Field label="from">
          {({ id }) => <Input id={id} name="from" type="date" defaultValue={filters.from ?? ""} />}
        </Field>
        <Field label="to">
          {({ id }) => <Input id={id} name="to" type="date" defaultValue={filters.to ?? ""} />}
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit">filter log</Button>
          {filtered ? <TextLink href="/admin/audit">clear filters</TextLink> : null}
        </div>
      </form>

      <section aria-labelledby="entries-heading" className="flex flex-col gap-4 measure-stream">
        <h2 id="entries-heading" className="sr-only">entries</h2>
        {rows.length === 0 ? (
          <EmptyState action={<TextLink href="/admin/audit">show every entry</TextLink>}>no entries match these filters. remove one filter to see nearby entries.</EmptyState>
        ) : (
          <ol className="flex flex-col">
            {rows.map((r) => {
              const meta = describeMetadata(parseJson<Record<string, unknown>>(r.metadata, {}));
              return (
                <li key={r.id} className="flex flex-col gap-1 border-b border-line py-3 type-body-s">
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span className="type-body font-bold">{actionLabel(r.action)}</span>
                    <Time value={r.createdAt} format="datetime" className="text-secondary" />
                  </p>
                  <p>
                    <span className="text-secondary">by </span>
                    {r.actor ? `${r.actor.name ?? r.actor.email ?? r.actor.id} (${r.actor.role.toLowerCase()})` : "the system"}
                    {r.subjectUser ? (
                      <>
                        <span className="text-secondary"> about </span>
                        {r.subjectUser.name ?? r.subjectUser.id}
                      </>
                    ) : null}
                  </p>
                  <p className="text-secondary">
                    {r.resourceType.toLowerCase()}
                    {r.resourceId ? ` ${r.resourceId}` : ""}
                    {meta ? `, ${meta}` : ""}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
        <Pager path="/admin/audit" filters={{ ...filters, page: undefined }} page={filters.page} total={total} noun="entries" />
      </section>
    </>
  );
}
