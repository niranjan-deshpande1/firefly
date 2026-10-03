"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Field, ScoreInput, StatusPill, Textarea, useToast } from "@/components/ui";
import { saveSectionScore } from "@/lib/interviews/actions";
import { formatElapsed } from "@/lib/interviews/rules";
import type { ScriptSection } from "@/lib/interviews/script";

const TICK = 1000;

type SectionCardProps = {
  interviewId: string;
  index: number;
  script: ScriptSection;
  locked: boolean;
  saved: { score: number; notes: string } | null;
};

/** One script section: prompts, an elapsed timer as text, and this interviewer's scorecard. */
export function SectionCard({ interviewId, index, script, locked, saved }: SectionCardProps) {
  const toast = useToast();
  const [score, setScore] = useState(saved ? String(saved.score) : "");
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [elapsed, setElapsed] = useState(0);
  const [runningSince, setRunningSince] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (runningSince === null) return;
    const timer = setInterval(() => setNow(Date.now()), TICK);
    return () => clearInterval(timer);
  }, [runningSince]);

  const shown = elapsed + (runningSince === null ? 0 : Math.max(0, now - runningSince));
  const toggleTimer = () => {
    if (runningSince === null) {
      const t = Date.now();
      setRunningSince(t);
      setNow(t);
    } else {
      setElapsed(shown);
      setRunningSince(null);
    }
  };

  const save = () =>
    startTransition(async () => {
      const result = await saveSectionScore({ interviewId, section: script.section, score: Number(score) || 0, notes });
      if (!result.ok) return setError(result.error);
      setError(undefined);
      toast(`${script.title} score saved`);
    });

  const headingId = `section-${script.section.toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6 border-t border-line py-8">
      <header className="flex flex-col gap-2 tablet:flex-row tablet:items-baseline tablet:justify-between">
        <h2 id={headingId} className="type-display-4">
          {index + 1}. {script.title}
        </h2>
        <p className="type-body-s text-secondary">
          planned {script.plannedMin} min · tests {script.tests}
        </p>
      </header>

      {locked ? (
        <p className="type-body text-secondary measure">locked until the identity check is done.</p>
      ) : (
        <>
          <ol className="flex list-decimal flex-col gap-2 ps-6 type-body measure">
            {script.prompts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-4">
            <p className="type-body" aria-live="off">
              elapsed <span className="type-button tabular-nums">{formatElapsed(shown)}</span>
            </p>
            <Button variant="ghost" onClick={toggleTimer}>
              {runningSince === null ? (shown > 0 ? "resume timer" : "start timer") : "pause timer"}
            </Button>
          </div>

          <div className="flex flex-col gap-4 measure">
            <ScoreInput name={`score-${script.section}`} label={`${script.title} score`} anchors={script.anchors} value={score} onValueChange={setScore} />
            <Field label="notes" required hint="what you saw that supports the score." error={error}>
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={save} loading={pending} loadingLabel="saving score">
                {saved ? "update score" : "save score"}
              </Button>
              {saved ? <StatusPill tone="success">scored {saved.score}</StatusPill> : null}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
