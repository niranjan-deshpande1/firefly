import { Markdown, Time } from "@/components/ui";
import { evidenceAnchor, type CheckInItem } from "./types";

function Line({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="type-label text-secondary">{label}</dt>
      <dd className="type-body-s measure whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

/** Weekly check-ins, oldest first (stream). Progress is builder Markdown, rendered sanitized. */
export function CheckInHistory({ checkIns }: { checkIns: CheckInItem[] }) {
  if (checkIns.length === 0) {
    return <p className="type-body text-secondary measure">no check-ins posted yet. read the commit timeline above for how the work moved.</p>;
  }
  const sorted = [...checkIns].sort((a, b) => a.week - b.week || a.submittedAt.getTime() - b.submittedAt.getTime());
  return (
    <ol className="flex flex-col">
      {sorted.map((c) => (
        <li key={c.id} id={evidenceAnchor({ kind: "CHECKIN", id: c.id })} className="row flex flex-col gap-3 py-6 target:bg-raised-2">
          <h3 className="type-label flex flex-wrap gap-x-3">
            <span className="text-primary">week {c.week}</span>
            <span className="text-secondary">
              posted <Time value={c.submittedAt} format="datetime" />
            </span>
            {c.hoursSpent != null ? <span className="text-secondary">{c.hoursSpent} hours</span> : null}
          </h3>
          <Markdown className="measure">{c.progress}</Markdown>
          <dl className="flex flex-col gap-3">
            {c.blockers ? <Line label="blockers">{c.blockers}</Line> : null}
            {c.nextSteps ? <Line label="next steps">{c.nextSteps}</Line> : null}
            {c.aiUsage ? <Line label="how AI was used">{c.aiUsage}</Line> : null}
          </dl>
        </li>
      ))}
    </ol>
  );
}
