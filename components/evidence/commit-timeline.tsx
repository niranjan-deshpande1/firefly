import { TextLink, Time } from "@/components/ui";
import { DEFAULT_TIME_ZONE } from "@/lib/format/date";
import { commitsPerDay, dayLabel } from "@/lib/evidence/timeline";
import { CommitChart } from "./commit-chart";
import { evidenceAnchor, type CommitItem } from "./types";

function firstLine(message: string) {
  return message.split("\n")[0];
}

function CommitRow({ commit: c, blind }: { commit: CommitItem; blind: boolean }) {
  const sha = c.sha.slice(0, 7);
  return (
    <li id={evidenceAnchor({ kind: "COMMIT", id: c.id })} className="row flex flex-col gap-1 py-3 target:bg-raised-2">
      <span className="type-body-s break-words">{firstLine(c.message)}</span>
      <span className="type-label flex flex-wrap gap-x-3 gap-y-1 text-secondary">
        {/* The GitHub link names the account, so it is hidden while the review is blind. */}
        {c.url && !blind ? (
          <TextLink href={c.url} target="_blank" rel="noreferrer noopener">
            {sha}
          </TextLink>
        ) : (
          <span>{sha}</span>
        )}
        <span>{blind ? "author hidden" : c.authorName}</span>
        <span>
          <span className="text-success">+{c.additions}</span> <span className="text-error">−{c.deletions}</span>
          <span className="sr-only"> lines added and removed</span>
        </span>
        <Time value={c.committedAt} format="datetime" />
      </span>
    </li>
  );
}

/** Commits per day as a flat bar chart with a text list, then every commit. `blind` masks author names. */
export function CommitTimeline({ commits, blind = false }: { commits: CommitItem[]; blind?: boolean }) {
  if (commits.length === 0) {
    return <p className="type-body text-secondary measure">no commits recorded for this project yet. read the decision log below for how it was built.</p>;
  }
  const sorted = [...commits].sort((a, b) => b.committedAt.getTime() - a.committedAt.getTime());
  const days = commitsPerDay(sorted.map((c) => c.committedAt));

  return (
    <div className="flex flex-col gap-6">
      <figure className="flex flex-col gap-3">
        <CommitChart days={days} />
        <figcaption className="type-label text-secondary">
          {commits.length} {commits.length === 1 ? "commit" : "commits"}, {dayLabel(days[0].day)} to {dayLabel(days[days.length - 1].day)}, days in {DEFAULT_TIME_ZONE}
        </figcaption>
        <details className="type-body-s">
          <summary className="target type-label cursor-pointer text-secondary">read commits per day as text</summary>
          <ol className="flex flex-col pt-2">
            {days.map((d) => (
              <li key={d.day} className="type-label">
                {dayLabel(d.day)}: {d.count} {d.count === 1 ? "commit" : "commits"}
              </li>
            ))}
          </ol>
        </details>
      </figure>

      {/* ponytail: every commit renders so evidence links always resolve; GitHub fetches cap at 100. Paginate if seeds grow past that. */}
      <ol aria-label="commits, newest first" className="flex flex-col">
        {sorted.map((c) => (
          <CommitRow key={c.id} commit={c} blind={blind} />
        ))}
      </ol>
    </div>
  );
}
