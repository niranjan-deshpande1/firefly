"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { useToast } from "@/components/ui";
import type { ActionState } from "@/lib/participation/actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Runs a server action from a form without React's automatic reset, so a failed post keeps
 * the builder's draft. On success it clears the form and shows the action's one-line toast.
 */
export function useFormAction(action: Action) {
  const toast = useToast();
  // The toast fires here rather than in an effect: a successful post often re-renders the page
  // without this form (check-in posted, team created), and an unmounted form's effect never runs.
  const [state, run, pending] = useActionState(async (prev: ActionState, data: FormData) => {
    const next = await action(prev, data);
    if (next?.ok && next.message) toast(next.message);
    return next;
  }, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The submitter carries name/value when a form has more than one submit button.
    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => run(data));
  };

  const fieldError = (field: string) => (state && !state.ok && state.field === field ? state.error : undefined);
  const formError = state && !state.ok && !state.field ? state.error : undefined;

  return { pending, formRef, onSubmit, fieldError, formError };
}

/** Form-level error: one sentence beside the action that caused it (manual 11.3). */
export function FormError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="type-body-s text-error">
      {message}
    </p>
  ) : null;
}
