---
name: save-gstack-output
description: Copy the newest gstack plan or design doc from ~/.gstack/projects into docs/designs/ so the other founder can see it. Use right after /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /autoplan, or /spec.
---

gstack saves its planning output on this machine, outside the repo. This skill copies it in.

1. Check the branch with `git branch --show-current`. If on `main`, create a branch first (`<initials>/<topic>`).
2. List recent gstack markdown files, newest first:
   `find ~/.gstack/projects -type f -name '*.md' -mtime -2 -exec ls -lt {} +`
   If nothing shows up, widen to `-mtime -7`. If still nothing, tell the founder and stop.
3. Pick the files that came from the skill just run. If more than one is plausible, show the list and ask which to save.
4. Copy each one to `docs/designs/YYYY-MM-DD-<initials>-<original-file-name>.md`, using today's date and the initials from `git config user.name`.
5. Add one line at the top of each copy: `Source: <gstack skill>, run by <founder name> on <date>. Input to planning; nothing here is a DECISION.` Don't change anything else in the file.
6. Scan the copy for names, emails, or phone numbers of people interviewed, and for secrets or keys. If you find any, stop and show the founder.
7. Stage and commit on the current branch: `Save <skill> output: <topic>`. Ask before pushing.
8. Tell the founder the file path and list any decisions or open questions in the output that should become GitHub issues. Ask before creating them.
