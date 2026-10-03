"use client";

import { Button, Field, Input, Textarea } from "@/components/ui";
import { postCheckIn } from "@/lib/participation/actions";
import { FormError, useFormAction } from "./use-form-action";

type Props = { hackathonId: string; week: number; weekPrompt?: string };

// Fixed prompts, one per CheckIn field. The wording never changes between weeks (manual 7.14).
const PROMPTS = [
  { name: "blockers", label: "what got in your way?" },
  { name: "nextSteps", label: "what will you make next?" },
  { name: "aiUsage", label: "how did you use AI tools this week?" },
] as const;

/** Check-in composer (manual 7.14): form group plus textareas, private audience sentence. */
export function CheckInComposer({ hackathonId, week, weekPrompt }: Props) {
  const { pending, formRef, onSubmit, fieldError, formError } = useFormAction(postCheckIn);

  return (
    <form ref={formRef} onSubmit={onSubmit} aria-labelledby="composer-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="composer-title" className="type-display-4">
          week {week} check-in
        </h2>
        <p className="type-body-s text-secondary measure">your reviewers and the firefly team read check-ins. other builders don&apos;t.</p>
      </div>
      <input type="hidden" name="hackathonId" value={hackathonId} />
      <input type="hidden" name="week" value={week} />

      <Field label="what did you make this week?" hint={weekPrompt || undefined} error={fieldError("progress")} required>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} name="progress" rows={5} maxLength={5000} required aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      </Field>

      {PROMPTS.map((p) => (
        <Field key={p.name} label={p.label} error={fieldError(p.name)}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} name={p.name} rows={3} maxLength={2000} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
      ))}

      <Field label="about how many hours did you put in?" error={fieldError("hoursSpent")}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} className="max-w-32" name="hoursSpent" type="number" inputMode="numeric" min={0} max={168} step={1} aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      </Field>

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="primary" loading={pending} loadingLabel="posting check-in">
          post check-in
        </Button>
        <FormError message={formError} />
      </div>
    </form>
  );
}
