"use client";

import { Button, Field, Select, Textarea } from "@/components/ui";
import { requestInterviewAction } from "@/lib/company/actions";
import { useFormAction } from "./use-form-action";

/** Asks the Firefly team to schedule an interview. Emails admins; nothing is scheduled automatically. */
export function InterviewRequestForm({ candidateId, roles, compact }: { candidateId: string; roles: { id: string; title: string }[]; compact?: boolean }) {
  const { state, pending, onSubmit, error, fields } = useFormAction(requestInterviewAction);
  if (state?.ok) return <p role="status" className="type-body-s">interview requested. the firefly team will schedule it and email you.</p>;
  if (roles.length === 0) return null;

  const aria = (describedBy: string | undefined, invalid: boolean) => ({ "aria-describedby": describedBy, "aria-invalid": invalid || undefined });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="candidateId" value={candidateId} />
      {roles.length === 1 ? (
        <input type="hidden" name="roleId" value={roles[0].id} />
      ) : (
        <Field label="for role" required error={fields.roleId}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} name="roleId" defaultValue={roles[0].id} {...aria(describedBy, invalid)}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </Select>
          )}
        </Field>
      )}
      {compact ? null : (
        <Field label="note for the firefly team" hint="times that work, or who should join." error={fields.message}>
          {({ id, describedBy, invalid }) => <Textarea id={id} name="message" rows={3} {...aria(describedBy, invalid)} />}
        </Field>
      )}
      {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="requesting interview">
          request interview
        </Button>
      </div>
    </form>
  );
}
