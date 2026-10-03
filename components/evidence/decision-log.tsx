import { StatusPill, Time } from "@/components/ui";
import { evidenceAnchor, type DecisionItem } from "./types";

// STUB (foundation). The evidence builder replaces the body; the props are final.
export function DecisionLog({ entries }: { entries: DecisionItem[] }) {
  if (entries.length === 0) return <p className="type-body text-secondary">no decisions logged yet.</p>;
  return (
    <ol className="flex flex-col">
      {entries.map((e) => (
        <li key={e.id} id={evidenceAnchor({ kind: "DECISION", id: e.id })} className="row flex flex-col gap-2 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="type-display-4">{e.title}</h3>
            {e.aiInvolved ? <StatusPill>AI involved</StatusPill> : null}
            <Time value={e.decidedAt} className="type-label text-secondary" />
          </div>
          <p className="type-body-s measure">{e.decision}</p>
          <p className="type-body-s text-secondary measure">{e.reasoning}</p>
        </li>
      ))}
    </ol>
  );
}
