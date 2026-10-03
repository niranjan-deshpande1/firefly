"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Dialog, Field, Input, Textarea, useToast } from "@/components/ui";
import { refreshSummary, saveDecision, type DecisionFormState } from "@/lib/evidence/actions";
import type { DecisionItem } from "./types";

// Member-only and viewer controls for the evidence locker page. Not exported from the index; only the locker uses them.

/** Add or edit one decision log entry in a drawer. */
export function DecisionEditor({ projectId, entry, primary = false }: { projectId: string; entry?: DecisionItem; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const [aiInvolved, setAiInvolved] = useState(entry?.aiInvolved ?? false);
  const toast = useToast();
  const [state, action, pending] = useActionState<DecisionFormState, FormData>(async (prev, formData) => {
    const result = await saveDecision(prev, formData);
    if (result?.ok) {
      setOpen(false);
      toast(entry ? "decision saved" : "decision added");
    }
    return result;
  }, null);

  const err = (name: string) => state?.fieldErrors?.[name];
  return (
    <Dialog
      kind="drawer"
      open={open}
      onOpenChange={setOpen}
      title={entry ? "edit decision" : "add a decision"}
      description="what you decided, why, and what else you considered. reviewers read this next to your commits."
      trigger={
        <Button variant={primary ? "primary" : entry ? "ghost" : "secondary"}>{entry ? `edit ${entry.title.slice(0, 40)}` : "add a decision"}</Button>
      }
    >
      <form action={action} className="flex flex-col gap-6" noValidate>
        <input type="hidden" name="projectId" value={projectId} />
        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
        <Field label="title" required error={err("title")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="title" defaultValue={entry?.title} maxLength={140} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label="decision" required error={err("decision")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} name="decision" rows={3} defaultValue={entry?.decision} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label="why" required error={err("reasoning")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} name="reasoning" rows={4} defaultValue={entry?.reasoning} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
        <Field label="alternatives considered" error={err("alternatives")}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} name="alternatives" rows={3} defaultValue={entry?.alternatives ?? ""} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
        <label className="type-body-s flex items-center gap-3">
          <Checkbox name="aiInvolved" checked={aiInvolved} onCheckedChange={(v) => setAiInvolved(v === true)} />
          AI was involved in this decision
        </label>
        {aiInvolved ? (
          <Field label="what AI suggested and what you kept or changed" error={err("aiNote")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} name="aiNote" rows={3} defaultValue={entry?.aiNote ?? ""} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
        ) : null}
        {state?.error ? (
          <p role="alert" className="type-body-s text-error">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={pending} loadingLabel="saving decision">
          save decision
        </Button>
      </form>
    </Dialog>
  );
}

/** Upload a .txt or .md AI transcript (up to 2 MB) through the locker's route handler. */
export function TranscriptUpload({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  async function upload(form: HTMLFormElement) {
    setError(null);
    const res = await fetch(`/projects/${projectId}/evidence/transcripts`, { method: "POST", body: new FormData(form) }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res?.ok || !body?.ok) {
      setError(body?.error ?? "the upload stopped before it finished, retry the transcript.");
      return;
    }
    setOpen(false);
    toast("transcript uploaded");
    router.refresh();
  }

  return (
    <Dialog
      kind="drawer"
      open={open}
      onOpenChange={setOpen}
      title="upload an AI transcript"
      description="a .txt or .md export of one session, up to 2 MB. remove keys and personal chats first. it shows as plain text."
      trigger={<Button variant="secondary">upload a transcript</Button>}
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          startTransition(() => upload(form));
        }}
      >
        <Field label="title" required>
          {({ id, describedBy }) => <Input id={id} name="title" required maxLength={140} aria-describedby={describedBy} />}
        </Field>
        <Field label="tool" hint="for example Claude, ChatGPT or Cursor">
          {({ id, describedBy }) => <Input id={id} name="tool" maxLength={60} aria-describedby={describedBy} />}
        </Field>
        <Field label="file" required error={error ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="file" type="file" required accept=".txt,.md,.markdown,text/plain,text/markdown" aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
        <Button type="submit" variant="primary" loading={pending} loadingLabel="uploading transcript">
          upload transcript
        </Button>
      </form>
    </Dialog>
  );
}

/** Reads the public repo again (members only). Errors sit beside the button. */
export function RepoRefresh({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function refresh() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      }).catch(() => null);
      const body = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; commits?: number } | null;
      if (!res?.ok || !body?.ok) {
        setError(body?.error ?? "github could not be reached, the saved commits are still shown.");
        return;
      }
      toast(`repo read, ${body.commits} commits`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="secondary" onClick={refresh} loading={pending} loadingLabel="reading repo" aria-describedby={error ? `${projectId}-repo-error` : undefined}>
        read repo again
      </Button>
      {error ? (
        <p id={`${projectId}-repo-error`} className="type-body-s text-error measure">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Prepares a fresh summary when the server has an API key. */
export function SummaryRefresh({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="ghost"
        loading={pending}
        loadingLabel="preparing summary"
        aria-describedby={error ? `${projectId}-summary-error` : undefined}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await refreshSummary(projectId);
            if (result.ok) toast("summary prepared");
            else setError(result.error);
          })
        }
      >
        prepare a new summary
      </Button>
      {error ? (
        <p id={`${projectId}-summary-error`} className="type-body-s text-error measure">
          {error}
        </p>
      ) : null}
    </div>
  );
}
