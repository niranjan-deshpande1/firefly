import { Time } from "@/components/ui";
import { evidenceAnchor, type CommitItem } from "./types";

// STUB (foundation). The evidence builder replaces the body; the props are final.
export function CommitTimeline({ commits, blind = false }: { commits: CommitItem[]; blind?: boolean }) {
  if (commits.length === 0) return <p className="type-body text-secondary">no commits recorded for this project yet.</p>;
  return (
    <ol className="flex flex-col">
      {commits.map((c) => (
        <li key={c.id} id={evidenceAnchor({ kind: "COMMIT", id: c.id })} className="row flex flex-col gap-1 py-3">
          <span className="type-body-s">{c.message}</span>
          <span className="type-label text-secondary">
            {c.sha.slice(0, 7)} · {blind ? "author hidden" : c.authorName} · <Time value={c.committedAt} format="datetime" />
          </span>
        </li>
      ))}
    </ol>
  );
}
