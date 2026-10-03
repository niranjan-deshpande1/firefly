"use client";

import { useId, useMemo, useState } from "react";
import { Input, Time } from "@/components/ui";
import { excerptId, highlightSegments, matchesQuery, splitExcerpts } from "@/lib/evidence/transcript";
import { evidenceAnchor, type TranscriptItem } from "./types";

/**
 * Transcript text is untrusted: it renders as plain text only, never as Markdown or HTML.
 * Each blank-line-separated excerpt has its own anchor so scores can link to the exact passage.
 */
export function TranscriptViewer({ transcripts }: { transcripts: TranscriptItem[] }) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const split = useMemo(() => transcripts.map((t) => ({ ...t, excerpts: splitExcerpts(t.content) })), [transcripts]);

  if (transcripts.length === 0) {
    return <p className="type-body text-secondary measure">no AI transcript uploaded yet. the decision log below says where AI was involved.</p>;
  }

  const matches = query.trim() ? split.reduce((n, t) => n + t.excerpts.filter((e) => matchesQuery(e, query)).length, 0) : null;

  return (
    <div className="flex flex-col gap-6">
      <search className="flex flex-col gap-2">
        <label htmlFor={searchId} className="type-label">
          search transcripts
        </label>
        <Input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        <p className="type-label text-secondary" aria-live="polite">
          {matches === null ? "" : matches === 1 ? "1 excerpt matches" : `${matches} excerpts match`}
        </p>
      </search>

      {split.map((t) => {
        const shown = t.excerpts.map((text, i) => ({ text, i })).filter((e) => matchesQuery(e.text, query));
        return (
          <article key={t.id} id={evidenceAnchor({ kind: "TRANSCRIPT", id: t.id })} aria-labelledby={`${t.id}-title`} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 id={`${t.id}-title`} className="type-display-4 break-words">
                {t.title}
              </h3>
              <p className="type-label text-secondary">
                {t.tool ? `${t.tool} · ` : ""}uploaded <Time value={t.uploadedAt} format="datetime" />
              </p>
            </div>
            {shown.length === 0 ? (
              <p className="type-body-s text-secondary">no excerpt in this transcript matches. clear the search to read all of it.</p>
            ) : (
              <ol className="card flex flex-col gap-0 p-0">
                {shown.map(({ text, i }) => {
                  const anchor = evidenceAnchor({ kind: "TRANSCRIPT", id: excerptId(t.id, i) });
                  return (
                    <li key={i} id={anchor} className="row flex flex-col gap-1 px-4 py-3 last:border-b-0 target:bg-raised-2">
                      <a href={`#${anchor}`} className="link type-label self-start">
                        excerpt {i + 1}
                      </a>
                      <p className="type-body-s whitespace-pre-wrap break-words">
                        {highlightSegments(text, query).map((s, k) =>
                          s.match ? (
                            <mark key={k} className="bg-raised-2 text-primary underline">
                              {s.text}
                            </mark>
                          ) : (
                            s.text
                          ),
                        )}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </article>
        );
      })}
    </div>
  );
}
