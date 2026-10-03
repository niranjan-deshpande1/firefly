"use client";

import { useActionState, useId } from "react";
import { Button, Radio, RadioGroup } from "@/components/ui";
import { chooseRole, recordConsent } from "@/lib/profiles/actions";
import { CONSENT_VERSION, type SelfServeRole } from "@/lib/profiles";

const ROLE_CHOICES: { value: SelfServeRole; label: string; hint: string }[] = [
  { value: "CANDIDATE", label: "i'm a builder", hint: "join hackathons, post projects and get seen by companies hiring through firefly." },
  { value: "COMPANY", label: "i'm on a company team", hint: "set up roles, enroll in a hiring cohort and meet the builders who advance." },
];

export function RoleForm({ next, current }: { next?: string; current: SelfServeRole }) {
  const [state, action, pending] = useActionState(chooseRole, null);
  const errorId = useId();
  const error = state && !state.ok ? state.error : undefined;
  return (
    <form action={action} className="flex flex-col gap-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <fieldset className="flex flex-col gap-4" aria-describedby={error ? errorId : undefined}>
        <legend className="type-label text-secondary pb-4">how will you use firefly</legend>
        <RadioGroup name="role" defaultValue={current} className="flex flex-col gap-4">
          {ROLE_CHOICES.map((choice) => (
            <label key={choice.value} className="flex cursor-pointer items-start gap-4 rounded-card bg-raised p-4 transition-state hover:bg-raised-2">
              <Radio value={choice.value} aria-describedby={`${errorId}-${choice.value}`} />
              <span className="flex flex-col gap-1">
                <span className="type-display-4">{choice.label}</span>
                <span id={`${errorId}-${choice.value}`} className="type-body-s text-secondary">{choice.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
        <p className="type-body-s text-secondary measure">organizer, reviewer and admin accounts are set up by a firefly admin.</p>
      </fieldset>
      {error ? <p id={errorId} className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving">continue</Button>
      </div>
    </form>
  );
}

export function ConsentForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(recordConsent, null);
  const error = state && !state.ok ? state.error : undefined;
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="version" value={CONSENT_VERSION} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving your agreement" aria-describedby={error ? "consent-error" : undefined}>
          agree and continue
        </Button>
      </div>
      {error ? <p id="consent-error" className="type-body-s text-error">{error}</p> : null}
    </form>
  );
}
