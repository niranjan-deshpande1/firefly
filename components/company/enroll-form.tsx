"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button, Dialog, DialogClose, Radio, RadioGroup, TextLink } from "@/components/ui";
import { enrollAction, type EnrollResult } from "@/lib/company/actions";
import { formatCents } from "@/lib/billing/math";
import { useFormAction } from "./use-form-action";

type Cohort = { id: string; title: string; dates: string };

/** Enrollment passage: one decision (which cohort), a confirmation that states the fee, then the invoice. */
export function EnrollForm({ roleId, roleTitle, cohorts, feeCents }: { roleId: string; roleTitle: string; cohorts: Cohort[]; feeCents: number }) {
  const { state, pending, onSubmit, error, fields } = useFormAction<EnrollResult>(enrollAction);
  const [hackathonId, setHackathonId] = useState(cohorts[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fee = formatCents(feeCents);
  const chosen = cohorts.find((c) => c.id === hackathonId);

  if (state?.ok && state.data) {
    const { number, amountCents, nonRefundable, cohort } = state.data;
    return (
      <section aria-labelledby="enrolled" className="flex flex-col gap-4" role="status">
        <h2 id="enrolled" className="type-display-3">{roleTitle} is enrolled in {cohort}</h2>
        <p className="type-body measure">
          invoice {number} created, {formatCents(amountCents)}{nonRefundable ? ", non-refundable" : ""}.
        </p>
        <p className="type-body-s text-secondary measure">candidates who advance in this cohort will appear on the role&apos;s shortlist.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href={`/company/roles/${roleId}`}>open the role</Link>
          </Button>
          <TextLink href="/company/billing" className="target inline-flex items-center">view invoices</TextLink>
        </div>
      </section>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="roleId" value={roleId} />
      <input type="hidden" name="hackathonId" value={hackathonId} />
      <fieldset className="flex flex-col gap-4">
        <legend className="type-label mb-2">choose a hiring cohort</legend>
        <RadioGroup value={hackathonId} onValueChange={setHackathonId} className="flex flex-col gap-2" aria-describedby={fields.hackathonId ? "cohort-error" : undefined}>
          {cohorts.map((c) => (
            <label key={c.id} htmlFor={`cohort-${c.id}`} className="row flex cursor-pointer items-center gap-4 py-3">
              <Radio id={`cohort-${c.id}`} value={c.id} />
              <span className="flex flex-col gap-1">
                <span className="type-display-4">{c.title}</span>
                <span className="type-body-s text-secondary">{c.dates}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
        {fields.hackathonId ? <p id="cohort-error" className="type-body-s text-error">{fields.hackathonId}</p> : null}
      </fieldset>

      <p className="type-body-s text-secondary measure">the cohort fee is {fee} per role, charged when you enroll and non-refundable, even if no candidate advances.</p>

      {error ? <p role="alert" className="type-body-s text-error">{error}</p> : null}
      <div>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="confirm enrollment"
          description={`${roleTitle} joins ${chosen?.title ?? "this cohort"}.`}
          trigger={
            <Button variant="primary" disabled={!hackathonId}>
              enroll {roleTitle}
            </Button>
          }
        >
          <p className="type-body measure">{fee}, charged now, non-refundable.</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              loading={pending}
              loadingLabel="enrolling"
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              enroll and issue the {fee} invoice
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">keep browsing cohorts</Button>
            </DialogClose>
          </div>
        </Dialog>
      </div>
    </form>
  );
}
