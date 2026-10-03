"use client";

import Link from "next/link";
import { Button, Field, Input, Select, TextLink } from "@/components/ui";
import { reportHireAction, type HireResult } from "@/lib/company/actions";
import { formatCents } from "@/lib/billing/math";
import { useFormAction } from "./use-form-action";

/** Report-a-hire passage. The fee is computed by lib/billing; this form only collects the facts. */
export function HireForm({ roleId, candidates, feePercent }: { roleId: string; candidates: { id: string; label: string }[]; feePercent: string }) {
  const { state, pending, onSubmit, error, fields } = useFormAction<HireResult>(reportHireAction);

  if (state?.ok && state.data) {
    const { number, amountCents, salaryCents, candidate } = state.data;
    return (
      <section aria-labelledby="hire-reported" className="flex flex-col gap-4" role="status">
        <h2 id="hire-reported" className="type-display-3">hire reported: {candidate}</h2>
        <p className="type-body measure">
          invoice {number} created, {formatCents(amountCents)}, {feePercent} of {formatCents(salaryCents)} first-year salary.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href="/company/billing">view invoices</Link>
          </Button>
          <TextLink href={`/company/roles/${roleId}`} className="target inline-flex items-center">back to the role</TextLink>
        </div>
      </section>
    );
  }

  const aria = (describedBy: string | undefined, invalid: boolean) => ({ "aria-describedby": describedBy, "aria-invalid": invalid || undefined });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="roleId" value={roleId} />
      <Field label="candidate" required hint="people on this role's shortlist." error={fields.candidateId}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="candidateId" defaultValue={candidates[0]?.id} {...aria(describedBy, invalid)}>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="first-year salary, in dollars" required hint="base salary from the signed offer, for example 140000." error={fields.salaryCents}>
        {({ id, describedBy, invalid }) => <Input id={id} name="salary" inputMode="numeric" autoComplete="off" {...aria(describedBy, invalid)} />}
      </Field>
      <Field label="start date" required error={fields.startDate}>
        {({ id, describedBy, invalid }) => <Input id={id} name="startDate" type="date" {...aria(describedBy, invalid)} />}
      </Field>
      <p className="type-body-s text-secondary measure">reporting a hire issues a hire-fee invoice of {feePercent} of the first-year salary.</p>
      {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="reporting hire">
          report hire
        </Button>
      </div>
    </form>
  );
}
