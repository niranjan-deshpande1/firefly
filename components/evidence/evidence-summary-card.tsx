import { Markdown, StatusPill, Time } from "@/components/ui";
import type { SummaryItem } from "./types";

/** Describes the evidence for a person. It never scores, ranks or recommends, and carries no credit line. */
export function EvidenceSummaryCard({ summary }: { summary: SummaryItem | null }) {
  return (
    <section aria-labelledby="evidence-summary" className="card flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="evidence-summary" className="type-display-4">
          evidence summary
        </h2>
        {summary ? <StatusPill>{summary.seeded ? "prepared summary" : "generated summary"}</StatusPill> : null}
        {summary && !summary.seeded ? <Time value={summary.generatedAt} format="datetime" className="type-label text-secondary" /> : null}
      </div>
      {summary ? (
        <Markdown className="measure">{summary.content}</Markdown>
      ) : (
        <p className="type-body-s text-secondary measure">no summary yet. read the commits, transcripts and decisions below.</p>
      )}
      <p className="type-label text-secondary measure">a description of the evidence, written to save reading time. it does not score or recommend. check every claim against the evidence below.</p>
    </section>
  );
}
