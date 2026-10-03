# CLAUDE.md

@docs/constitution.md

## Writing rules (constitution 2.6)

These apply to every file, commit and message in this repo:

- Plain language. Use jargon only when needed, and define it.
- Lead with the answer or recommendation. Reasoning comes after.
- Never use em dashes.
- Never use the "not X, but Y" construction or its variants.
- Use tables for comparisons and numbered lists for steps.
- Label substantive claims (KNOWN, RESEARCHED, ASSUMPTION, HYPOTHESIS, RECOMMENDATION, DECISION, OPEN QUESTION).

## Repo basics

- Two founders work on separate branches. Never commit to `main`. Branch names are `<initials>/<topic>`.
- Project subagents live in `.claude/agents/`. Each one writes only its own files.
- **This repo is public.** Never commit names, emails, phone numbers or employers of people we interview, and never commit secrets.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit founder approval.
In QA mode, flag any code that doesn't match DESIGN.md.

@AGENTS.md
