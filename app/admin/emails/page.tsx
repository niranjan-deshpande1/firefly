// Owner: ops builder. Archetype: stream (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { emailFilterSchema, parseFilters } from "@/lib/admin/filters";
import { listEmails } from "@/lib/admin/queries";
import { Button, EmptyState, Field, Input, PageHeader, Select, TextLink, Time } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Pager } from "@/components/admin/pager";

export const metadata = { title: "email log" };

export default async function EmailLogPage({ searchParams }: PageProps<"/admin/emails">) {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");

  const filters = parseFilters(emailFilterSchema, await searchParams);
  const { rows, total, templates } = await listEmails(filters);
  const filtered = Boolean(filters.template || filters.to);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="operator" title="email log" description="every email firefly would have sent. nothing leaves the app; this log is the record." />
        <AdminTabs />
      </div>

      <form method="get" aria-label="filter the email log" className="grid grid-cols-1 items-end gap-4 tablet:grid-cols-3">
        <Field label="template">
          {({ id }) => (
            <Select id={id} name="template" defaultValue={filters.template ?? ""}>
              <option value="">all templates</option>
              {templates.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="recipient">
          {({ id }) => <Input id={id} name="to" defaultValue={filters.to ?? ""} placeholder="email address" />}
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit">filter log</Button>
          {filtered ? <TextLink href="/admin/emails">clear filters</TextLink> : null}
        </div>
      </form>

      <section aria-labelledby="emails-heading" className="flex flex-col gap-4 measure-stream">
        <h2 id="emails-heading" className="sr-only">emails</h2>
        {rows.length === 0 ? (
          <EmptyState action={<TextLink href="/admin/emails">show every email</TextLink>}>no emails match these filters. remove one filter to see nearby emails.</EmptyState>
        ) : (
          <ol className="flex flex-col">
            {rows.map((e) => (
              <li key={e.id} className="border-b border-line py-3 type-body-s">
                <details className="group">
                  <summary className="flex min-h-11 cursor-pointer flex-col justify-center gap-1">
                    <span className="type-body font-bold">{e.subject}</span>
                    <span className="text-secondary">
                      to {e.to}, {e.template}, <Time value={e.createdAt} format="datetime" />
                    </span>
                  </summary>
                  <p className="measure whitespace-pre-line pt-3">{e.body}</p>
                </details>
              </li>
            ))}
          </ol>
        )}
        <Pager path="/admin/emails" filters={{ ...filters, page: undefined }} page={filters.page} total={total} noun="emails" />
      </section>
    </>
  );
}
