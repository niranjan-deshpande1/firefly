"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { Button, useToast, type ButtonVariant } from "@/components/ui";
import type { ActionResult } from "@/lib/admin/actions";

type ActionButtonProps = {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  label: ReactNode;
  loadingLabel: string;
  variant?: ButtonVariant;
};

/** Runs one server action for one row; the result is a toast, an error sits beside the button. */
export function ActionButton({ action, id, label, loadingLabel, variant = "secondary" }: ActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const errorId = useId();

  const run = () =>
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        setError(null);
        toast(result.message);
      } else setError(result.error);
    });

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant={variant} loading={pending} loadingLabel={loadingLabel} onClick={run} aria-describedby={error ? errorId : undefined} className="whitespace-nowrap">
        {label}
      </Button>
      {error ? (
        <p id={errorId} role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
