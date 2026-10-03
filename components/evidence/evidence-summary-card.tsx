import { Markdown, StatusPill } from "@/components/ui";
import type { SummaryItem } from "./types";

// STUB (foundation). The summary describes evidence for a person; it never scores or recommends.
export function EvidenceSummaryCard({ summary }: { summary: SummaryItem | null }) {
  return (
    <section aria-labelledby="evidence-summary" className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="evidence-summary" className="type-display-4">evidence summary</h2>
        {summary ? <StatusPill>{summary.seeded ? "prepared summary" : "AI summary"}</StatusPill> : null}
      </div>
      {summary ? <Markdown>{summary.content}</Markdown> : <p className="type-body-s text-secondary">no summary yet. read the evidence below.</p>}
    </section>
  );
}
