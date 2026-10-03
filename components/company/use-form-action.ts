"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { useToast } from "@/components/ui";
import type { FormState } from "@/lib/company/actions";

/**
 * useActionState without React's automatic form reset, so a failed save keeps what the person typed.
 * Shows the action's confirmation as a toast ("role saved").
 */
export function useFormAction<T>(action: (prev: FormState<T>, form: FormData) => Promise<FormState<T>>) {
  const [state, dispatch, pending] = useActionState(action, null);
  const toast = useToast();
  const shown = useRef<FormState<T>>(null);

  useEffect(() => {
    if (state && state !== shown.current && state.ok && state.message) toast(state.message);
    shown.current = state;
  }, [state, toast]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => dispatch(form));
  };
  const fields = state && !state.ok ? (state.fields ?? {}) : {};
  const error = state && !state.ok ? state.error : undefined;
  return { state, pending, onSubmit, fields, error };
}
