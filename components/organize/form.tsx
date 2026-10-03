"use client";

import { createContext, startTransition, useActionState, useContext, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Dialog, DialogClose, Field, Input, Select, Textarea, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/organize/schemas";
import { utcToZonedLocal, zonedLocalToUtc } from "@/lib/organize/time";

export type FormAction = (prev: ActionResult, form: FormData) => Promise<ActionResult>;

const INITIAL: ActionResult = { ok: true };
const ErrorsContext = createContext<Record<string, string>>({});

type FormShellProps = {
  action: FormAction;
  /** Names the object: "save schedule", "post update". */
  submitLabel: string;
  loadingLabel: string;
  hidden?: Record<string, string>;
  /** One cream primary per view; secondary otherwise. */
  primary?: boolean;
  /** Clear the fields after a successful save (add forms). */
  resetOnSuccess?: boolean;
  children: ReactNode;
};

/** A passage form: fields, adjacent errors, one save button naming the object, a toast naming the result. */
export function FormShell({ action, submitLabel, loadingLabel, hidden, primary = true, resetOnSuccess, children }: FormShellProps) {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: ActionResult, data: FormData) => {
    const result = await action(prev, data);
    if (result.ok && result.message) {
      toast(result.message);
      if (resetOnSuccess) formRef.current?.reset();
    }
    return result;
  }, INITIAL);

  // Submitting through a transition keeps typed values after an error (form actions reset fields otherwise).
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  const errors = state.ok ? {} : (state.fieldErrors ?? {});
  const formError = !state.ok && !state.fieldErrors ? state.error : null;

  return (
    <ErrorsContext.Provider value={errors}>
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        {Object.entries(hidden ?? {}).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {children}
        <div className="flex flex-col items-start gap-3">
          <Button type="submit" variant={primary ? "primary" : "secondary"} loading={pending} loadingLabel={loadingLabel}>
            {submitLabel}
          </Button>
          {formError ? (
            <p role="alert" className="type-body-s text-error">
              {formError}
            </p>
          ) : null}
        </div>
      </form>
    </ErrorsContext.Provider>
  );
}

export const useFieldError = (name: string) => useContext(ErrorsContext)[name];

type TextFieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  type?: "text" | "url" | "number";
  rows?: number;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
};

export function TextField({ name, label, hint, required, defaultValue, type = "text", rows, placeholder, inputMode }: TextFieldProps) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) =>
        rows ? (
          <Textarea
            id={id}
            name={name}
            rows={rows}
            defaultValue={defaultValue ?? ""}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={placeholder}
          />
        ) : (
          <Input
            id={id}
            name={name}
            type={type}
            inputMode={inputMode}
            defaultValue={defaultValue ?? ""}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={placeholder}
          />
        )
      }
    </Field>
  );
}

type SelectFieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  /** Adds a first empty option with this label. */
  placeholder?: string;
};

export function SelectField({ name, label, hint, required, defaultValue, options, placeholder }: SelectFieldProps) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {({ id, describedBy, invalid }) => (
        <Select id={id} name={name} defaultValue={defaultValue ?? ""} aria-invalid={invalid} aria-describedby={describedBy}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

export function FileField({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const error = useFieldError(name);
  return (
    <Field label={label} hint={hint} error={error} required>
      {({ id, describedBy, invalid }) => (
        <Input id={id} name={name} type="file" accept="image/png,image/jpeg,image/gif,image/webp" aria-invalid={invalid} aria-describedby={describedBy} />
      )}
    </Field>
  );
}

type ZonedField = { name: string; label: string; value?: string | null; required?: boolean; hint?: string };

/**
 * IANA zone picker plus datetime-local inputs read in that zone. Changing the zone keeps the same
 * instants and rewrites the wall times, so switching zones never moves an event.
 */
export function ZonedDateFields({ fields, zones, defaultZone }: { fields: ZonedField[]; zones: string[]; defaultZone: string }) {
  const [zone, setZone] = useState(defaultZone);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.value ? utcToZonedLocal(new Date(f.value), defaultZone) : ""])),
  );
  const zoneError = useFieldError("timeZone");
  const errors = useContext(ErrorsContext);

  function changeZone(next: string) {
    setValues((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([name, local]) => {
          const instant = local ? zonedLocalToUtc(local, zone) : null;
          return [name, instant ? utcToZonedLocal(instant, next) : local];
        }),
      ),
    );
    setZone(next);
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="timezone" hint="every time below is read in this zone and stored in UTC." error={zoneError} required>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="timeZone" value={zone} onChange={(e) => changeZone(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {fields.map((f) => (
        <Field key={f.name} label={f.label} hint={f.hint ?? `in ${zone}`} error={errors[f.name]} required={f.required}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name={f.name}
              type="datetime-local"
              value={values[f.name] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </Field>
      ))}
    </div>
  );
}

type ConfirmActionProps = {
  action: FormAction;
  hidden: Record<string, string>;
  /** Trigger and confirm label, e.g. "remove prize". */
  label: string;
  title: string;
  description: string;
};

/** Destructive action behind a confirmation dialog (never window.confirm). */
export function ConfirmAction({ action, hidden, label, title, description }: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const [state, formAction, pending] = useActionState(async (prev: ActionResult, data: FormData) => {
    const result = await action(prev, data);
    if (result.ok) {
      if (result.message) toast(result.message);
      setOpen(false);
    }
    return result;
  }, INITIAL);

  return (
    <Dialog
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="destructive">{label}</Button>}
    >
      <form action={formAction} className="flex flex-col gap-4">
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        {!state.ok ? (
          <p role="alert" className="type-body-s text-error">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="destructive" loading={pending} loadingLabel="removing">
            {label}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">keep it</Button>
          </DialogClose>
        </div>
      </form>
    </Dialog>
  );
}
