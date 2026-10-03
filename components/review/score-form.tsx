"use client";

import { useState, useTransition } from "react";
import { Button, Checkbox, Field, ScoreInput, StatusPill, Textarea, useToast } from "@/components/ui";
import { evidenceAnchor } from "@/components/evidence/types";
import type { EvidenceRef, ReviewKind } from "@/lib/db";
import { saveReview } from "@/lib/review/actions";
import type { ScoreDraft, ScoreProblems } from "@/lib/review/rules";

export type FormItem = { key: string; name: string; group: string; description: string; anchors: string[]; isGate: boolean };

type ScoreFormProps = {
  projectId: string;
  kind: ReviewKind;
  items: FormItem[];
  initial: ScoreDraft[];
  evidence: EvidenceRef[];
  readOnly: boolean;
};

const KIND_LABEL: Record<EvidenceRef["kind"], string> = {
  COMMIT: "commits",
  TRANSCRIPT: "transcripts",
  DECISION: "decision log",
  CHECKIN: "check-ins",
  INTERVIEW_NOTE: "interview notes",
};

const refKey = (r: Pick<EvidenceRef, "kind" | "id">) => `${r.kind}:${r.id}`;

/** One score per item, each with a level, a written rationale and (for rubric reviews) linked evidence. */
export function ScoreForm({ projectId, kind, items, initial, evidence, readOnly }: ScoreFormProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<"draft" | "post">("draft");
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<ScoreProblems>({});
  const [drafts, setDrafts] = useState<Record<string, ScoreDraft>>(() =>
    Object.fromEntries(items.map((i) => [i.key, initial.find((d) => d.key === i.key) ?? { key: i.key, score: null, rationale: "", evidenceRefs: [] }])),
  );
  const requireEvidence = kind === "RUBRIC";

  const update = (key: string, patch: Partial<ScoreDraft>) => setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const toggleRef = (key: string, ref: EvidenceRef, on: boolean) => {
    const current = drafts[key].evidenceRefs;
    update(key, { evidenceRefs: on ? [...current, ref] : current.filter((r) => refKey(r) !== refKey(ref)) });
  };

  const save = (next: "draft" | "post") => {
    setIntent(next);
    startTransition(async () => {
      const result = await saveReview({ projectId, kind, intent: next, scores: Object.values(drafts) });
      if (result.ok) {
        setError(null);
        setProblems({});
        toast(next === "post" ? "review posted" : "draft saved");
      } else {
        setError(result.error);
        setProblems(result.problems ?? {});
      }
    });
  };

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        save("post");
      }}
    >
      {items.map((item, index) => {
        const d = drafts[item.key];
        const problem = problems[item.key];
        const showGroup = index === 0 || items[index - 1].group !== item.group;
        return (
          <div key={item.key} className="flex flex-col gap-4">
            {showGroup ? <h2 className="type-eyebrow text-secondary">{item.group}</h2> : null}
            <fieldset className="flex flex-col gap-4 border-t border-line pt-4" aria-describedby={problem ? `problem-${item.key}` : undefined}>
              <legend className="sr-only">{item.name}</legend>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="type-display-4">{item.name}</h3>
                {item.isGate ? <StatusPill tone="warning">gate</StatusPill> : null}
              </div>
              <p className="type-body-s text-secondary measure">{item.description}</p>
              <ScoreInput
                name={`score-${item.key}`}
                label={`${item.name} level`}
                anchors={item.anchors}
                value={d.score ? String(d.score) : undefined}
                onValueChange={(v) => update(item.key, { score: Number(v) })}
                disabled={readOnly}
              />
              <Field label="rationale" required>
                {({ id, describedBy, invalid }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    rows={3}
                    value={d.rationale}
                    readOnly={readOnly}
                    onChange={(e) => update(item.key, { rationale: e.target.value })}
                  />
                )}
              </Field>
              <EvidencePicker
                itemKey={item.key}
                evidence={evidence}
                selected={d.evidenceRefs}
                required={requireEvidence}
                readOnly={readOnly}
                onToggle={(ref, on) => toggleRef(item.key, ref, on)}
              />
              {problem ? (
                <p id={`problem-${item.key}`} className="type-body-s text-error">
                  {problem}
                </p>
              ) : null}
            </fieldset>
          </div>
        );
      })}

      {readOnly ? null : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="type-body-s text-error">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" loading={pending && intent === "post"} loadingLabel="posting review" disabled={pending}>
              post review
            </Button>
            <Button type="button" variant="secondary" loading={pending && intent === "draft"} loadingLabel="saving draft" disabled={pending} onClick={() => save("draft")}>
              save draft
            </Button>
          </div>
          <p className="type-body-s text-secondary measure">a posted review can&apos;t be edited. every score needs a level, a rationale{requireEvidence ? " and at least one piece of evidence" : ""}.</p>
        </div>
      )}
    </form>
  );
}

type PickerProps = {
  itemKey: string;
  evidence: EvidenceRef[];
  selected: EvidenceRef[];
  required: boolean;
  readOnly: boolean;
  onToggle: (ref: EvidenceRef, on: boolean) => void;
};

function EvidencePicker({ itemKey, evidence, selected, required, readOnly, onToggle }: PickerProps) {
  const chosen = new Set(selected.map(refKey));
  const kinds = [...new Set(evidence.map((e) => e.kind))];
  return (
    <div className="flex flex-col gap-3">
      <p className="type-label">
        evidence{required ? <span className="text-secondary"> (required)</span> : null}
      </p>
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="linked evidence">
          {selected.map((r) => (
            <li key={refKey(r)}>
              <a className="chip" href={`#${evidenceAnchor(r)}`}>
                <span className="text-secondary">{KIND_LABEL[r.kind]}</span>
                <span>{r.label}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body-s text-secondary">no evidence linked yet.</p>
      )}
      {readOnly ? null : evidence.length === 0 ? (
        <p className="type-body-s text-secondary">this project has no evidence on file yet, note what you saw in the rationale.</p>
      ) : (
        <details className="rounded-control border border-line">
          <summary className="target flex cursor-pointer items-center px-3 type-button">link evidence</summary>
          <div className="flex flex-col gap-4 px-3 pb-3">
            {kinds.map((kind) => (
              <fieldset key={kind} className="flex flex-col gap-1">
                <legend className="type-eyebrow text-secondary pb-1">{KIND_LABEL[kind]}</legend>
                {evidence
                  .filter((e) => e.kind === kind)
                  .map((e) => {
                    const id = `ref-${itemKey}-${refKey(e)}`;
                    return (
                      <label key={id} htmlFor={id} className="flex min-h-11 items-center gap-3 type-body-s">
                        <Checkbox id={id} checked={chosen.has(refKey(e))} onCheckedChange={(v) => onToggle(e, v === true)} />
                        <span>{e.label}</span>
                      </label>
                    );
                  })}
              </fieldset>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
