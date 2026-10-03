"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Dialog, DialogClose, Field, Input, Textarea } from "@/components/ui";
import { addMemberAction, createCompanyAction, removeMemberAction, updateCompanyAction } from "@/lib/company/actions";
import { useFormAction } from "./use-form-action";

type CompanyValues = { id: string; name: string; website: string | null; description: string | null; size: string | null; stage: string | null; location: string | null };

const aria = (describedBy: string | undefined, invalid: boolean) => ({ "aria-describedby": describedBy, "aria-invalid": invalid || undefined });

/** Create (onboarding) or edit (profile) the company. */
export function CompanyForm({ company }: { company?: CompanyValues }) {
  const router = useRouter();
  const { state, pending, onSubmit, error, fields } = useFormAction(company ? updateCompanyAction : createCompanyAction);
  useEffect(() => {
    if (state?.ok && !company) router.push("/company");
  }, [state, company, router]);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {company ? <input type="hidden" name="companyId" value={company.id} /> : null}
      <Field label="company name" required error={fields.name}>
        {({ id, describedBy, invalid }) => <Input id={id} name="name" defaultValue={company?.name} autoComplete="organization" {...aria(describedBy, invalid)} />}
      </Field>
      {company ? null : (
        <Field label="your title" hint="shown to your teammates, for example CTO." error={fields.title}>
          {({ id, describedBy, invalid }) => <Input id={id} name="title" autoComplete="organization-title" {...aria(describedBy, invalid)} />}
        </Field>
      )}
      <Field label="website" hint="starts with https://." error={fields.website}>
        {({ id, describedBy, invalid }) => <Input id={id} name="website" type="url" defaultValue={company?.website ?? ""} {...aria(describedBy, invalid)} />}
      </Field>
      <Field label="what you build" hint="2 or 3 sentences candidates will read." error={fields.description}>
        {({ id, describedBy, invalid }) => <Textarea id={id} name="description" rows={4} defaultValue={company?.description ?? ""} {...aria(describedBy, invalid)} />}
      </Field>
      <div className="grid gap-6 tablet:grid-cols-3">
        <Field label="team size" hint="for example 12." error={fields.size}>
          {({ id, describedBy, invalid }) => <Input id={id} name="size" defaultValue={company?.size ?? ""} {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="stage" hint="for example seed." error={fields.stage}>
          {({ id, describedBy, invalid }) => <Input id={id} name="stage" defaultValue={company?.stage ?? ""} {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="location" error={fields.location}>
          {({ id, describedBy, invalid }) => <Input id={id} name="location" defaultValue={company?.location ?? ""} {...aria(describedBy, invalid)} />}
        </Field>
      </div>
      {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="primary" loading={pending} loadingLabel={company ? "saving profile" : "creating company"}>
          {company ? "save profile" : "create company"}
        </Button>
      </div>
    </form>
  );
}

export function AddMemberForm({ companyId }: { companyId: string }) {
  const { pending, onSubmit, error, fields } = useFormAction(addMemberAction);
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="grid gap-4 tablet:grid-cols-2">
        <Field label="teammate's sign-in email" required error={fields.email}>
          {({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" autoComplete="off" {...aria(describedBy, invalid)} />}
        </Field>
        <Field label="their title" error={fields.title}>
          {({ id, describedBy, invalid }) => <Input id={id} name="title" {...aria(describedBy, invalid)} />}
        </Field>
      </div>
      {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="adding teammate">
          add teammate
        </Button>
      </div>
    </form>
  );
}

export function RemoveMemberButton({ companyId, memberId, name }: { companyId: string; memberId: string; name: string }) {
  const { pending, onSubmit, error } = useFormAction(removeMemberAction);
  return (
    <Dialog
      title={`remove ${name}`}
      description="they lose access to your roles, shortlists and reports at once. you can add them again later."
      trigger={
        <Button variant="destructive" aria-label={`remove ${name}`}>
          remove
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="memberId" value={memberId} />
        {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="destructive" loading={pending} loadingLabel="removing">
            remove {name}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">keep {name}</Button>
          </DialogClose>
        </div>
      </form>
    </Dialog>
  );
}
