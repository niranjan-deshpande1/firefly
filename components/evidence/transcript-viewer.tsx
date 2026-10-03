import { evidenceAnchor, type TranscriptItem } from "./types";

// STUB (foundation). Transcript text is untrusted: render as plain text only.
export function TranscriptViewer({ transcripts }: { transcripts: TranscriptItem[] }) {
  if (transcripts.length === 0) return <p className="type-body text-secondary">no AI transcript uploaded yet.</p>;
  return (
    <div className="flex flex-col gap-6">
      {transcripts.map((t) => (
        <article key={t.id} id={evidenceAnchor({ kind: "TRANSCRIPT", id: t.id })} className="flex flex-col gap-2">
          <h3 className="type-display-4">{t.title}</h3>
          <pre className="card max-h-96 overflow-auto whitespace-pre-wrap type-body-s">{t.content}</pre>
        </article>
      ))}
    </div>
  );
}
