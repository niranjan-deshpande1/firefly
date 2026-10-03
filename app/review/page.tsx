// Owner: evaluation builder. Archetype: collection (review queue).
import NextLink from "next/link";
import { requireRole } from "@/lib/permissions";
import { reviewQueue, type QueueRow } from "@/lib/review/queries";
import { OUTCOME_LABEL } from "@/lib/review/rules";
import { EmptyState, PageHeader, StatusPill, TabLinks, TextLink } from "@/components/ui";

export const metadata = { title: "review queue" };

const FILTERS = [
  { value: "all", label: "all" },
  { value: "to-score", label: "to score" },
  { value: "calibration", label: "calibration" },
] as const;

const matches: Record<string, (r: QueueRow) => boolean> = {
  all: () => true,
  "to-score": (r) => r.myStatus !== "posted",
  calibration: (r) => r.needsCalibration,
};

export default async function ReviewQueuePage({ searchParams }: PageProps<"/review">) {
  const user = await requireRole("REVIEWER");
  const { show } = await searchParams;
  const filter = typeof show === "string" && show in matches ? show : "all";
  const rows = (await reviewQueue(user)).filter(matches[filter]);
  const href = (v: string) => (v === "all" ? "/review" : `/review?show=${v}`);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="review queue"
        title="your review queue"
        description={<p>projects assigned to you, shown by candidate code only. names appear after you post a review and choose to reveal them.</p>}
      />
      <TabLinks label="filter the queue" current={href(filter)} items={FILTERS.map((f) => ({ href: href(f.value), label: f.label }))} />

      {rows.length === 0 ? (
        filter === "all" ? (
          <EmptyState action={<TextLink href="/judge">open judging</TextLink>}>
            no projects are assigned to you yet. organizers assign two reviewers to every hiring-cohort project after the deadline.
          </EmptyState>
        ) : (
          <EmptyState action={<TextLink href="/review">show the whole queue</TextLink>}>nothing matches this filter right now.</EmptyState>
        )
      ) : (
        <ul className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {rows.map((r) => (
            <li key={r.projectId}>
              <NextLink
                href={r.needsCalibration && r.myStatus === "posted" ? `/review/calibration/${r.projectId}` : `/review/${r.projectId}`}
                className="card flex h-full flex-col gap-3 p-4 transition-state hover:bg-raised-2"
              >
                <span className="type-display-4">{r.label}</span>
                <span className="type-body-s text-secondary">{r.hackathon}</span>
                <span className="flex flex-wrap gap-2">
                  <StatusPill tone={r.myStatus === "posted" ? "success" : r.myStatus === "draft" ? "accent" : "neutral"}>your review: {r.myStatus}</StatusPill>
                  <StatusPill>{r.submittedCount} of 2 posted</StatusPill>
                  {r.needsCalibration ? <StatusPill tone="warning">calibration needed</StatusPill> : null}
                  {r.decision ? <StatusPill>decided: {OUTCOME_LABEL[r.decision] ?? r.decision}</StatusPill> : null}
                </span>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
