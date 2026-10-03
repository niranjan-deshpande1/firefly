// Owner: interviews builder. Archetype: collection.
import Link from "next/link";
import { Button, EmptyState, PageHeader, StatusPill, Table, Td, TextLink, Th, Time, Tr } from "@/components/ui";
import { requireRole } from "@/lib/permissions";
import { listInterviews } from "@/lib/interviews/queries";
import { MODE_LABELS, MODEL_LABELS, OUTCOME_LABELS, STATUS_LABELS } from "@/lib/interviews/script";

export default async function InterviewsPage() {
  const user = await requireRole("REVIEWER", "COMPANY", "ORGANIZER");
  const interviews = await listInterviews(user);
  const canSchedule = user.role === "ORGANIZER" || user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="defense interviews"
        title="interviews"
        description={<p>{canSchedule ? "every interview in your cohorts." : "interviews where you sit on the panel."} times show their zone.</p>}
        actions={
          canSchedule ? (
            <Button variant="primary" asChild>
              <Link href="/interviews/new">schedule an interview</Link>
            </Button>
          ) : null
        }
      />

      {interviews.length === 0 ? (
        <EmptyState action={canSchedule ? <TextLink href="/interviews/new">schedule an interview</TextLink> : user.role === "COMPANY" ? <TextLink href="/company">open your shortlists</TextLink> : <TextLink href="/review">open your review queue</TextLink>}>
          {canSchedule ? "no interviews are scheduled yet. schedule one for an advanced candidate." : "no interviews are assigned to you yet. you'll see them here once an organizer adds you to a panel."}
        </EmptyState>
      ) : (
        <Table caption="defense interviews">
          <thead>
            <Tr>
              <Th>candidate</Th>
              <Th>time</Th>
              <Th>mode</Th>
              <Th>model</Th>
              <Th>status</Th>
            </Tr>
          </thead>
          <tbody>
            {interviews.map((i) => {
              const onPanel = user.role === "ADMIN" || i.interviewers.some((p) => p.userId === user.id);
              const name = i.candidate.name ?? "unnamed candidate";
              return (
                <Tr key={i.id}>
                  <Td>
                    <div className="flex flex-col gap-1">
                      {onPanel ? <TextLink href={`/interviews/${i.id}`}>{name}</TextLink> : <span>{name}</span>}
                      <span className="text-secondary">
                        {i.project.title}
                        {i.role ? `, ${i.role.title} at ${i.role.company.name}` : ""}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <Time value={i.scheduledAt} format="datetime" />
                    <span className="block text-secondary">{i.durationMin} min</span>
                  </Td>
                  <Td>{MODE_LABELS[i.mode as keyof typeof MODE_LABELS]}</Td>
                  <Td>{MODEL_LABELS[i.model as keyof typeof MODEL_LABELS]}</Td>
                  <Td>
                    <StatusPill tone={i.outcome === "PASS" ? "success" : i.outcome === "FAIL" ? "error" : "neutral"}>
                      {i.outcome ? OUTCOME_LABELS[i.outcome as keyof typeof OUTCOME_LABELS] : STATUS_LABELS[i.status as keyof typeof STATUS_LABELS]}
                    </StatusPill>
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
