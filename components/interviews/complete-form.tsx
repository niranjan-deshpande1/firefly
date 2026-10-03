"use client";

import { useState, useTransition } from "react";
import { Button, Field, Radio, RadioGroup, Textarea, useToast } from "@/components/ui";
import { completeInterview } from "@/lib/interviews/actions";

/** Close the interview with pass or fail. The server refuses until identity and every section are done. */
export function CompleteForm({ interviewId, missing }: { interviewId: string; missing: string[] }) {
  const toast = useToast();
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const complete = () =>
    startTransition(async () => {
      const result = await completeInterview({ interviewId, outcome: outcome as "PASS" | "FAIL", notes });
      if (!result.ok) return setError(result.error);
      setError(undefined);
      toast(outcome === "PASS" ? "interview passed, project verified" : "interview completed");
    });

  return (
    <div className="flex flex-col gap-6 measure">
      {missing.length > 0 ? (
        <p className="type-body text-secondary">still to score: {missing.join(", ")}.</p>
      ) : (
        <p className="type-body text-secondary">every section has a score. a pass marks the project verified.</p>
      )}
      <fieldset className="flex flex-col gap-3">
        <legend className="type-label pb-2">outcome (required)</legend>
        <RadioGroup value={outcome} onValueChange={setOutcome} className="flex flex-col gap-2" aria-label="outcome">
          {[
            ["PASS", "pass: the candidate built and understands this project"],
            ["FAIL", "fail: the defense did not show that"],
          ].map(([value, label]) => (
            <label key={value} className="flex min-h-11 items-center gap-3 type-body">
              <Radio value={value} />
              {label}
            </label>
          ))}
        </RadioGroup>
      </fieldset>
      <Field label="outcome notes" required hint="why the panel reached this outcome." error={error}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      </Field>
      <div>
        <Button variant="primary" onClick={complete} loading={pending} loadingLabel="completing interview">
          complete interview
        </Button>
      </div>
    </div>
  );
}
