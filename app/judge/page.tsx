// Owner: evaluation builder. Archetype: collection (judging queue).
import NextLink from "next/link";
import { requireRole } from "@/lib/permissions";
import { judgingQueue } from "@/lib/review/queries";
import { EmptyState, PageHeader, StatusPill, TextLink } from "@/components/ui";

export const metadata = { title: "judging" };

export default async function JudgePage() {
  const user = await requireRole("REVIEWER");
  const rows = await judgingQueue(user);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="judging"
        title="projects to judge"
        description={<p>score each project against its hackathon&apos;s criteria with a written rationale. organizers pick the winners.</p>}
      />
      {rows.length === 0 ? (
        <EmptyState action={<TextLink href="/review">open your review queue</TextLink>}>
          you aren&apos;t judging any open hackathon right now. organizers assign judges from their console.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {rows.map((r) => (
            <li key={r.projectId}>
              <NextLink href={`/judge/${r.projectId}`} className="card flex h-full flex-col gap-3 p-4 transition-state hover:bg-raised-2">
                <span className="type-display-4">{r.title}</span>
                <span className="type-body-s text-secondary">{r.hackathon}</span>
                <span>
                  <StatusPill>your scores: {r.myStatus}</StatusPill>
                </span>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
