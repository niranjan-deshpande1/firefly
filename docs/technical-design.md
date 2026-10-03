# Technical design: firefly MVP pilot

Draft v0.1, 2026-10-03. Owner: architect. Labels follow constitution 2.1. Built from [PRD](prd/PRD.md) (canonical), [flows](prd/flows.md), [verification](research/verification.md), [evaluation](research/evaluation.md), [legal flags](research/legal-flags.md). Nothing here is approved. Stack and vendors are founder decisions (constitution 12).

## Answer first

1. **RECOMMENDATION:** Cohort 1 runs on zero custom software. M4 (evidence) and M9 (company view) run by hand, per the PRD v0.1 recommendation.
2. **RECOMMENDATION:** Software versions of M4 and M9 move to "Later: first to build, for cohort 2", and only if cohort 1 shows the manual version is the bottleneck. The stack gets picked then.
3. **RECOMMENDATION:** Pilot tool cost is about $36 a month plus Stripe fees per invoice. Candidate code runs only in disposable Codespaces.

Pilot funnel used for every number (RECOMMENDATION, PRD v0.1): ~100 applicants, 40 accepted starters, plan for ~15 submissions (H5 passes at 12), shortlist up to 8. Shared defense: one 75-minute session per finalist with every interested company in the room, one planted bug per finalist, up to 4 finalists per company.

## 1. Cohort 1 tools (no custom software)

| Job | Tool (RECOMMENDATION) | PRD item |
|---|---|---|
| Application, consent, check-ins, submission, scorecards | Tally forms into Google Sheets | M1, M5, M6, M8 |
| Company agreement | Dropbox Sign | M2 |
| Tracker, review sheet, defense scores | Google Sheets, shared with founders only | M7, M11 |
| Evidence capture | Candidate repo (public or our account as read-only collaborator), SHA field on the deadline form, a clone at the deadline | M4 |
| Company view | One access-limited Google Doc per company; candidate approval by email | M9 |
| Kickoff, calls | Google Meet | M3, M5 |
| Help channel | A free chat server (ASSUMPTION: Discord free tier is enough) | M5 |
| Defense booking | Cal.com free | M8 |
| Bug planting, defense environment | GitHub Codespaces in a separate org | M8 |
| Invoices | Stripe Invoicing | Pricing |

## 2. Data: sheet columns for cohort 1

**RECOMMENDATION.** One Google Sheet, founders only, never in this repo. Column names match the table names a later app would use, so moving is a CSV import.

| Tab | Columns |
|---|---|
| `enrollment` | candidate_id, name, email, github_user, city, years_exp, work_auth, accommodation_requested (yes/no), status (applied, accepted, building, submitted, late, shortlisted, interviewed, offer, hired, withdrawn), status_changed_at |
| `consent_record` | candidate_id, consent_type (terms, data, report_sharing, recording, standing_pool), text_version, given_at, method, withdrawn_at |
| `evidence` | candidate_id, repo_url, access (public or collaborator), final_sha (from form), cloned_at, sha_matched (yes/no), bundle_path, notes |
| `evaluation` | candidate_id, reviewer, dimension (A to F), score (1 to 4), evidence_note, evidence_link, filed_at |
| `interview` | candidate_id, session_at, companies_present, facilitator, id_checked (yes/no, never an image), recording_consented, bug_ref, sandbox_destroyed_at |
| `interview_score` | candidate_id, scorer, company, dimension, score, evidence_note, filed_at (before discussion) |
| `company` | company_id, name, agreement_signed_at, flat_fee_status, role_title, salary_range, criteria (job-related only), criteria_review_note |
| `report` | candidate_id, company_id, version, doc_link, sent_to_candidate_at, approved_at, approval_email_link, shared_with_company_at, withdrawn_at, unshared_at |
| `view_log` | company_id, candidate_id, viewer_email, viewed_at, source (Drive activity or company says) |
| `hire` | candidate_id, company_id, first_year_salary, start_date, invoice_id, day90_checked_at |

Rules (RECOMMENDATION): scores stay one row per dimension with no total column. A new report version needs a new approval. Retention follows legal F4: the hiring record (consent, scores, reasons, reports sent) for 4 years; everything else 12 months after the cohort; recordings 90 days. A lawyer confirms (PRD Q5).

**When we build (Later, cohort 2):** the app needs only `candidate`, `company_user`, `repo_link`, `push_event`, `snapshot`, `shortlist_entry`, `report`, `consent_record` and an append-only `audit_log`. Everything else stays in the sheet until reviewers score in an app.

## 3. Evidence and company-view flows

### 3.1 Manual evidence flow (M4, cohort 1)

**RECOMMENDATION.** Push times are context only. They never proved authorship (verification.md 2.1); the defense carries verification.

1. At acceptance, the candidate either keeps the repo public or adds our GitHub account as a read-only collaborator. We accept the invite and log `access`.
2. The deadline form asks for the final commit SHA.
3. At the end of the 2-hour grace window, a founder clones every repo (`git clone --mirror`), checks the submitted SHA exists, and saves a `git bundle` to a restricted Drive folder. Never run, install or build the code on that machine.
4. Log `cloned_at`, `sha_matched` and `bundle_path`. The bundle is what gets judged.
5. Optional, public repos only: a throwaway script reads the repo Events API (30 days, 300 events, verification.md 2.1) for push times. Its output goes to the sheet, never to this repo.

| Failure | Handling (RECOMMENDATION) |
|---|---|
| SHA missing or typo | Email the candidate; they correct it within the grace window |
| SHA not in the clone | It wasn't pushed by the clone time, so it's late. Judge the latest commit present at clone time, or mark late per PRD rules. |
| Push after the deadline | The bundle is already saved; later pushes change nothing |
| Force-push or rewritten history before the deadline | Visible in the Events API for public repos; note as a defense question, never an auto-flag |
| Repo made private, deleted, or our access removed before the clone | Email the candidate; if unresolved by the grace end, follow the PRD late rule |
| Founder misses the clone time | Clone as soon as possible and keep only the submitted SHA; record the actual `cloned_at` |

### 3.2 Manual company view (M9, cohort 1)

1. Founder writes the report from a fixed template: six scores, evidence links, no total.
2. Email it to the candidate. The candidate approves per company by reply. Log `approved_at` and the email link.
3. Share the doc with named company emails only, view-only, with download, print and copy turned off (Google Drive sharing settings).
4. Check Drive activity weekly and log views (OPEN QUESTION TQ1: how well it records outside viewers).
5. Withdrawal: unshare the doc the same day and log `unshared_at`.

| Failure | Handling (RECOMMENDATION) |
|---|---|
| Doc shared to the wrong company | Unshare at once, log it, tell the candidate, review with a lawyer (legal F1) |
| Company forwards the link | Drive blocks anyone not named. The contract bars sharing (founder wording). |
| Withdrawal after a company already read it | Unshare; a screenshot can't be recalled. The consent text says so (founder wording). |

### 3.3 Later: software sketch for cohort 2 (only if manual is the bottleneck)

One web app, one database, one standard auth provider (GitHub login for candidates, email login for company users, MFA for founders).

- **GitHub App:** Contents read and Metadata read on one selected repo; `push` event; `installation` events arrive automatically. RESEARCHED: push needs Contents read ([webhook events](https://docs.github.com/en/webhooks/webhook-events-and-payloads), accessed 2026-10-03). GitHub does not retry failed deliveries and keeps them for redelivery for 3 days ([failed deliveries](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries), [redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/redelivering-webhooks), accessed 2026-10-03), so the design needs a redelivery step.
- **Company view:** Postgres row-level security keyed on the signed-in user's company. A report is readable only when approved for that company and not withdrawn. The only read path writes the audit row first.
- **Riskiest part:** a row-level security bug shows a report to the wrong company. Isolation tests must run on every deploy.

## 4. Stack (decide only when building for cohort 2)

| Option | Two lines |
|---|---|
| **RECOMMENDATION:** Next.js on Vercel + Supabase | Supabase gives Postgres, auth and storage in one; row-level security puts company isolation in the database. Vercel Pro $20/seat/month ([Vercel](https://vercel.com/pricing)); Supabase Pro $25/month ([Supabase](https://supabase.com/pricing)), both RESEARCHED 2026-10-03. |
| Alternative: Django or Rails on Render | Built-in admin replaces the sheet sooner, with fewer moving parts. Isolation lives in app code, so one missed filter leaks; pick it if the builder knows it better. |

## 5. Third-party services (cohort 1)

Prices RESEARCHED 2026-10-03 from the linked page.

| Need | Recommendation | Price |
|---|---|---|
| Forms | Tally Free | $0, unlimited forms and submissions ([Tally](https://tally.so/pricing)) |
| Docs, sheets, video | Google Workspace Business Starter | $7/user/month; Meet recording needs Business Standard at $14 ([Google](https://workspace.google.com/pricing)) |
| Scheduling | Cal.com Free | $0 for 1 user ([Cal.com](https://cal.com/pricing)) |
| E-signature | Dropbox Sign Essentials | $15/month ([Dropbox Sign](https://sign.dropbox.com/products/dropbox-sign/pricing)) |
| Invoicing | Stripe Invoicing, ACH preferred | 0.4% per paid invoice ([Stripe Invoicing](https://stripe.com/invoicing/pricing)) plus ACH 0.8% capped at $5, or card 2.9% + 30c ([Stripe](https://stripe.com/pricing)) |
| Sandboxes | GitHub Codespaces, org-billed | $0.18/hour for 2 cores, no free org quota (verification.md 3.3) |
| Repo access | Our GitHub account as read-only collaborator | $0 |

## 6. Security and privacy

**RECOMMENDATION:**
- **Access:** two founder accounts with MFA own the sheet, Drive and Codespaces org. The founder planting a bug works only in that finalist's Codespace. Companies get only their own docs.
- **Per-company isolation:** one doc per company per candidate. Never put two companies on one doc. A company's own interview notes stay in its own doc (legal F1).
- **View and audit log:** `view_log` tab plus Drive activity; every share, unshare, approval and deletion logged in the sheet.
- **Secrets:** none in cohort 1 beyond tool logins in a password manager. No secret ever enters a Codespace.
- **Retention and deletion:** a monthly calendar reminder runs the three tiers in section 2. Deletion requests: delete tier-2 data within 30 days (ASSUMPTION, lawyer confirms) and tell the candidate what was kept and why (legal F4).
- **Public repo (KNOWN: `firefly` is public):** it holds docs and, later, code with synthetic test data only. No names, emails, repo URLs, SHAs tied to people, call notes, reports, exports or Events API output. Turn on secret scanning and push protection (ASSUMPTION: free for public repos; check repo settings).

## 7. Sandboxing and prompt injection

**RECOMMENDATION (from verification.md 3.3):**
1. Bug planting and each defense use a Codespace in a **separate GitHub org** that owns nothing else, with a spending limit and no org secrets.
2. If the candidate's app needs an API key, use a capped test key and revoke it after the session.
3. One bug per finalist, planted the day before on the deadline bundle, committed to a private `defense` branch.
4. Destroy the Codespace after the session and log `sandbox_destroyed_at`.

**AI posture:** no AI reads submissions in cohort 1 (PRD Do not build). If founders approve AI summaries later (constitution 7.5): no tools, no network, candidate text labeled as untrusted data, output shown beside the source evidence, and a human makes every decision.

## 8. Observability and testing

**RECOMMENDATION:** the sheet is the observability. Funnel events are logged the same day (PRD FR11.1). A weekly founder check covers: repos with no new commits by day 3 (public ones visible on GitHub; others by asking), `sha_matched` for every submission, unshared docs after withdrawals, and Drive views. The M12 dry run is the end-to-end test of the whole manual flow, including one clone, one approval and one withdrawal.

## 9. Monthly cost (pilot)

Inputs (ASSUMPTION): 2 founders, 1 cohort, up to 8 finalists. Codespaces hours = 8 finalists x (3 h prep + 1.5 h session) = 36 h.

| Item | Monthly |
|---|---|
| Google Workspace Starter, 2 users | $14 |
| Dropbox Sign Essentials | $15 |
| Codespaces, 36 h at $0.18 | ~$7 |
| Tally, Cal.com, chat server | $0 |
| **Total** | **~$36** |
| Stripe per invoice | ~$9 on the $1,000 flat fee; ~$29 on a $6,000 hire fee (5% of $120,000, illustrative) |

**Later software (cohort 2):** about $45 a month (Vercel Pro $20 + Supabase Pro $25). **At 10x (one line, ASSUMPTION):** about $400 a month with the software, mostly seats and Codespaces hours.

## 10. Open questions

| ID | Question | Blocks | Who answers |
|---|---|---|---|
| TQ1 | Does Drive activity record views by people outside our Workspace well enough to be the view log? | M9 manual log | Founders test with a non-Workspace account |
| TQ2 | Can a free GitHub org be billed for Codespaces, or does the sandbox org need a paid plan? | Sandboxing | Check GitHub billing settings |
| TQ3 | Are the retention periods and the 30-day deletion window right? | Retention | Lawyer (PRD Q5) |
| TQ4 | Is a candidate-approved report built on our own observations a consumer report? | M9 | Lawyer (PRD Q4) |
| TQ5 | Which manual step hurt most in cohort 1 (clone, approvals, view logging)? | Whether to build M4 or M9 | Cohort 1 retro |

## 11. Decisions needed from founders

1. **Run cohort 1 with no custom software (M4 and M9 by hand)?** Recommended: yes.
2. **Defer the stack choice until building for cohort 2?** Recommended: yes; lean Next.js + Supabase.
3. **Approve ~$36 a month in tools** and sign-ups for Workspace, Dropbox Sign, Tally, Cal.com, Stripe and a Codespaces org? Recommended: yes, each when first needed.
4. **Separate GitHub org for sandboxes with a $25 monthly spending limit?** Recommended: yes.
5. **Repo access rule:** public repo or our account as read-only collaborator, final SHA on the form? Recommended: yes.
6. **Meet recording** (+$7 per user and all-party consent, legal F2)? Recommended: no recording in cohort 1.
