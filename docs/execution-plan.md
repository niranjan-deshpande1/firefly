# Execution plan v0

Draft, 2026-10-03. Built from [PRD v0](prd/PRD.md) and [technical design](technical-design.md). **No product code until both founders write APPROVED with a scope (constitution 2.2).** Milestone 0 is discovery, which can start now.

Assumes the technical design's recommendations: M4 (evidence capture) built for cohort 1, M9 (company view) run by hand in cohort 1 and built for cohort 2, stack A (Next.js, Vercel, Supabase). All three are founder decisions ([technical-design.md](technical-design.md) section 11). If you pick differently, Track A's tasks change and Track B's don't.

Estimates show human time / time with Claude Code and gstack (illustrative).

## Milestones

| # | Milestone | Owner | Exit | Target (illustrative) |
|---|---|---|---|---|
| M0 | Discovery calls | Both | 12 startup and 10 candidate calls scored against H1 to H10. H1, H3 and H9 pass the PRD gate. | Weeks 1 to 2 |
| M1 | Founder review (Phase 5) | Both | APPROVED with a scope | End of week 2 |
| M2 | Foundations | A | App deploys to preview. Schema and isolation tests pass in CI. | Week 3 |
| M3 | Evidence capture (M4) | A | Real App install on a test repo logs pushes and takes a deadline snapshot. Failure paths tested. | Week 4 |
| M4 | Pilot kit | B | Brief, handbook, rubric, defense script, bug menu, forms, tracker and email templates ready. Legal docs out to a lawyer. | Weeks 3 to 4 |
| M5 | Dry run (PRD M12) | Both | 2 volunteers end to end. Timings, reviewer agreement and the consented clip captured. Fixes logged. | Week 5 |
| M6 | Cohort 1 live | Both | Kickoff go/no-go passes: 3 or more partners signed, 40 or more accepted | Week 6 onward (5 weeks long) |
| M7 | Company view software (M9) | A | Isolation, approval and view-log tests pass. Ships with dry-run data for the pitch, and real data in cohort 2. | After M3, before cohort 2 |

## Ownership: two tracks, no shared files

| Track | Founder | Owns these paths | Never edits |
|---|---|---|---|
| **A: Platform** | Founder A (nd) | `app/`, `lib/`, `supabase/`, `jobs/`, `tests/`, `package.json`, lockfile, `.github/workflows/`, `docs/decisions/`, `docs/technical-design.md` | `docs/ops/`, `docs/discovery/` |
| **B: Pilot operations** | Founder B | `docs/ops/` (new), `docs/discovery/`, `docs/prd/flows.md` | Anything Track A owns |
| Shared through PRs | Driver named per change | `docs/prd/PRD.md` (driver: A), `docs/project-state.md` (whoever closes a milestone), `docs/constitution.md` and `CLAUDE.md` (both approve) | |

**Rule:** if a track needs a change in the other track's files, it opens an issue and the owner makes the change. Schema changes that B needs (for example, a new tracker column) go through A, because sheet columns mirror table names (technical design section 2).

**Public repo:** `docs/ops/` holds templates and drafts only. Filled-in trackers, call notes with names, and real candidate data live in the founders' Google Workspace.

## Track A: Platform

| ID | Task | Est. | Depends on | gstack |
|---|---|---|---|---|
| A1 | Scaffold the Next.js app on Vercel and the Supabase project. Env vars only, no secrets in the repo. Sentry. | 1 d / 1 h | M1, founder decision 2 and 3 | /review, /cso |
| A2 | Schema and migrations for the cohort 1 app tables: `cohort`, `enrollment` (id and status), `repo_link`, `push_event`, `snapshot`, `audit_log` (append-only) | 1 d / 1 h | A1 | /review |
| A3 | Founder-only admin auth (Supabase Auth with allow-listed emails). RLS on every table. | 0.5 d / 30 min | A2 | /review, /cso |
| A4 | CI: lint, types, RLS tests against local Supabase, webhook tests | 0.5 d / 30 min | A2 | /review |
| A5 | Register the GitHub App (Contents and Metadata read-only, push webhook). Install flow so a candidate picks one repo. Store the installation. | 1 d / 1 h | A3 | /review, /cso |
| A6 | Webhook endpoint: verify the signature, dedupe on delivery id, respond in under 10 s, record our-clock `received_at`, flag force pushes and late pushes | 1 d / 1 h | A5 | /review, /cso |
| A7 | Hourly redelivery job for failed deliveries, plus a nightly Events API backfill (answer TQ1 first) | 1 d / 1 h | A6 | /review |
| A8 | Deadline snapshot job: head SHA, tarball to private storage, sha256, size cap (TQ2), status. Never unpack or run the code. | 1 d / 1 h | A6 | /review, /cso |
| A9 | Revocation alert and fallback flow. App uninstalls itself after defenses. | 0.5 d / 30 min | A5 | /review |
| A10 | Daily founder digest email: pushes, redeliveries, no push in 3 days, snapshot status | 0.5 d / 30 min | A6 to A8 | /review |
| A11 | Retention and deletion job for app tables (periods pending a lawyer, TQ4) | 0.5 d / 30 min | A2 | /review, /cso |
| A12 | Admin page: cohort status, repo links, push timeline per candidate, snapshot links | 1 d / 1 h | A6, A8 | /review, /qa |
| A13 | Spike: confirm TQ1 (Events API on private repos) and TQ6 (Codespaces billing in a free org). Throwaway code, marked as a spike. | 0.5 d / 30 min | None; allowed before APPROVED | none |
| A14 | M9 company view: `company_user`, `shortlist_entry`, `report`, `consent_record` tables; RLS by company; a report-read function that logs first; candidate approval and withdrawal; no download; watermark | 3 d / 3 h | A3, lawyer answer on Q4 | /review, /cso, /qa |
| A15 | Pitch build of A14 with dry-run data only | 0.5 d / 30 min | A14, M5 | /qa |

Opening PRs: `/ship` opens a PR and Founder B approves before merge. **Never `/ship` or deploy to production before APPROVED.** The first production deploy also needs a founder yes (constitution 12).

## Track B: Pilot operations (by hand)

| ID | Task | Est. | Depends on | gstack |
|---|---|---|---|---|
| B1 | Run and score the discovery calls (M0) using [interview-guides.md](discovery/interview-guides.md). Notes with IDs only, kept outside the repo. | 2 wk part-time | None | none |
| B2 | Write the synthetic brief with an open product choice, sized so a level-3 result fits in about 20 hours | 1 d / 2 h | M1 | /review (docs PR) |
| B3 | Candidate handbook: rules, rubric v0, timeline, what candidates get (from flows section 4.2; founders approve the wording) | 1 d / 2 h | B2 | /review |
| B4 | Defense script for both modes (co-interview and company-run), with the scorecard form spec | 0.5 d / 1 h | B3 | /review |
| B5 | Bug menu, sandbox prep runbook and a fresh-task bank (paid contract engineer, PRD Q1) | 2 d contractor | M1, Q1 | none |
| B6 | Tracker and review-sheet templates, with column names matching the technical design's data model | 0.5 d / 1 h | A2 schema names | none |
| B7 | Forms: application with versioned consent, company intake, check-ins, submission, scorecard | 1 d / 2 h | B3 | none |
| B8 | Email templates: accept, day-3 ping, day-8 feedback, receipt, status, results, not-shortlisted | 0.5 d / 1 h | B3 | none |
| B9 | Company agreement, consent texts and code license terms drafted for lawyer review (legal F1 to F5) | 1 d / 2 h, plus lawyer | M1 | none |
| B10 | Manual M9 kit: per-company doc template (six scores, no total), candidate approval email, view-log check (TQ3) | 0.5 d / 1 h | B9 | none |
| B11 | City, venue, interview week logistics, loaner laptop | 1 d | Q2 | none |
| B12 | Recruit candidates: cohort page and outreach. Recruit design partners: signed agreements (M2). | 2 wk part-time | B3, B9 | none |
| B13 | Run the dry run with Track A (M5) and write up the fixes | 1 d | A8, B2 to B8 | none |

## Testing strategy

From [technical-design.md](technical-design.md) section 8:
1. RLS isolation tests on every deploy.
2. Webhook tests: bad signature, duplicate delivery, late push.
3. Snapshot test against a fixture repo.
4. One Playwright smoke test of each UI page at 375 px and 1440 px.
5. The dry run (M5) is the end-to-end test of both tracks.

Run `/cso` on anything that touches candidate data or the webhook.

## Deployment

- A Vercel preview for every PR.
- Production only after APPROVED and a founder yes on the first deploy.
- The GitHub App points at production only from cohort 1 kickoff onward. Before that it uses a test App.
- Rollback: redeploy the previous Vercel build. Migrations are additive only during a cohort.

## Runbooks to write in `docs/ops/` (Track B)

Kickoff day, day-8 feedback, deadline night (snapshot check), bug-planting prep, interview day, results day, deletion request.

## If time runs short, cut in this order

1. A15 (pitch build of the company view). Show the manual doc version in the pitch instead.
2. A12 admin page. Read the database directly.
3. A10 digest. Check Sentry and the database daily instead.
4. Last resort: run M4 by hand (read-only collaborator plus a deadline clone). Commit dates then stay self-reported.
