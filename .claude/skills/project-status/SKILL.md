---
name: project-status
description: Rebuild docs/project-state.md from GitHub issues and the docs folder, then show it. Use when a founder says "status", at the end of each phase, or at the start of a working session.
---

GitHub Issues are the source of truth. `docs/project-state.md` is a snapshot of them.

1. Pull register items with the GitHub CLI, one call per label:
   `gh issue list --label <label> --state <state> --limit 200 --json number,title,state,labels,assignees,updatedAt`
   - `decision`: state `all`
   - `open-question`, `hypothesis`, `assumption`, `risk`, `tech-debt`: state `open`
   - `needs-approval`: state `open`
2. Work out the current phase from the highest `phase-N` label on open issues and from which phase documents exist in `docs/` (see the table in CLAUDE.md). If those disagree, say so.
3. List open pull requests with `gh pr list` and note which phase documents they touch.
4. Rewrite `docs/project-state.md` with these sections: Current phase (with exit criteria from constitution section 11 and what's still missing), Waiting on founders, Decisions, Open questions, Hypotheses, Assumptions, Risks, Tech debt, Open pull requests, Milestones and status. One line per item: `#number title (owner)`.
5. Set "Last rebuilt" to today's date and the founder's name from `git config user.name`.
6. Show the founder the "Current phase" and "Waiting on founders" sections in chat.
7. If the file changed and you're on a branch other than `main`, commit it as `Rebuild project state`. Ask before pushing.

If `gh` isn't authenticated, tell the founder to run `gh auth login` and stop.
