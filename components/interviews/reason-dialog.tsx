"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Dialog, Field, Textarea, useToast } from "@/components/ui";
import { cancelInterview, declineInterviewRequest } from "@/lib/interviews/manage";

const COPY = {
  cancel: {
    trigger: "cancel interview",
    title: "cancel this interview",
    description: "the candidate and the panel get an email with your reason. a cancelled interview can't be reopened.",
    confirm: "cancel interview",
    loading: "cancelling interview",
    keep: "keep the interview",
    done: "interview cancelled",
  },
  decline: {
    trigger: "decline",
    title: "decline this request",
    description: "the company member who asked gets an email with your reason.",
    confirm: "decline request",
    loading: "declining request",
    keep: "keep the request",
    done: "request declined",
  },
} as const;

/** Destructive confirmation with a required reason: cancel an interview or decline a company request. */
export function ReasonDialog({ kind, id }: { kind: keyof typeof COPY; id: string }) {
  const copy = COPY[kind];
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = kind === "cancel" ? await cancelInterview({ interviewId: id, reason }) : await declineInterviewRequest({ requestId: id, reason });
      if (!result.ok) return setError(result.error);
      setOpen(false);
      toast(copy.done);
      router.refresh();
    });

  return (
    <Dialog open={open} onOpenChange={setOpen} title={copy.title} description={copy.description} trigger={<Button variant={kind === "cancel" ? "destructive" : "secondary"}>{copy.trigger}</Button>}>
      <Field label="reason" required hint="one or two sentences. it goes in the email and the audit log." error={error}>
        {({ id: fieldId, describedBy, invalid }) => (
          <Textarea id={fieldId} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button variant="destructive" onClick={confirm} loading={pending} loadingLabel={copy.loading}>
          {copy.confirm}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          {copy.keep}
        </Button>
      </div>
    </Dialog>
  );
}
