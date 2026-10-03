"use client";

import { useState, useTransition } from "react";
import { Button, Checkbox, useToast } from "@/components/ui";
import { confirmIdentity } from "@/lib/interviews/actions";

/** Step zero of the room: the interviewer confirms the photo ID matches the candidate. Nothing about the ID is stored. */
export function IdentityCheck({ interviewId, candidateName }: { interviewId: string; candidateName: string }) {
  const toast = useToast();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      if (!checked) return setError("the box is not ticked, look at the photo ID and tick it when the name matches.");
      const result = await confirmIdentity({ interviewId });
      if (!result.ok) return setError(result.error);
      toast("identity confirmed");
    });

  return (
    <div className="flex flex-col gap-4 measure">
      <p className="type-body">
        ask for a government photo ID. check that the face matches the person in the room and the name matches {candidateName}. we record only who
        checked and when, never a copy of the ID.
      </p>
      <label className="flex min-h-11 items-center gap-3 type-body">
        <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} aria-describedby={error ? "identity-error" : undefined} />
        the photo ID matches {candidateName}
      </label>
      {error ? (
        <p id="identity-error" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
      <div>
        <Button variant="primary" onClick={confirm} loading={pending} loadingLabel="confirming identity">
          confirm identity
        </Button>
      </div>
    </div>
  );
}
