"use client";

import { useState, useTransition } from "react";
import { Button, Field, Textarea, useToast } from "@/components/ui";
import { hideComment, postComment } from "@/lib/projects/actions";
import { LIMITS } from "@/lib/projects/schema";

export function CommentForm({ projectId }: { projectId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, start] = useTransition();
  const toast = useToast();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    start(async () => {
      const res = await postComment({ projectId, body });
      if (!res.ok) return setError(res.error);
      setBody("");
      toast("comment posted");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 measure">
      <Field label="add a comment" hint="plain text, seen by everyone who can open this project." error={error}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={LIMITS.comment}
            rows={3}
            required
          />
        )}
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="posting comment">
          post comment
        </Button>
      </div>
    </form>
  );
}

export function HideCommentButton({ commentId }: { commentId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        loading={pending}
        loadingLabel="hiding comment"
        onClick={() =>
          start(async () => {
            const res = await hideComment({ id: commentId });
            if (res.ok) toast("comment hidden");
            else setError(res.error);
          })
        }
      >
        hide comment
      </Button>
      {error ? (
        <p role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
