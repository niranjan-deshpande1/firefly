"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { toggleLike } from "@/lib/projects/actions";

/** "like" / "liked" toggle. Never shows a count (DESIGN.md D5). */
export function LikeButton({ projectId, initialLiked }: { projectId: string; initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onClick() {
    const previous = liked;
    setLiked(!previous);
    setError(null);
    start(async () => {
      const res = await toggleLike({ id: projectId });
      if (!res.ok) {
        setLiked(previous);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" aria-pressed={liked} onClick={onClick} disabled={pending}>
        {liked ? "liked" : "like"}
      </Button>
      {error ? (
        <p role="alert" className="type-body-s text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
