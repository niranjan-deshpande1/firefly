// Owner: interviews builder. Archetype: collection (company interview requests).
import { Button, EmptyState, PageHeader, StatusPill, Table, Td, TextLink, Th, Time, Tr } from "@/components/ui";
import { ReasonDialog } from "@/components/interviews/reason-dialog";
import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { listInterviewRequests } from "@/lib/interviews/queries";
import { REQUEST_STATUS_LABELS } from "@/lib/interviews/script";

export default async function InterviewRequestsPage() {
  // Organizers (scoped to candidates in hackathons they run) and admins. Each action re-checks `interview.manage`.
  const user = await requireRole("ORGANIZER");
  const requests = await listInterviewRequests(user);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="defense interviews"
        title="interview requests"
        description={<p>companies asking to interview a candidate. schedule the interview or decline with a reason.</p>}
      />

      {requests.length === 0 ? (
        <EmptyState action={<TextLink href="/interviews">return to your interviews</TextLink>}>no company has asked for an interview yet. requests show up here when they do.</EmptyState>
      ) : (
        <Table caption="interview requests from companies">
          <thead>
            <Tr>
              <Th>candidate</Th>
              <Th>company and role</Th>
              <Th>message</Th>
              <Th>asked</Th>
              <Th>status</Th>
            </Tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const params = new URLSearchParams({ requestId: r.id, roleId: r.role.id, ...(r.project ? { projectId: r.project.id } : {}) });
              return (
                <Tr key={r.id}>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <span>{r.candidate.name ?? `candidate ${r.candidate.candidateProfile?.blindCode ?? "hidden"}`}</span>
                      {r.project ? <span className="text-secondary">{r.project.title}</span> : null}
                    </div>
                  </Td>
                  <Td>
                    {r.role.title} <span className="block text-secondary">{r.company.name}</span>
                  </Td>
                  <Td className="measure">{r.message ?? <span className="text-secondary">no message</span>}</Td>
                  <Td>
                    <Time value={r.createdAt} format="date" />
                  </Td>
                  <Td>
                    {r.status === "PENDING" ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="secondary" asChild>
                          <Link href={`/interviews/new?${params}`}>schedule</Link>
                        </Button>
                        <ReasonDialog kind="decline" id={r.id} />
                      </div>
                    ) : (
                      <StatusPill tone={r.status === "SCHEDULED" ? "success" : "neutral"}>{REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS] ?? r.status}</StatusPill>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
