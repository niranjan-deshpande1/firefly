# Firefly platform v1: status

Branch `build/platform`, 2026-10-03. Runs locally with SQLite and no outside accounts (see README).

## 1. What works

KNOWN: each item below runs in the local build and is covered by unit tests, the e2e suite, or both.

| Area | Works end to end |
|---|---|
| Discovery | Landing, for-companies page with pricing, hackathon listing with search, filters and sort, hackathon tabs (overview, rules, prizes, schedule, judging, resources, updates, participants, projects, teams) |
| Participation | Onboarding with role choice and versioned consent, registration with eligibility, teams (create, invite, join, leave, looking-for-teammates board), weekly check-ins, builder dashboard |
| Projects | Posting (story in Markdown, built-with, links, images, video link, repo), drafts, gallery with built-with filter and award chips, likes without counts, comments with moderation |
| Profiles | Public profile, verified badge, privacy settings, talent pool opt-in, JSON data export, delete request |
| Organizer console | Create and edit hackathons, hiring cohort config, prizes, schedule, criteria, resources, updates, participants, judges, reviewer assignment, winners |
| Evidence locker | Commit timeline (GitHub API, or seeded commits when GitHub can't be reached), AI transcript upload and viewer, decision log, check-in history, AI evidence summary |
| Evaluation | Reviewer queue, blind scoring with rationale and evidence link per score, audited identity reveal, calibration with flagged gaps of 2+ and a required note, advance / hold / don't advance with a required reason, written feedback, judging for open hackathons |
| Interviews | Scheduling (model, mode, time with IANA zone, link or location, interviewers), interview room with identity check, script, section timers and scorecard; a passed defense marks the project verified |
| Companies | Company profile and team, role intake with company criteria, cohort enrollment with the $1,000 non-refundable invoice, shortlist, candidate report (every view audited), interview requests, talent pool, hire reporting with the 5% invoice |
| Admin | Funnel dashboard, audit log with filters, email log, invoices (draft, sent, paid), data requests, settings (fees, attribution window, retention) |
| Permissions | Enforced on the server in every page, action and route through `lib/permissions`; e2e tests cover cross-company, cross-reviewer, cross-builder and signed-out access |

Checks at handoff: typecheck, lint, design lint, 272 unit tests, production build, and 15 Playwright tests (smoke, 4 permission tests, the 8 demo steps) all pass. Screenshots of each demo step are in `docs/build/screenshots/`.

## 2. What is mocked, and why

| Mocked | How it behaves | Why |
|---|---|---|
| Email | Written to the email log (admin > emails); nothing is sent | Brief 4.3: no real email |
| Payments | Invoices are records; an admin marks them sent and paid | Brief 4.3: no real payments |
| Video calls | Interviews store a link or a location | Brief 4.3: links only |
| Sign-in | Demo sign-in lists seeded people by role; GitHub sign-in works only once an OAuth app is configured | Creating OAuth apps is outside the approval |
| GitHub data | Live reads when a repo is public and reachable, seeded commits otherwise | No token provisioned |
| AI summary | A seeded summary shows; "prepare a new summary" appears only with `ANTHROPIC_API_KEY` | No key provisioned, no spend approved |
| People and companies | All fictional seed data | Public repo |

## 3. Known gaps

1. **Paywall on candidate data (founder call).** A self-serve company sees the talent pool and gets shortlists as soon as it enrolls, before its invoice is paid or anyone checks it. RECOMMENDATION: require admin approval of new companies before enrollment counts.
2. **Scheduled jobs need a cron entry.** `npm run jobs` emails held feedback once results are out and deletes process evidence older than the retention setting, except for hires. Nothing runs it on a schedule until a server has a cron entry; admins can also press "run scheduled jobs now" in settings.
3. **New consent copy needs a founder check.** The retention promise was rewritten to match what the job deletes (consent version 2026-10-03.2), so every builder sees the consent screen again.
4. Blind masking is a word match on names, usernames, emails and the GitHub handle. A nickname or a misspelling still gets through.
5. Blind codes belong to the person, not the project. A reviewer who revealed someone in one cohort recognizes their code in the next. RECOMMENDATION: per-project codes.
6. No project cover images in the seed, so galleries show text cards and project pages have no focal media. Real screenshots are needed.
7. The seed schedules Maya's interview before her review is posted. Interview pages show the blind code until the reveal, but the order is unrealistic.
8. AI summary lock is per process; more than one server instance needs a database claim.
9. No Content-Security-Policy yet (other security headers are set). Demo mode must be off on any public deploy.
10. Team joins re-check membership and size inside one transaction, which narrows the race but does not close it under every isolation level. A one-team-per-person-per-hackathon constraint would close it.
11. QA polish not done:
    - $0 and 0% fees are accepted.
    - Demo video links aren't limited to https.
    - Projects can be posted before a hackathon starts.
    - Organizer status changes don't check date order.
    - Two actions fail silently (award with no project picked, empty reconciliation note).
    - Some stale form errors and two copy slips.
    - Admin can open /company.
    - Soft 404s return HTTP 200 while streaming.
    - Audit rows are noisy (one per transcript per page load).
    - The project wizard drops unsaved steps.
    - Completing an interview has no confirmation step.

Added since the first handoff:

- Interviews: organizers and admins can cancel (with a reason) and reschedule, both emailed and audited; company interview requests have a handling screen at `/interviews/requests` (schedule from the request, or decline with a reason); section timers survive a reload.
- Scheduled jobs (`npm run jobs` and an admin button): held feedback emails and retention deletes.
- Organizer actions write audit entries; hackathons have their own time zone, used for every date they show; hidden comments can be shown again; project images can be reordered.
- Blind review masks the builder's and teammates' names, usernames, emails and GitHub handle as `[builder]` in commits, transcripts, check-ins, the decision log, the summary and the AI summary prompt.
- Only past hiring-cohort finishers can join or appear in the talent pool.
- The seed has a completed cohort (Summer Builders Cohort) with a verified project, so a profile shows the verified badge and the talent pool has entries.
- GitHub reads page through up to 500 commits.
- The hire page notes when a role's planned hires are already reported.

## 4. Needs a lawyer

1. Consent text and its versioning (what builders agree to about evidence, transcripts and company access).
2. Participant rules and terms, including who owns submitted code.
3. Data retention promise and the delete flow (we keep an anonymous user row for billing and audit history).
4. Pricing copy: "non-refundable" on the $1,000 fee, the 5% hire fee, the attribution window and the 90-day replacement promise.
5. Whether candidate reports count as consumer reports (FCRA) and whether our process touches automated hiring decision laws. People make every decision; no scoring or ranking is automated.
6. Recruiting and employment-agency rules in Washington and California.

## 5. Founder questions

1. Should company access to candidate data wait for a paid invoice or admin approval? RECOMMENDATION: admin approval.
2. A hire outside the attribution window: refuse it (current), or record it with no fee? RECOMMENDATION: record with no fee, so placement stats stay complete.
3. Should hiring cohort projects ever show on public profiles? Today they show after the cohort completes.
4. Is the new retention and consent copy right? It now promises exactly what `npm run jobs` deletes. A lawyer should see it before a real cohort.

## 6. What to build next

1. Admin approval for new companies (gap 1).
2. A small job runner for held feedback, retention deletes and reminder emails (gaps 4, 6).
3. Interview cancel, reschedule and request handling (gap 3).
4. Real GitHub OAuth app and email provider, once the founders set up those accounts.
5. Masking names in transcripts and check-ins for blind review (gap 5).
6. Deploy plan: Postgres, CSP, a real `AUTH_SECRET`, demo mode off.

## 7. Leave out of the pitch

- Live email, payments, video or GitHub sign-in: all mocked.
- The AI summary as a live feature: it shows a seeded summary without a key.
- Any claim that the platform verifies identity on its own. The identity check is a person ticking a box in the interview room.
- Any claim of legal compliance. Section 4 is unreviewed.
