"use client";

import { useState, useTransition } from "react";
import { Button, Dialog, DialogClose, useToast } from "@/components/ui";
import { requestDeletion } from "@/lib/profiles/actions";

/** Destructive confirmation lives in a Dialog, never window.confirm (contracts 6). */
export function DeleteRequest() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    startTransition(async () => {
      const result = await requestDeletion();
      if (result.ok) {
        setOpen(false);
        toast("delete request sent");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="ask us to delete your data"
      description="an admin reviews the request and deletes your account, profile, projects, evidence and check-ins. we may keep invoices and the audit log where the law requires it."
      trigger={<Button variant="destructive">request deletion</Button>}
    >
      <div className="flex flex-col gap-4">
        {error ? <p id="delete-error" className="type-body-s text-error">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={confirm} loading={pending} loadingLabel="sending request" aria-describedby={error ? "delete-error" : undefined}>
            send delete request
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">keep my data</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
