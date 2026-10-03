// Owner: ops builder. Archetype: collection (operator only).
import { authorizePage, requireRole } from "@/lib/permissions";
import { getResolverNames, listDataRequests } from "@/lib/admin/queries";
import { EmptyState, PageHeader, StatusPill, Table, Td, TextLink, Th, Time } from "@/components/ui";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { DataRequestActions } from "@/components/admin/data-request-actions";

export const metadata = { title: "data requests" };

const KIND_LABEL: Record<string, string> = { EXPORT: "export", DELETE: "delete" };

export default async function DataRequestsPage() {
  const user = await requireRole("ADMIN");
  await authorizePage(user, "admin.access");

  const requests = await listDataRequests();
  const open = requests.filter((r) => r.status === "OPEN");
  const resolved = requests.filter((r) => r.status !== "OPEN");
  const resolvers = await getResolverNames(resolved.flatMap((r) => (r.resolvedById ? [r.resolvedById] : [])));

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="operator"
          title="data requests"
          description="builders ask for a copy of their data or for it to be deleted. exports download from their settings page; deletes are done here and can't be undone."
        />
        <AdminTabs />
      </div>

      <section aria-labelledby="open-heading" className="flex flex-col gap-4">
        <h2 id="open-heading" className="type-display-3">open</h2>
        {open.length === 0 ? (
          <EmptyState action={<TextLink href="/admin/audit?action=DATA_REQUEST_RESOLVED">see resolved requests in the audit log</TextLink>}>
            no data requests are waiting.
          </EmptyState>
        ) : (
          <Table caption="open data requests, newest first">
            <thead>
              <tr>
                <Th>person</Th>
                <Th>request</Th>
                <Th>opened</Th>
                <Th>note</Th>
                <Th>action</Th>
              </tr>
            </thead>
            <tbody>
              {open.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <p>{r.user.name ?? r.user.id}</p>
                    <p className="text-secondary">{r.user.email ?? "no email"}</p>
                  </Td>
                  <Td>{KIND_LABEL[r.kind] ?? r.kind.toLowerCase()}</Td>
                  <Td className="whitespace-nowrap">
                    <Time value={r.createdAt} />
                  </Td>
                  <Td className="min-w-48">{r.note ?? <span className="text-secondary">no note</span>}</Td>
                  <Td>
                    <DataRequestActions id={r.id} kind={r.kind} personName={r.user.name ?? "this person"} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {resolved.length > 0 ? (
        <section aria-labelledby="resolved-heading" className="flex flex-col gap-4">
          <h2 id="resolved-heading" className="type-display-4">resolved</h2>
          <Table caption="resolved data requests">
            <thead>
              <tr>
                <Th>person</Th>
                <Th>request</Th>
                <Th>outcome</Th>
                <Th>resolved</Th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((r) => (
                <tr key={r.id}>
                  <Td>{r.user.name ?? r.user.id}</Td>
                  <Td>{KIND_LABEL[r.kind] ?? r.kind.toLowerCase()}</Td>
                  <Td>
                    <StatusPill tone={r.status === "COMPLETED" ? "success" : "neutral"}>{r.status === "COMPLETED" ? "done" : "declined"}</StatusPill>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {r.resolvedAt ? <Time value={r.resolvedAt} /> : null}
                    {r.resolvedById ? <span className="text-secondary"> by {resolvers.get(r.resolvedById)}</span> : null}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ) : null}
    </>
  );
}
