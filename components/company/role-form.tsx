"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { saveRoleAction } from "@/lib/company/actions";
import { LEVEL_LABEL, REMOTE_LABEL, ROLE_STATUS_LABEL } from "@/lib/company/labels";
import { MAX_CRITERIA_ROWS } from "@/lib/company/schemas";
import { useFormAction } from "./use-form-action";

export type RoleFormValues = {
  id?: string;
  title: string;
  level: string;
  description: string;
  requiredSkills: string[];
  domainKnowledge: string | null;
  traits: string | null;
  numberOfHires: number;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  location: string | null;
  remote: string;
  status: string;
  criteria: { id: string; name: string; description: string; jobRelated: string }[];
};

const dollars = (cents: number | null) => (cents === null ? "" : String(cents / 100));

/** Role intake (passage). Criteria must be job-related; proxies such as "culture fit" are refused server-side. */
export function RoleForm({ companyId, role }: { companyId: string; role?: RoleFormValues }) {
  const router = useRouter();
  const { state, pending, onSubmit, fields, error } = useFormAction(saveRoleAction);
  const [rows, setRows] = useState(Math.max(1, role?.criteria.length ?? 0));

  useEffect(() => {
    if (state?.ok && state.data && !role) router.push(`/company/roles/${state.data.roleId}`);
  }, [state, role, router]);

  const aria = (describedBy: string | undefined, invalid: boolean) => ({ "aria-describedby": describedBy, "aria-invalid": invalid || undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <input type="hidden" name="companyId" value={companyId} />
      {role?.id ? <input type="hidden" name="roleId" value={role.id} /> : null}

      <fieldset className="flex flex-col gap-6">
        <legend className="type-display-4 mb-4">the role</legend>
        <Field label="role title" required error={fields.title}>
          {({ id, describedBy, invalid }) => <Input id={id} name="title" defaultValue={role?.title} required {...aria(describedBy, invalid)} />}
        </Field>
        <div className="grid gap-6 tablet:grid-cols-2">
          <Field label="level" required error={fields.level}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} name="level" defaultValue={role?.level ?? "MID"} {...aria(describedBy, invalid)}>
                {Object.entries(LEVEL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="number of hires" required error={fields.numberOfHires}>
            {({ id, describedBy, invalid }) => <Input id={id} name="numberOfHires" type="number" inputMode="numeric" min={1} max={50} defaultValue={role?.numberOfHires ?? 1} {...aria(describedBy, invalid)} />}
          </Field>
        </div>
        <Field label="description" required hint="what the person will build in the first 6 months, and with whom." error={fields.description}>
          {({ id, describedBy, invalid }) => <Textarea id={id} name="description" rows={6} defaultValue={role?.description} {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="required skills" required hint="separate with commas, for example TypeScript, Postgres, API design." error={fields.requiredSkills}>
          {({ id, describedBy, invalid }) => <Input id={id} name="requiredSkills" defaultValue={role?.requiredSkills.join(", ")} {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="domain knowledge" hint="what the person should already know about your field, if anything." error={fields.domainKnowledge}>
          {({ id, describedBy, invalid }) => <Textarea id={id} name="domainKnowledge" rows={3} defaultValue={role?.domainKnowledge ?? ""} {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="traits" hint="how the person works, described as behavior, for example writes down tradeoffs before building." error={fields.traits}>
          {({ id, describedBy, invalid }) => <Textarea id={id} name="traits" rows={3} defaultValue={role?.traits ?? ""} {...aria(describedBy, invalid)} />}
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="type-display-4 mb-4">pay and place</legend>
        <div className="grid gap-6 tablet:grid-cols-2">
          <Field label="salary from, in dollars" hint="first-year base salary." error={fields.salaryMinCents}>
            {({ id, describedBy, invalid }) => <Input id={id} name="salaryMin" inputMode="numeric" defaultValue={dollars(role?.salaryMinCents ?? null)} {...aria(describedBy, invalid)} />}
          </Field>
          <Field label="salary to, in dollars" error={fields.salaryMaxCents}>
            {({ id, describedBy, invalid }) => <Input id={id} name="salaryMax" inputMode="numeric" defaultValue={dollars(role?.salaryMaxCents ?? null)} {...aria(describedBy, invalid)} />}
          </Field>
          <Field label="location" hint="city, or leave empty for fully remote." error={fields.location}>
            {({ id, describedBy, invalid }) => <Input id={id} name="location" defaultValue={role?.location ?? ""} {...aria(describedBy, invalid)} />}
          </Field>
          <Field label="onsite, hybrid or remote" required error={fields.remote}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} name="remote" defaultValue={role?.remote ?? "HYBRID"} {...aria(describedBy, invalid)}>
                {Object.entries(REMOTE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            )}
          </Field>
          {role ? (
            <Field label="role status" error={fields.status}>
              {({ id, describedBy, invalid }) => (
                <Select id={id} name="status" defaultValue={role.status} {...aria(describedBy, invalid)}>
                  {Object.entries(ROLE_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              )}
            </Field>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="type-display-4 mb-4">company-specific criteria</legend>
        <div className="type-body-s text-secondary measure flex flex-col gap-2">
          <p>reviewers score these next to our rubric, with a written rationale and an evidence link for every score.</p>
          <p>each criterion must be about the work. say why it is job-related. criteria such as culture fit, age, background or personality are refused, because they stand in for protected traits.</p>
        </div>
        {fields.criteria ? <p className="type-body-s text-error">{fields.criteria}</p> : null}
        {Array.from({ length: rows }, (_, i) => {
          const c = role?.criteria[i];
          return (
            <div key={c?.id ?? `new-${i}`} className="card flex flex-col gap-4">
              <p className="type-label text-secondary">criterion {i + 1}</p>
              {c ? <input type="hidden" name={`criteria.${i}.id`} value={c.id} /> : null}
              <Field label="name" required error={fields[`criteria.${i}.name`]}>
                {({ id, describedBy, invalid }) => <Input id={id} name={`criteria.${i}.name`} defaultValue={c?.name} placeholder="API design" {...aria(describedBy, invalid)} />}
              </Field>
              <Field label="what good looks like" required error={fields[`criteria.${i}.description`]}>
                {({ id, describedBy, invalid }) => <Textarea id={id} name={`criteria.${i}.description`} rows={2} defaultValue={c?.description} {...aria(describedBy, invalid)} />}
              </Field>
              <Field label="why it is job-related" required hint="name the part of the job that needs it." error={fields[`criteria.${i}.jobRelated`]}>
                {({ id, describedBy, invalid }) => <Textarea id={id} name={`criteria.${i}.jobRelated`} rows={2} defaultValue={c?.jobRelated} {...aria(describedBy, invalid)} />}
              </Field>
              <p className="type-body-s text-secondary">to remove this criterion, clear all three fields and save.</p>
            </div>
          );
        })}
        {rows < MAX_CRITERIA_ROWS ? (
          <div>
            <Button variant="secondary" onClick={() => setRows((n) => n + 1)}>add a criterion</Button>
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-col items-start gap-3">
        {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving role">
          {role ? "save role" : "create role"}
        </Button>
      </div>
    </form>
  );
}
