"use client";

import { useActionState, useEffect } from "react";
import { Button, Field, Input, useToast } from "@/components/ui";
import { saveSettingsAction, type ActionResult } from "@/lib/admin/actions";
import type { SettingsForm as Values } from "@/lib/admin/forms";

const FIELDS: { name: keyof Values; label: string; hint: string; inputMode: "decimal" | "numeric" }[] = [
  { name: "flatFee", label: "cohort fee in dollars", hint: "at least $1. charged per role at enrollment in a hiring cohort. always non-refundable.", inputMode: "decimal" },
  { name: "hireFeePercent", label: "hire fee as a percent of first-year salary", hint: "above 0, up to 50. applies to hires reported after you save.", inputMode: "decimal" },
  { name: "attributionWindowMonths", label: "attribution window in months", hint: "1 to 60. a hire counts if it starts within this many months of cohort end.", inputMode: "numeric" },
  { name: "retentionMonths", label: "data retention in months", hint: "1 to 120. process evidence is deleted this many months after a hackathon ends, except for hires.", inputMode: "numeric" },
];

export function SettingsForm({ values }: { values: Values }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(saveSettingsAction, null);
  const toast = useToast();
  useEffect(() => {
    if (state?.ok) toast(state.message);
  }, [state, toast]);
  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="measure flex flex-col gap-6" noValidate>
      {FIELDS.map((f) => (
        <Field key={f.name} label={f.label} hint={f.hint} error={errors[f.name]} required>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name={f.name} defaultValue={values[f.name]} inputMode={f.inputMode} required aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
      ))}
      {state && !state.ok ? (
        <p role="alert" className="type-body-s text-error">
          {state.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving settings">
          save settings
        </Button>
      </div>
    </form>
  );
}
