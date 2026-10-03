# Technical design: firefly MVP pilot

Draft v0, 2026-10-03. Owner: architect. Labels follow constitution 2.1. Built from [PRD](prd/PRD.md) (canonical), [flows](prd/flows.md), [verification](research/verification.md), [evaluation](research/evaluation.md), [legal flags](research/legal-flags.md). Nothing here is approved. Stack and vendors are founder decisions (constitution 12).

## Answer first

1. **RECOMMENDATION:** For cohort 1, build M4 (evidence capture) and keep M9 (company view) on its manual fallback. M4 is small, read-only, and its failure modes are recoverable. M9 carries the legal and trust risk (a report shown to the wrong company, or before the candidate approves it, legal F1), and at 15 finalists and 2 to 4 companies a founder can run it by hand. Build M9 for cohort 2, or earlier with dry-run data only for the pitch demo (PRD section 11). This answers PRD Q6 as a recommendation; the founders decide.
2. **RECOMMENDATION:** One Next.js app on Vercel, one Supabase project (Postgres, Auth, Storage). Postgres row-level security enforces per-company isolation. About $45 a month at pilot scale for the software part, about $92 a month pilot and $425 a month at 10x for everything (section 9).
3. **RECOMMENDATION:** Everything else stays on existing tools: Tally forms, Google Sheets tracker, Cal.com, Google Meet, Dropbox Sign, Stripe Invoicing, Resend. Candidate code runs only in disposable Codespaces in a separate GitHub org with no secrets.

## 1. What is software in cohort 1

| Area | Cohort 1 | Why | Moves to software when |
|---|---|---|---|
| Application, consent (M1) | Tally form, consent fields copied to tracker | PRD: Hand | Applications pass ~300 per cohort (ASSUMPTION) |
| Company agreement, intake (M2) | Dropbox Sign + Tally | PRD: Hand | Self-serve signup (Later) |
| Check-ins, submission (M5, M6) | Tally + chat server | PRD: Hand | Never needed at pilot scale |
| Evidence capture (M4) | **Software (RECOMMENDATION)** | Push times by our clock and a deadline snapshot can't be done reliably by hand for private repos | Already software |
| Artifact review (M7), defense scores (M8) | Google Sheets, founders only | Lets us measure reviewer agreement cheaply | Reviewers exceed ~4 or companies score in-app |
| Company view (M9) | **Manual fallback (RECOMMENDATION):** one access-limited doc per company, approval by email | Isolation by hand is easy at 2 to 4 companies | Cohort 2, or more than 4 companies |
| Funnel tracker (M11) | Google Sheets | Constitution 14 | Funnel events come from the app |
| Invoicing | Stripe Invoicing | Constitution 10 bans automated payments | Not planned |

## 2. Data model

**RECOMMENDATION.** One Postgres schema. "Where" says where each entity lives in cohort 1. "Sheet" means the founders' restricted Google Sheet, never this repo. If the founders choose the manual fallback for M4 too, every row below is a sheet column and the app has no tables.

| Entity | Key fields | Where (cohort 1) |
|---|---|---|
| `candidate` | id, name, email, github_user_id, city, years_exp, work_auth, accommodation_requested (yes/no only, details stay in email) | App (id, email, github_user_id) and Sheet (rest) |
| `company` | id, name, agreement_signed_at, flat_fee_status | Sheet |
| `company_user` | id, company_id, email, role (viewer, interviewer) | Sheet (app when M9 ships) |
| `role` | id, company_id, title, salary_min, salary_max, interview_mode (co-interview, company-run), criteria[] (job-related only), criteria_review_note | Sheet |
| `cohort` | id, city, brief_version, kickoff_at, deadline_at, grace_until, retention_until | App (deadline drives the snapshot job) |
| `enrollment` | id, candidate_id, cohort_id, status (applied, accepted, building, submitted, late, shortlisted, interviewed, offer, hired, withdrawn), status_changed_at | Sheet; app keeps id and status for M4 |
| `consent_record` | id, subject_type, subject_id, consent_type (terms, data, report-sharing, recording, standing-pool), text_version, given_at, method, withdrawn_at | Sheet (copied from Tally); app when M9 ships |
| `repo_link` | id, enrollment_id, installation_id, repo_id, repo_full_name, start_sha, connected_at, revoked_at | App |
| `push_event` | id, repo_link_id, delivery_id (unique), received_at (our clock), ref, before_sha, after_sha, forced, commit_count, commits (sha, author date as candidate-supplied), source (webhook, redelivery, events_api) | App |
| `snapshot` | id, repo_link_id, head_sha, taken_at, storage_path, sha256, bytes, status (ok, failed, no_access) | App + private storage bucket |
| `submission` | id, enrollment_id, submitted_at, demo_url, decisions_md_sha, hours_log, transcript_excerpt_paths | Sheet (from Tally) |
| `evaluation` | id, submission_id, reviewer, dimension (A to F), score (1 to 4), evidence_note, evidence_link, filed_at | Sheet |
| `interview` | id, enrollment_id, company_id, scheduled_at, mode, facilitator, id_checked (bool, never an image), recording_consented, sandbox_destroyed_at | Sheet |
| `interview_score` | id, interview_id, scorer, dimension, score, evidence_note, filed_at (before discussion) | Sheet (scorecard form) |
| `shortlist_entry` | id, company_id, enrollment_id, added_by, added_at | Sheet; the isolation key when M9 ships |
| `report` | id, enrollment_id, company_id, version, body (fixed template, six scores, evidence links, no total), status (draft, awaiting_candidate, approved, withdrawn), approved_at, approval_text_version | Doc per company; app when M9 ships |
| `company_note` | id, company_id, enrollment_id, author, body | Company's own doc; never in another company's view |
| `hire` | id, enrollment_id, company_id, role_id, first_year_salary, start_date, invoice_id, day90_checked_at | Sheet + Stripe |
| `audit_log` | id, at, actor_type, actor_id, action (view_report, approve, withdraw, export, delete, admin_read), target_type, target_id, company_id, ip, user_agent | App (append-only); Sheet tab plus Google Drive activity for the manual M9 |
| `deletion_request` | id, candidate_id, received_at, completed_at, kept_items (hiring record, with reason) | Sheet |

Rules (RECOMMENDATION):
- Scores are one row per dimension. No column or view holds a total.
- `report` rows are versioned. Approval points to one version; a new version needs a new approval.
- Retention tier is a property of the table: **hiring record** (consent_record, evaluation, interview_score, report, decisions, 4 years per legal F4) and **everything else** (12 months after cohort, recordings 90 days). A lawyer confirms both (PRD Q5).

**Upgrade path (RECOMMENDATION):** sheet columns use the same names as the table fields above, so moving to the app is a CSV import. Order: `report` + `shortlist_entry` + `company_user` + `consent_record` when M9 ships, then `evaluation` and `interview_score` when reviewers score in-app, then `enrollment` funnel events from the app.

## 3. Architecture

**RECOMMENDATION.** One deployable app, one database, one auth provider.

```
 Candidates            Company users            Founders (admin, MFA)
     |                      |                          |
     | GitHub OAuth          | email magic link          | GitHub or Google + MFA
     v                      v                          v
 +-----------------------------------------------------------------+
 |            Next.js app on Vercel (one deployment)               |
 |  /connect  install GitHub App      /c/[company] company view    |
 |  /api/github/webhook (HMAC check)  /admin  founders only        |
 |  /api/cron/snapshot  /api/cron/reconcile  /api/cron/retention   |
 +---------+-------------------+-------------------+---------------+
           |                   |                   |
           v                   v                   v
 +------------------+  +---------------+  +------------------------+
 | Supabase Postgres|  | Supabase Auth |  | Supabase Storage       |
 | RLS per company  |  | (JWT claims)  |  | private bucket:        |
 | audit_log append |  +---------------+  | snapshots/*.tar.gz     |
 +------------------+                     +------------------------+
           ^
           | push, installation, installation_repositories webhooks
 +------------------+        +----------------------------------+
 | GitHub (cand.    |        | Disposable Codespaces, separate  |
 | owned repos)     |------->| org, no secrets: bug planting,   |
 +------------------+ clone  | defense session. Never our app.  |
                             +----------------------------------+
 Outside the app: Tally, Google Sheets, Cal.com, Meet, Dropbox Sign,
 Stripe Invoicing, Resend (transactional email from the app).
```

### 3.1 M4 evidence capture flow

```
candidate -> /connect -> GitHub "Only select repositories" -> picks 1 repo
GitHub -> installation webhook -> app stores repo_link, start_sha (via API)
candidate pushes -> GitHub -> push webhook -> app:
   verify X-Hub-Signature-256 -> insert push_event(received_at = now(),
   delivery_id unique) -> return 200 (well under the 10 s limit)
deadline + grace -> cron /snapshot -> for each repo_link:
   GET head sha -> GET tarball -> stream to private bucket -> sha256 -> snapshot row
after defenses -> app deletes its own installation (DELETE /app/installations/{id})
```

GitHub App settings (RECOMMENDATION, checked against GitHub docs):
- Permissions: Repository **Contents: read** (needed for push events and tarballs) and **Metadata: read** (mandatory). Nothing else. No account or organization permissions.
- Events: `push`. `installation` and `installation_repositories` arrive automatically. RESEARCHED: push needs at least read on Contents; apps can't unsubscribe from the installation events ([webhook events](https://docs.github.com/en/webhooks/webhook-events-and-payloads), accessed 2026-10-03).
- Install target: "Only select repositories", one repo (RESEARCHED, verification.md 2.1).

Failure paths:

| Failure | What happens | Handling (RECOMMENDATION) |
|---|---|---|
| Webhook missed (app down, slow, deploy) | RESEARCHED: GitHub doesn't redeliver failed deliveries automatically and keeps them for redelivery for 3 days; a delivery fails past 10 s ([failed deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries), [redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks), accessed 2026-10-03) | Hourly `/reconcile` lists app deliveries, redelivers any not OK. Nightly backfill from the repo Events API (30 days, 300 events, verification.md 2.1). Redelivered and backfilled rows keep GitHub's original time and are labeled by `source`. |
| Payload too large | RESEARCHED: payloads over 25 MB are not delivered (same source) | Backfill catches the push; flag the repo for a look |
| Push after deadline | Stored with `received_at` past `grace_until` | Flagged late, never changes the snapshot. Shown to reviewers as a fact only. |
| Force-push or rewritten history | `forced: true`, commit dates disagree with receipt times | Kept as a defense question, never an auto-flag against the candidate |
| Candidate revokes the app before the deadline | `installation_repositories` removed or `installation` deleted | Set `revoked_at`, alert founders. Ask the candidate; fallback is read-only collaborator plus a manual clone (PRD M4 fallback). Data already logged stays under their consent. |
| Revokes after the deadline | Snapshot already stored | Nothing lost; delete on request per retention tiers |
| Snapshot fails (API error, repo deleted) | `snapshot.status = failed` | Retry 3 times over 30 min, then alert. The last known `after_sha` from push events still pins what is judged. |
| Repo is huge | Tarball over a cap (100 MB, ASSUMPTION) | Store head sha only; clone in a Codespace for the defense |

**Manual fallback if M4 isn't built (KNOWN, PRD M4):** read-only collaborator, an Events API script run from a founder's machine for push times (public repos only, ASSUMPTION for private), clone at the deadline into restricted Drive. Never commit the output to this repo.

### 3.2 M9 company view flow (cohort 2, or cohort 1 if founders choose)

```
founder drafts report v1 -> status awaiting_candidate -> email candidate
candidate signs in -> reads full report -> flags errors or clicks
   "approve sending to <Company>" -> approved_at, text_version, audit row
company user (magic link) -> /c/[company] -> RLS returns only rows where
   shortlist_entry.company_id = my company AND report.status = approved
open report -> get_report(id) function: insert audit_log, then return body
candidate withdraws -> report.status = withdrawn, consent withdrawn_at
   -> next request returns nothing (RLS), audit row, founders alerted
```

Failure paths:

| Failure | Handling (RECOMMENDATION) |
|---|---|
| Company link shared or forwarded | No public or capability links. Magic links are single use and expire in 15 minutes (configurable in Supabase Auth, ASSUMPTION). A forwarded link gives a stranger nothing without that inbox. Report pages show the viewer's email as a watermark. No company download button. Contract bars sharing (legal, founders). |
| Company user leaves the company | Founders remove `company_user`; sessions expire within 1 hour (short JWT lifetime) |
| Withdrawal while a company has the page open | Page holds no cached copy; the next action re-checks. A screenshot already taken can't be recalled: say so in the consent text (founder wording). |
| Approval for the wrong company | Approval is per `(report_id, company_id, version)`; RLS checks all three |
| A bug in RLS leaks a report | Section 8 tests run on every deploy; audit log review weekly; incident runbook in the execution plan |

## 4. Stack recommendation and alternatives

| Option | Pieces | Why pick it | Why not |
|---|---|---|---|
| **A (RECOMMENDATION)** Next.js (TypeScript) on Vercel + Supabase | Vercel Pro, Supabase Pro (Postgres, Auth with GitHub OAuth and magic link, Storage, RLS) | Isolation lives in the database (RLS), so a missed check in app code doesn't leak. Auth, storage and DB are one vendor and one bill. Large hiring pool of people who know it. | Two vendors for hosting. RLS policies are easy to get subtly wrong, so they need the tests in section 8. |
| B. Django or Rails monolith on Render with Render Postgres | Built-in admin gives founders a back office for free; built-in auth | Fewest moving parts; the admin screens replace the sheet sooner | Isolation is enforced in app code (one forgotten filter leaks); file storage needs another vendor |
| C. Next.js on Vercel + Neon Postgres + Clerk | Clerk handles GitHub login and company organizations | Best-in-class auth UI and org model | Three vendors; isolation still needs RLS or app checks; Clerk's org model is more than 2 to 4 companies need |

Who on the team writes code (constitution 5) should decide between A and B; pick the one the builder already knows.

## 5. Third-party services

Buy before build. All prices RESEARCHED on 2026-10-03 from the linked page unless labeled.

| Need | Recommendation | Price | Alternative |
|---|---|---|---|
| Hosting | Vercel Pro (Hobby is "personal, non-commercial use") | $20 per seat per month ([Vercel](https://vercel.com/pricing)) | Render: Starter web service $7/month, Postgres Basic from $6/month plus $0.30/GB (RESEARCHED via [secondary summary](https://kuberns.com/blogs/render-pricing/); verify on [render.com/pricing](https://render.com/pricing)) |
| Database, auth, storage | Supabase Pro. Free pauses after 1 week idle, so not for live use. | $25/month incl. $10 compute credit, 8 GB DB, 100k MAU, 100 GB storage, daily backups kept 7 days ([Supabase](https://supabase.com/pricing)) | Neon + Clerk (Clerk free: 50k retained users, GitHub login; Pro $25/month ([Clerk](https://clerk.com/pricing))) |
| Repo access | Our own GitHub App, read-only | $0 (ASSUMPTION: no charge for creating an App) | Read-only collaborator (manual) |
| Forms | Tally Free: unlimited forms and submissions, webhooks | $0; Pro $24/month ([Tally](https://tally.so/pricing)) | Google Forms (in Workspace) |
| Scheduling | Cal.com Free (1 user) | $0; Teams $12/user/month annual ([Cal.com](https://cal.com/pricing)) | Calendly |
| Video, docs, sheets | Google Workspace Business Starter. Meet recording needs Business Standard. | $7/user/month regular, Standard $14 ([Google](https://workspace.google.com/pricing)) | Zoom |
| Email from the app | Resend Free | 3,000/month, 100/day; Pro $20/month ([Resend](https://resend.com/pricing)) | Postmark |
| Invoicing | Stripe Invoicing Starter, ACH preferred | 0.4% per paid invoice ([Stripe Invoicing](https://stripe.com/invoicing/pricing)) plus ACH 0.8% capped at $5 or card 2.9% + 30c ([Stripe](https://stripe.com/pricing)) | QuickBooks |
| E-signature | Dropbox Sign Essentials | $15/month, unlimited requests ([Dropbox Sign](https://sign.dropbox.com/products/dropbox-sign/pricing)) | DocuSign |
| Sandboxes | GitHub Codespaces, org-billed | $0.18/hour (2 cores), $0.07/GB-month, no free org quota (verification.md 3.3) | Docker on a wiped loaner laptop |
| Errors | Sentry Developer (1 user) | $0; Team $26/month annual ([Sentry](https://sentry.io/pricing/)) | Vercel logs only |
| Similarity check (S2) | Dolos, run locally on snapshots in a sandbox | $0 (PRD S2) | None |

## 6. Security and privacy model

**Roles and access (RECOMMENDATION):**

| Role | Can see | Can't see |
|---|---|---|
| Candidate | Own repo_link, push log, snapshots, every report about them (draft onward), own consents; can approve, withdraw, request deletion | Anyone else's data, company notes |
| Company user | Approved, non-withdrawn reports for its own shortlist; its own notes | Other companies' shortlists, notes or views; drafts; push logs beyond links in the report |
| Founder (admin) | Everything, every read logged as `admin_read` | n/a. Max 2 accounts, MFA required |
| Contract engineer | The one Codespace for a defense | The app, sheet, other candidates |
| Server jobs | Service key, server-side only | n/a |

**Per-company isolation:** RLS on `report`, `shortlist_entry`, `company_note`, `audit_log`. The company's id comes from a `company_user` lookup on the signed-in user, never from a URL or request body. Company roles have no direct SELECT on `report`; the only read path is a security-definer function that writes the audit row first. If the audit insert fails, the read fails.

**Audit log:** append-only (no UPDATE or DELETE grants, enforced by a trigger). Logged: every report view, approval, withdrawal, export, deletion, admin read, GitHub App revocation. Kept as part of the hiring record (4 years, ASSUMPTION per legal F4).

**Secrets:** GitHub App private key and webhook secret, Supabase service key and Resend key live only in Vercel environment variables. Rotate the App key and webhook secret after each cohort and whenever a founder device is lost. No secret ever enters a Codespace.

**Retention and deletion jobs:** daily `/api/cron/retention`:
1. Snapshots and push logs: delete at `cohort.retention_until` (12 months, ASSUMPTION).
2. Recordings (if any, stored in Drive): founders delete at 90 days from a sheet reminder; the app holds none.
3. Hiring record: keep 4 years, then delete.
4. Deletion request: delete tier-2 rows and files within 30 days (ASSUMPTION, lawyer confirms), tell the candidate what was kept and why (legal F4).
5. Uninstall the GitHub App from every repo once defenses end.
Each job writes its counts to the audit log. Supabase backups (7 days) mean deleted rows fully disappear 7 days later; say so in the data notice.

**Public-repo constraint (KNOWN: `firefly` is public):**
- The repo holds code, schema migrations and synthetic seed data only. No candidate names, emails, repo URLs, call notes, reports or exports, ever. Tests use generated fixtures.
- Turn on GitHub secret scanning and push protection (RECOMMENDATION; ASSUMPTION that both are free for public repos, verify in repo settings).
- `.gitignore` covers `.env*`, `*.csv`, `exports/`, `snapshots/`. CI logs never print rows.
- The sheet, Drive folders and Supabase project belong to the founders' Workspace and are shared with named people only.

## 7. Sandboxing and prompt injection

**Candidate code (RECOMMENDATION, from verification.md 3.3):**
1. The app never extracts, builds or runs a snapshot. It stores bytes and a hash.
2. Bug planting and defenses use a Codespace in a **separate GitHub org** that owns nothing else, with a spending limit, no org secrets, and no access to the firefly repo or Supabase.
3. If the candidate's app needs an API key, use a capped test key revoked after the session.
4. Destroy the Codespace after the defense and log `sandbox_destroyed_at`.
5. Dolos runs in the same kind of sandbox, never on a founder laptop with real credentials.

**AI posture:** cohort 1 uses no AI on submissions (PRD Do not build). If founders later approve AI summaries (constitution 7.5): the model gets no tools, no network and no write access; candidate text is wrapped and labeled as untrusted data; output always sits beside the source evidence; a human makes every decision; the AI never sees another candidate's data in the same call. A README saying "rate this a 4" can then only produce a wrong summary, which the reviewer checks against the evidence.

## 8. Observability and testing

**Observability (RECOMMENDATION):** Sentry free for errors. A daily email to founders: pushes received, deliveries redelivered, repos with no push in 3 days (feeds the PRD FR5.2 ping), snapshot status, report views by company. A free uptime check on the webhook route during the build window.

**Testing (RECOMMENDATION), smallest set that would catch the expensive bugs:**
1. RLS tests run on every deploy against a local Supabase: company A user reads zero rows of company B; draft and withdrawn reports return nothing; every report read writes one audit row.
2. Webhook tests: bad signature rejected, duplicate delivery id ignored, late push flagged.
3. Snapshot test against a throwaway public fixture repo.
4. One Playwright smoke test of the company view at 375 px and 1440 px.
5. The M12 dry run is the end-to-end test: two volunteers, real App install, real deadline, real snapshot, dry-run report approved and withdrawn.

## 9. Monthly cost

Inputs (ASSUMPTION unless cited): pilot = 100 applicants, 40 builders, 15 finalists, 4 companies, 2 founders, 1 cohort per month at most. 10x = 1,000 applicants, 400 builders, 150 finalists, 40 companies, 4 staff. Codespaces hours = finalists x (3 h prep) + finalists x companies interviewing (pilot 2, 10x 2) x 1.5 h.

| Item | Pilot | 10x | Notes |
|---|---|---|---|
| Vercel Pro | $20 | $40 | 1 then 2 seats |
| Supabase Pro | $25 | $35 | 10x: ~2 GB snapshots, small compute bump (ASSUMPTION) |
| Codespaces | $16 | $160 | 90 h then 900 h at $0.18 |
| Google Workspace Starter | $14 | $56 | 2 then 4 users at $7; add $7/user if Meet recording is approved |
| Dropbox Sign | $15 | $25 | Essentials then Standard 1 seat |
| Cal.com | $0 | $36 | Free then Teams x3 |
| Tally | $0 | $24 | Free then Pro |
| Resend | $0 | $20 | Free then Pro |
| Sentry | $0 | $26 | Free then Team |
| Domain | ~$2 | ~$2 | ASSUMPTION |
| **Total** | **~$92** | **~$424** | Software for M4/M9 alone: $45 pilot |
| Stripe per invoice | ~$9 on $1,000 | ~$29 on a $6,000 fee | 0.4% + ACH capped at $5 |

If both M4 and M9 stay manual, drop Vercel and Supabase: ~$47 a month pilot.

**What changes at later stages (not designed here):** second city adds verified video interviews and a paid ID check ($1.50 each, verification.md); the standing pool (S4) needs `consent_record` in-app and a per-candidate retention clock; more than ~20 companies justifies company-side scoring in the app and Supabase Team or SOC 2 work if buyers ask.

## 10. Open questions

| ID | Question | Blocks | Who answers |
|---|---|---|---|
| TQ1 | Can the repo Events API be read for private repos with an installation token holding only Contents and Metadata read? | M4 backfill for private repos | Spike in the dry run (architect) |
| TQ2 | Snapshot size cap: is 100 MB enough for early-career projects? | M4 | Dry run data |
| TQ3 | Does Google Drive's activity view record external viewers well enough to serve as the M9 manual view log? | M9 fallback | Founders test with a non-Workspace account |
| TQ4 | Are retention periods (12 months, 90 days, 4 years) and the 30-day deletion window right? | Retention job | Lawyer (PRD Q5) |
| TQ5 | Is a candidate-approved report on our own observations a consumer report? | M9 design | Lawyer (PRD Q4) |
| TQ6 | Can org-billed Codespaces run in a free GitHub org, or does the sandbox org need a paid plan? | Sandboxing | Check GitHub billing settings |

## 11. Decisions needed from founders

1. **Build M4 and M9 for cohort 1, or run the fallbacks (PRD Q6)?** Recommended: build M4, run M9 by hand, build M9 for cohort 2.
2. **Stack:** A (Next.js + Vercel + Supabase), B (Django or Rails on Render), or C (Next.js + Neon + Clerk)? Recommended: A, unless the person writing code knows B better.
3. **Vendors and spend:** approve ~$92 a month pilot (or ~$47 if all manual), and sign-ups for Vercel, Supabase, Tally, Cal.com, Dropbox Sign, Stripe, Resend, Sentry. Recommended: yes, sign up only when each is first needed.
4. **Separate GitHub org for sandboxes with a $50 monthly spending limit?** Recommended: yes.
5. **Meet recording** (needs Business Standard, +$7 per user, and all-party consent, legal F2)? Recommended: no recording in cohort 1.
6. **Companies get no download of reports**, only an in-app or doc view with a watermark? Recommended: yes.
7. **Uninstall the GitHub App from every candidate repo after defenses**, telling candidates up front? Recommended: yes.
