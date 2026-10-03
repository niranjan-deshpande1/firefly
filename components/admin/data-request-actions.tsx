"use client";

import { useId, useState, useTransition } from "react";
import { Button, Dialog, DialogClose, useToast } from "@/components/ui";
import { resolveDataRequestAction } from "@/lib/admin/actions";

type Props = { id: string; kind: string; personName: string };

/** Resolve one open request. Deleting data is destructive, so it is confirmed in a dialog. */
export function DataRequestActions({ id, kind, personName }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const errorId = useId();

  const resolve = (outcome: "COMPLETED" | "REJECTED") =>
    startTransition(async () => {
      const result = await resolveDataRequestAction({ id, outcome });
      if (result.ok) {
        setError(null);
        setOpen(false);
        toast(result.message);
      } else setError(result.error);
    });

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {kind === "DELETE" ? (
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title={`delete ${personName}'s data`}
            description="this removes their profile, registrations, check-ins, projects with all evidence, reviews of those projects, interviews, shortlist entries and uploads. hires and invoices stay for billing, and the audit log keeps an anonymous entry. this can't be undone."
            trigger={<Button variant="destructive">delete account data</Button>}
          >
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" loading={pending} loadingLabel="deleting data" onClick={() => resolve("COMPLETED")} aria-describedby={error ? errorId : undefined}>
                delete {personName}&apos;s data
              </Button>
              <DialogClose asChild>
                <Button variant="ghost">keep the data</Button>
              </DialogClose>
            </div>
            {error ? (
              <p id={errorId} role="alert" className="type-body-s text-error">
                {error}
              </p>
            ) : null}
          </Dialog>
        ) : (
          <Button loading={pending} loadingLabel="marking done" onClick={() => resolve("COMPLETED")}>
            mark export done
          </Button>
        )}
        <Button variant="ghost" loading={pending} loadingLabel="declining" onClick={() => resolve("REJECTED")}>
          decline request
        </Button>
      </div>
      {error && !open ? (
        <p role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
