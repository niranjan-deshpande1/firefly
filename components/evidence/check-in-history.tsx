import { Markdown, Time } from "@/components/ui";
import { evidenceAnchor, type CheckInItem } from "./types";

// STUB (foundation). The evidence builder replaces the body; the props are final.
export function CheckInHistory({ checkIns }: { checkIns: CheckInItem[] }) {
  if (checkIns.length === 0) return <p className="type-body text-secondary">no check-ins posted yet.</p>;
  return (
    <ol className="flex flex-col">
      {checkIns.map((c) => (
        <li key={c.id} id={evidenceAnchor({ kind: "CHECKIN", id: c.id })} className="row flex flex-col gap-2 py-4">
          <p className="type-label text-secondary">
            week {c.week} · <Time value={c.submittedAt} />
          </p>
          <Markdown>{c.progress}</Markdown>
        </li>
      ))}
    </ol>
  );
}
