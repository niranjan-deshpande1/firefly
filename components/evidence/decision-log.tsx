import { StatusPill, Time } from "@/components/ui";
import { evidenceAnchor, type DecisionItem } from "./types";

function Part({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-label text-secondary">{label}</dt>
      <dd className="type-body-s measure whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

/** Decisions in the order they were made. Text is builder-authored and shown as written. */
export function DecisionLog({ entries }: { entries: DecisionItem[] }) {
  if (entries.length === 0) {
    return <p className="type-body text-secondary measure">no decisions logged yet. read the check-ins below for how the work moved.</p>;
  }
  return (
    <ol className="flex flex-col">
      {entries.map((e) => (
        <li key={e.id} id={evidenceAnchor({ kind: "DECISION", id: e.id })} className="row flex flex-col gap-3 py-6 target:bg-raised-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="type-display-4 break-words">{e.title}</h3>
            {e.aiInvolved ? <StatusPill>AI involved</StatusPill> : null}
            <Time value={e.decidedAt} className="type-label text-secondary" />
          </div>
          <dl className="flex flex-col gap-3">
            <Part label="decision">{e.decision}</Part>
            <Part label="why">{e.reasoning}</Part>
            {e.alternatives ? <Part label="alternatives considered">{e.alternatives}</Part> : null}
            {e.aiInvolved && e.aiNote ? <Part label="what AI did">{e.aiNote}</Part> : null}
          </dl>
        </li>
      ))}
    </ol>
  );
}
