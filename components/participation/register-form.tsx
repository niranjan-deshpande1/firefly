"use client";

import { useId } from "react";
import { Button, Checkbox } from "@/components/ui";
import { registerForHackathon } from "@/lib/participation/actions";
import { FormError, useFormAction } from "./use-form-action";

type Props = { hackathonId: string; eligibility: string[]; teamsAllowed: boolean };

function CheckRow({ name, value, label }: { name: string; value: string; label: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} name={name} value={value} className="mt-1" />
      <label htmlFor={id} className="type-body measure pt-1">
        {label}
      </label>
    </div>
  );
}

/** Registration passage: confirm each eligibility statement, then one primary action. */
export function RegisterForm({ hackathonId, eligibility, teamsAllowed }: Props) {
  const { pending, formRef, onSubmit, fieldError, formError } = useFormAction(registerForHackathon);
  const eligibilityError = fieldError("eligibility");

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-8">
      <input type="hidden" name="hackathonId" value={hackathonId} />
      {eligibility.length > 0 ? (
        <fieldset className="flex flex-col gap-4" aria-describedby={eligibilityError ? "eligibility-error" : undefined}>
          <legend className="type-label mb-4">confirm that you meet each requirement (required)</legend>
          {eligibility.map((item, i) => (
            <CheckRow key={i} name="eligibility" value={String(i)} label={item} />
          ))}
          {eligibilityError ? (
            <p id="eligibility-error" className="type-body-s text-error">
              {eligibilityError}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {teamsAllowed ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="type-label mb-4">teams</legend>
          <CheckRow name="lookingForTeam" value="on" label="list me on the looking for teammates board" />
        </fieldset>
      ) : null}

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="primary" loading={pending} loadingLabel="registering">
          register
        </Button>
        <FormError message={formError} />
      </div>
    </form>
  );
}
