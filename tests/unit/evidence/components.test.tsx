import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CommitTimeline, TranscriptViewer } from "@/components/evidence";

afterEach(cleanup);

const commit = {
  id: "c1",
  sha: "abcdef1234567",
  message: "add parser\n\nlong body",
  authorName: "Maya Chen",
  committedAt: new Date("2026-07-22T17:00:00Z"),
  additions: 12,
  deletions: 3,
  url: "https://github.com/example/repo/commit/abcdef1",
};

describe("CommitTimeline", () => {
  it("shows the author and links the commit when not blind", () => {
    render(<CommitTimeline commits={[commit]} />);
    expect(screen.getByText("Maya Chen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "abcdef1" })).toHaveAttribute("href", commit.url);
    expect(document.getElementById("evidence-commit-c1")).not.toBeNull();
  });

  it("masks author names and the GitHub link when blind", () => {
    render(<CommitTimeline commits={[commit]} blind />);
    expect(screen.queryByText("Maya Chen")).toBeNull();
    expect(screen.getByText("author hidden")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "abcdef1" })).toBeNull();
  });
});

describe("TranscriptViewer", () => {
  const transcript = {
    id: "t1",
    title: "parser session",
    tool: "Claude",
    content: "<img src=x onerror=alert(1)> first excerpt\n\nthe AI used a global lock, I changed it",
    uploadedAt: new Date("2026-07-22T17:00:00Z"),
  };

  it("renders untrusted content as text with an anchor per excerpt", () => {
    const { container } = render(<TranscriptViewer transcripts={[transcript]} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
    expect(document.getElementById("evidence-transcript-t1-2")).not.toBeNull();
  });

  it("filters excerpts by search", () => {
    render(<TranscriptViewer transcripts={[transcript]} />);
    fireEvent.change(screen.getByLabelText("search transcripts"), { target: { value: "global lock" } });
    expect(document.getElementById("evidence-transcript-t1-1")).toBeNull();
    expect(document.getElementById("evidence-transcript-t1-2")).not.toBeNull();
    expect(screen.getByText("1 excerpt matches")).toBeInTheDocument();
  });
});
