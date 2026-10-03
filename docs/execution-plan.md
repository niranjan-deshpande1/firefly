# Execution plan v0.2

Draft, 2026-10-03. Built from [PRD v0.2](prd/PRD.md) and [technical design v0.1](technical-design.md). **No product code until both founders write APPROVED with a scope (constitution 2.2).** Milestone 0 is discovery, which can start now.

**RECOMMENDATION:** cohort 1 runs with no custom software. Track A sets up the tools, runs the evidence and sandbox steps, and builds software only for cohort 2, only for whichever manual step cohort 1 shows is the bottleneck (technical design TQ5). This is founder decision 1 in [technical-design.md](technical-design.md) section 11.

Estimates show human time / time with Claude Code and gstack (illustrative).

## Milestones

| # | Milestone | Owner | Exit | Target (illustrative) |
|---|---|---|---|---|
| M0 | Discovery calls | Both | 12 startup and 10 candidate calls scored against H1 to H10, with the contact log. H1, H3 and H9 pass the PRD gate. | Weeks 1 to 2 |
| M1 | Founder review (Phase 5) | Both | APPROVED with a scope | End of week 2 |
| M2 | Tools and bug kit | A | Accounts set up (each sign-up approved), sheet tabs match technical design section 2, sandbox org with a spending limit, bug menu and fresh-task bank drafted | Week 3 |
| M3 | Pilot kit | B | Brief, handbook, rubric, defense script, forms, email templates ready. Legal docs out to a lawyer. | Weeks 3 to 4 |
| M4 | Dry run (PRD M12) | Both | 2 volunteers end to end, including one clone, one approval and one withdrawal. Timings, reviewer agreement and the consented clip captured. | Week 5 |
| M5 | Cohort 1 live | Both | Kickoff go/no-go passes: 3 or more partners signed, 40 or more accepted | Week 6 onward (5 weeks long) |
| M6 | Cohort 1 retro | Both | H5, H6, H11 scored. TQ5 answered: which manual step hurt most. | End of cohort 1 |
| M7 | Cohort 2 software (if M6 says so) | A | Needs its own APPROVED. Evidence capture or company view, per technical design 3.3. | Before cohort 2 |

## Ownership: two tracks, no shared files

| Track | Founder | Owns these paths | Never edits |
|---|---|---|---|
| **A: Platform and evidence** | Founder A (nd) | `docs/technical-design.md`, `docs/decisions/`, and later `app/`, `lib/`, `supabase/`, `tests/`, `package.json`, `.github/workflows/` | `docs/ops/`, `docs/discovery/` |
| **B: Pilot operations** | Founder B | `docs/ops/` (new), `docs/discovery/`, `docs/prd/flows.md` | Anything Track A owns |
| Shared through PRs | Driver named per change | `docs/prd/PRD.md` (driver: A), `docs/project-state.md` (whoever closes a milestone), `docs/constitution.md` and `CLAUDE.md` (both approve) | |

**Rule:** if a track needs a change in the other track's files, it opens an issue and the owner makes the change.

**Public repo:** `docs/ops/` holds templates and drafts only. Filled-in trackers, call notes with names, repo URLs, SHAs and real candidate data live in the founders' Google Workspace.

## Track A: Platform and evidence (cohort 1, by hand)

| ID | Task | Est. | Depends on | gstack |
|---|---|---|---|---|
| A1 | Set up Workspace, Tally, Cal.com, Dropbox Sign, Stripe (each sign-up approved by founders) | 0.5 d | M1 | none |
| A2 | Build the tracker sheet with the 10 tabs from technical design section 2 | 0.5 d / 1 h | A1 | none |
| A3 | Sandbox GitHub org: Codespaces billing, $25 spending limit, no org secrets. Answers TQ2. | 0.5 d | M1 | /cso (checklist) |
| A4 | Test Drive activity with a non-Workspace account. Answers TQ1. | 1 h | A1 | none |
| A5 | Evidence runbook (`docs/ops/` via Track B): access at acceptance, SHA on the form, clone and bundle at grace end, failure table | 0.5 d / 1 h | A2 | /review |
| A6 | Company-view runbook: report template, approval email, share settings, weekly view check, same-day unshare | 0.5 d / 1 h | A4, B9 | /review |
| A7 | Bug menu, fresh-task bank and sandbox prep runbook, written by the founders (PRD A2) | 2 d / 3 h | A3 | none |
| A8 | Retention calendar and deletion-request checklist (lawyer periods pending) | 2 h | B9 | none |
| A9 | Run the clone, bundle and SHA check on deadline night; plant one bug per finalist in a sandbox | during cohort | M5 | none |

**Cohort 2 only, after M6 and a new APPROVED:** build whichever of evidence capture or company view cohort 1 showed was the bottleneck, using the technical design 3.3 sketch. Isolation tests on every deploy. `/review` and `/cso` on every PR; `/qa` on UI. **Never `/ship` or deploy to production before APPROVED.** The first production deploy also needs a founder yes (constitution 12).

## Track B: Pilot operations (by hand)

| ID | Task | Est. | Depends on | gstack |
|---|---|---|---|---|
| B1 | Run and score the discovery calls (M0) using [interview-guides.md](discovery/interview-guides.md). Contact log and notes with IDs only, kept outside the repo. | 2 wk part-time | None | none |
| B2 | Write the synthetic brief with an open product choice, sized so a level-3 result fits in about 20 hours | 1 d / 2 h | M1 | /review (docs PR) |
| B3 | Candidate handbook: rules, rubric v0, timeline, what candidates get (founders approve the wording) | 1 d / 2 h | B2 | /review |
| B4 | One defense script (PRD section 6) for both modes (co-interview and company-run), with the scorecard form spec | 0.5 d / 1 h | B3 | /review |
| B5 | Below-cut blind comparison kit (PRD M13): anonymizing steps and a rating form | 2 h | B3 | none |
| B6 | Forms: application with versioned consent (covering M13), company intake, check-ins, submission with SHA, scorecard | 1 d / 2 h | B3, A2 | none |
| B7 | Email templates: accept, day-3 ping, day-8 feedback, receipt, status, results, not-shortlisted, report approval | 0.5 d / 1 h | B3 | none |
| B8 | Company agreement, consent texts and code license terms drafted for lawyer review (legal F1 to F5) | 1 d / 2 h, plus lawyer | M1, Q7 | none |
| B9 | City, venue, interview week logistics, loaner laptop | 1 d | Q2 | none |
| B10 | Recruit candidates (cohort page and outreach) and design partners (signed agreements, M2) | 2 wk part-time | B3, B8 | none |
| B11 | Run the dry run with Track A (M4) and write up the fixes | 1 d | A5, A6, B2 to B7 | none |

## Capacity check

PRD section 7 puts one cohort at about 83 founder hours, both founders combined (illustrative). If founders have less time than that, cut the shortlist to 6 before cutting anything below.

## Testing strategy

1. The dry run (M4) is the end-to-end test of every manual flow: application, check-ins, submission, clone and SHA check, review, defense, report approval, withdrawal.
2. TQ1 and TQ2 are tested in A3 and A4 before the dry run.
3. Cohort 2 software, if built: isolation tests on every deploy, failure-path tests from the technical design failure tables, one Playwright smoke test per page at 375 px and 1440 px.

## Runbooks to write in `docs/ops/` (Track B)

Kickoff day, day-8 feedback, deadline night (clone and SHA check), bug-planting prep, interview day, report approval and withdrawal, results day, deletion request.

## If time runs short, cut in this order

1. Shortlist from 8 to 6 (fewer defenses and bugs to plant).
2. Last resort: one partner company instead of 2 to 4 (the H3 fallback).
