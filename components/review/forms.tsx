"use client";

import { useState, useTransition } from "react";
import { Button, Dialog, Field, Radio, RadioGroup, Select, Textarea, useToast } from "@/components/ui";
import { makeDecision, revealIdentity, saveCalibrationNote, writeFeedback, type ActionResult } from "@/lib/review/actions";

/** Runs an action, toasts the result line on success, keeps the error beside the form on failure. */
function useAction(done: string) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) =>
    start(async () => {
      const result = await fn();
      if (result.ok) {
        setError(null);
        toast(done);
        onOk?.();
      } else setError(result.error);
    });
  return { pending, error, run };
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="type-body-s text-error">
      {error}
    </p>
  ) : null;
}

export function RevealButton({ projectId }: { projectId: string }) {
  const { pending, error, run } = useAction("identity revealed");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Dialog
        title="reveal who this is"
        description="you'll see the candidate's name and profile. the reveal is written to the audit log."
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="secondary">reveal identity</Button>}
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" loading={pending} loadingLabel="revealing" onClick={() => run(() => revealIdentity({ projectId }), () => setOpen(false))}>
            reveal identity
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            keep blind
          </Button>
        </div>
      </Dialog>
      <ErrorLine error={error} />
    </div>
  );
}

const LEVELS = ["1", "2", "3", "4"];

export function CalibrationNoteForm({ projectId, itemKey, itemName, note, resolvedScore }: { projectId: string; itemKey: string; itemName: string; note?: string; resolvedScore?: number | null }) {
  const { pending, error, run } = useAction("reconciliation note saved");
  const [text, setText] = useState(note ?? "");
  const [level, setLevel] = useState(resolvedScore ? String(resolvedScore) : "");
  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveCalibrationNote({ projectId, key: itemKey, note: text, resolvedScore: level ? Number(level) : null }));
      }}
    >
      <Field label={`reconciliation note for ${itemName}`} required error={error ?? undefined}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={3} required aria-describedby={describedBy} aria-invalid={invalid} value={text} onChange={(e) => setText(e.target.value)} />
        )}
      </Field>
      <Field label="resolved level" hint="optional. leave empty when the reviewers keep their own levels.">
        {({ id, describedBy }) => (
          <Select id={id} aria-describedby={describedBy} value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">no resolved level</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                level {l}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="saving note">
          {note ? "update note" : "save note"}
        </Button>
      </div>
    </form>
  );
}

const OUTCOMES: { value: "ADVANCE" | "HOLD" | "REJECT"; label: string; hint: string }[] = [
  { value: "ADVANCE", label: "advance", hint: "adds the candidate to the shortlist of every role enrolled in this cohort." },
  { value: "HOLD", label: "hold", hint: "keeps the candidate in review for now." },
  { value: "REJECT", label: "don't advance", hint: "the candidate gets written feedback from you." },
];

export function DecisionForm({ projectId, blocker }: { projectId: string; blocker: string | null }) {
  const { pending, error, run } = useAction("decision recorded");
  const [outcome, setOutcome] = useState<string>("");
  const [reason, setReason] = useState("");
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!outcome) return;
        run(() => makeDecision({ projectId, outcome: outcome as "ADVANCE", reason }), () => setReason(""));
      }}
    >
      <fieldset className="flex flex-col gap-3" disabled={!!blocker}>
        <legend className="type-label pb-2">outcome <span className="text-secondary">(required)</span></legend>
        <RadioGroup value={outcome} onValueChange={setOutcome} aria-label="outcome" className="flex flex-col gap-2">
          {OUTCOMES.map((o) => (
            <label key={o.value} htmlFor={`outcome-${o.value}`} className="flex min-h-11 items-start gap-3">
              <Radio id={`outcome-${o.value}`} value={o.value} />
              <span className="flex flex-col gap-1">
                <span className="type-body">{o.label}</span>
                <span className="type-body-s text-secondary">{o.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>
      <Field label="reason" required error={error ?? undefined} hint="every decision needs a written reason. it is kept with the decision history.">
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={4} required disabled={!!blocker} aria-describedby={describedBy} aria-invalid={invalid} value={reason} onChange={(e) => setReason(e.target.value)} />
        )}
      </Field>
      {blocker ? <p className="type-body-s text-warning measure">{blocker}</p> : null}
      <div>
        <Button type="submit" variant="primary" disabled={!!blocker || !outcome} loading={pending} loadingLabel="recording decision">
          record decision
        </Button>
      </div>
    </form>
  );
}

export function FeedbackForm({ projectId, body }: { projectId: string; body?: string }) {
  const { pending, error, run } = useAction("feedback saved");
  const [text, setText] = useState(body ?? "");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => writeFeedback({ projectId, body: text }));
      }}
    >
      <Field label="written feedback" required error={error ?? undefined} hint="markdown. specific, kind, and about the work, never about the person.">
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={8} required aria-describedby={describedBy} aria-invalid={invalid} value={text} onChange={(e) => setText(e.target.value)} />
        )}
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="saving feedback">
          {body ? "update feedback" : "send feedback"}
        </Button>
      </div>
    </form>
  );
}
