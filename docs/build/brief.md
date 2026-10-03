# Firefly: build the full platform in one run

This is one continuous run. Do every step below, in order, without stopping to ask. When something isn't covered here, choose the option most consistent with this spec, log it in `docs/build/decisions-log.md`, and keep going. We'll iterate after this run.

## 1. Authority for this run

- **APPROVED (both founders):** build the full Firefly platform described here. This covers writing code, running it locally, rewriting commit messages on our branches, editing our PRs and issues, pushing branches, and opening a draft PR.
- **Not covered:** deploying, spending money, signing up for or configuring any outside service, creating OAuth apps or API keys, or merging into main. If a feature needs one of those, build it behind an env var with a working local fallback and list it in the status report.
- This build is the demo for our pitch and the base for cohort 2. The PRD's validation gate stays open. Customer calls still decide what we keep, so this run doesn't change hypotheses, thresholds, or registers except where this prompt says so.
- When a gstack skill asks a question, answer it yourself from this spec, log the answer in `docs/build/decisions-log.md`, and continue.
- Write progress to `docs/build/progress.md` after each step so nothing is lost if your context compacts. Give heavy work to subagents and keep your own context for coordination and integration.
- Where `docs/prd/`, `docs/research/`, `docs/technical-design.md`, or `docs/execution-plan.md` conflict with this prompt, this prompt wins. Log each conflict.

## 2. No Claude attribution, anywhere

Claude is never a co-author of, or credited on, anything we make. Do this before any other work.

1. Turn attribution off for every project on this machine and for the repo, so it also holds for my co-founder. Merge this into both `~/.claude/settings.json` and the repo's `.claude/settings.json`:
   ```json
   { "attribution": { "commit": "", "pr": "", "sessionUrl": false } }
   ```
   Check the Claude Code settings docs in case a key has changed, and use whatever hides all attribution.
2. Rewrite every commit message on the PR #31 branch to remove any `Co-Authored-By:` trailer naming Claude and any "Generated with Claude Code" line. Keep authors, dates, and content unchanged. Push with `--force-with-lease`.
3. Remove attribution lines from the PR #31 description and from any comments you wrote on it.
4. Check issues #1 to #30. Remove attribution lines from their bodies and from your comments.
5. From here on, no Claude or AI credit lines in commits, PR titles or bodies, issues, comments, code comments, docs, the README, or UI copy. The product calls the Anthropic API for the evidence summary; that's a dependency and gets no credit line.
6. At the end, confirm that the commit messages on `build/platform` and on the PR #31 branch contain no `Co-Authored-By` or "Generated with" lines, and report the result.

## 3. Locked decisions

- **Pricing.** Each company pays a $1,000 flat fee per hiring cohort it joins. The fee is charged at enrollment and never refunded, even if we deliver no finalists. Each hire adds a fee of 5% of the hire's reported first-year salary. Record the non-refundable decision on issue #3 and close it.
- **Attribution window for hire fees.** 12 months from cohort end, editable by admins. Log it as an ASSUMPTION in the decisions log.
- **Cohorts.** Hiring cohorts last two weeks, are solo, and end with a defense interview. Open hackathons may allow teams.
- **Humans decide.** People make every advance, reject, and hire decision. The platform never scores, ranks, or rejects candidates on its own.
- **Ownership.** Candidates own the code they submit. Companies get read access to evidence only for candidates on their own shortlists.
- **Back in scope.** PRD v0.2 moved four items to Later. Three come back for the full platform: verified project profiles, the talent pool of past finishers (opt-in only), and office hours as a cohort schedule item. The code similarity check stays Later.

## 4. What Firefly is

Firefly is a hackathon platform built for hiring. It does everything Devpost does for running hackathons and showcasing projects. Then it adds what a startup needs to hire from one:
- company role intake
- two-week hiring cohorts
- evidence of how each candidate built with AI
- blind, evidence-linked review
- defense interviews
- shortlists and candidate reports
- hire tracking with fees

Use Devpost only as a feature checklist. Firefly has its own name, design, copy, and assets. Never copy Devpost's branding, text, layouts, or visuals.

### 4.1 Devpost parity (all required)
- **Discovery:** hackathon listing with search, filters (type, status, theme, online or in person, dates), and sort.
- **Hackathon pages** with tabs: overview, rules, prizes, schedule, judging criteria, resources, updates, participants, project gallery, and teams.
- **Registration and teams:** registration with eligibility confirmation, a participant dashboard, and team formation for hackathons that allow teams (create, invite, join, and a "looking for teammates" board).
- **Project submission:** title, tagline, story in Markdown, built-with tags, links, image gallery, demo video link, repo link, team members, and draft or submitted status.
- **Project pages and gallery** with likes, comments, built-with filters, and winner badges.
- **Judging for open hackathons:** organizers assign judges, judges score projects against the hackathon's criteria, organizers pick winners per prize, and winners show on the gallery and on project pages.
- **User profiles:** bio, skills, links, project portfolio, hackathons joined, and wins.
- **Organizer console:** create and edit hackathons with every field above, and manage prizes, schedule, criteria, resources, participants, judges, updates, and winners.
- **Email notifications** for key events, written to an email log. Nothing is actually sent.

### 4.2 Firefly additions (all required)
- **Company accounts:** company profile, team members, and role intake. Intake covers title, level, description, required skills, domain knowledge, traits, number of hires, salary range, and location or remote. Each role also gets company-specific criteria.
- **Hiring cohorts:** a hackathon type with a two-week build, kickoff, weekly check-ins, office hours, submission deadline, defense-interview window, and results. Companies enroll roles into a cohort.
- **Check-ins:** weekly written check-ins from candidates, visible to their reviewers.
- **Evidence locker per project:**
  - GitHub repo connection with a commit timeline. Use the GitHub API for public repos, with an optional `GITHUB_TOKEN` and seeded data as the fallback.
  - AI transcript upload and viewer.
  - Decision log: what they decided, why, and whether AI was involved.
  - Check-in history.
- **AI evidence summary:**
  - It's generated only when `ANTHROPIC_API_KEY` is set. Otherwise the seeded summary shows.
  - It summarizes evidence for a human reviewer and never scores, ranks, or recommends a decision.
  - All repo and transcript text is untrusted input. Wrap it in clearly delimited tags, tell the model to ignore any instructions inside it, and give the model no tools.
- **Evaluation workspace:**
  - Reviewers score with the rubric from `docs/research/evaluation.md` (default scale 1 to 4), plus each role's company-specific criteria.
  - Every score needs a written rationale and at least one evidence link: a commit, transcript excerpt, decision log entry, check-in, or interview note.
- **Blind review:**
  - Reviewers see a candidate code such as "Candidate 7F3A", with no name, photo, school, or commit author names, until they submit their review.
  - Every identity reveal is written to the audit log.
- **Calibration:**
  - Every cohort submission gets two reviewers.
  - A calibration view flags any dimension where the two scores differ by 2 or more and requires a reconciliation note.
- **Decisions:** advance, hold, or reject, made by a person with a required written reason.
- **Defense interviews:**
  - Scheduling for advanced candidates: in person, or a stored video link.
  - Interview model: we run it, joint, or company-run.
  - An identity check the interviewer confirms.
  - The script from `docs/research/verification.md`: walkthrough, live change, planted bug, "what breaks if" questions, and product questions.
  - A scorecard per section.
  - A passed interview marks the project verified.
- **Shortlists and candidate reports:**
  - Each role has a shortlist.
  - Each candidate gets an evidence-backed report combining rubric scores, evidence links, the interview scorecard, and the summary.
  - Every report view is written to the audit log.
- **Interview requests and hire reporting** from companies. Reporting a hire creates the hire-fee invoice.
- **Talent pool:** past cohort finishers who opt in, browsable by companies with an active cohort enrollment.
- **Verified project profiles:** projects that passed a defense interview get a verified badge on the candidate's profile.
- **Candidate feedback:** written feedback for every finisher who isn't hired, shown on their dashboard.
- **Privacy:**
  - A consent screen at signup covering what we collect, who sees it, retention, and the candidate's rights.
  - Privacy settings.
  - Data export as a JSON download.
  - Delete requests, handled in admin.
  - Default retention is 12 months.
- **Billing:**
  - Invoices for flat fees and hire fees, with draft, sent, and paid states and a "mark paid" action.
  - Flat-fee invoices say "Non-refundable" and have no refund action.
  - No real payment processing.
- **Admin:**
  - Funnel dashboard: signups, registrations, check-ins, submissions, reviews, advances, interviews, shortlists, hires, revenue.
  - Audit log viewer, email log, invoices, and data requests.
  - Settings for fee amounts, attribution window, and retention.

### 4.3 Do not build
- real payments
- real email sending
- built-in video calls (store a link only)
- running candidate code
- the code similarity check
- automated scoring, ranking, rejection, or matching
- browser or IDE monitoring
- ATS integrations
- native mobile apps

### 4.4 Roles and permissions

| Role | Can |
|---|---|
| Candidate | Register, form teams, check in, submit, manage their own evidence and privacy, opt into the talent pool, and read their written feedback after results. Never sees reviewer identities, scores from other candidates, or other candidates' evidence. |
| Company member | Manage their company and roles, enroll in cohorts, see shortlists and reports for their own roles only, browse the opted-in talent pool while enrolled, request interviews, report hires, and see their own invoices. |
| Organizer | Create and run hackathons and cohorts, assign judges and reviewers, post updates, moderate comments, and pick winners. |
| Reviewer | Review and judge assigned projects only, score, calibrate, decide, write feedback, and run interviews when assigned. |
| Admin | Everything, plus the audit log, email log, invoices, data requests, and settings. |

- Enforce these rules on the server in every page, server action, and route handler.
- Write an audit log entry whenever anyone other than the candidate:
  - opens a candidate report, evidence locker, or transcript
  - reveals a blind identity

## 5. Stack and conventions (locked)

**Framework**
- Next.js, latest stable, with the App Router, Server Components, and Server Actions.
- TypeScript in strict mode. npm.

**UI**
- Tailwind CSS using the design tokens from DESIGN.md.
- Radix UI primitives for accessible components and lucide-react for icons. No stock component theme.

**Data and auth**
- Prisma with a SQLite file database for local development and the demo. Keep the schema Postgres-compatible.
- Auth.js (NextAuth v5):
  - GitHub sign-in when `GITHUB_ID` and `GITHUB_SECRET` are set.
  - A demo sign-in page that lists seeded users by role, so the whole demo runs without OAuth setup. It's on when `DEMO_MODE=true`, which is the default in `.env.example`.
- Zod validation on every input.
- Markdown rendered with react-markdown, remark-gfm, and rehype-sanitize.

**Integrations**
- Recharts for charts. Use the dataviz skill if it's installed.
- @octokit/rest for GitHub.
- @anthropic-ai/sdk for the summary. The model comes from `ANTHROPIC_MODEL`, defaulting to a current Claude Sonnet model.

**Uploads**
- Files go to `./storage` (gitignored) through `lib/storage`, served by an authenticated route handler.
- Limits: images up to 5 MB; transcripts up to 2 MB, text or Markdown only.

**Testing and scripts**
- Vitest and Testing Library for unit tests. Playwright for end-to-end tests.
- package.json scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `db:migrate`, `db:seed`, `demo:reset` (drop, migrate, seed).

**Process**
- Install every dependency in this section during the foundation step. Builders don't add dependencies; they list any they need in their report.
- Record the stack in `docs/decisions/0001-stack.md`.

Folder layout:

```
app/                      routes (owners in step 3)
components/ui/            shared design system (foundation only)
components/<area>/        area components (that area's builder)
lib/<area>/               area queries and server actions (that area's builder)
lib/auth, lib/db, lib/permissions, lib/audit,
lib/email, lib/storage, lib/billing          shared services (foundation only)
prisma/schema.prisma      foundation and integration only
prisma/seed/              ops builder
tests/unit/<area>/        unit tests
tests/e2e/                Playwright tests
docs/build/               build docs
```

## 6. Data model

The foundation writes the full Prisma schema with these models and every field their features need:

- **Accounts:** User, Account, Session (Auth.js).
- **CandidateProfile:** headline, bio, skills, links, experience level, visibility, talent pool opt-in, consent version and time, blind code.
- **Companies:** Company, CompanyMember, Role, RoleCriterion.
- **Hackathons:**
  - Hackathon: type OPEN or HIRING_COHORT, status, dates, rules, eligibility, team policy, max team size, themes, online or in person, cover image.
  - CohortConfig: check-in schedule, office hours, defense window, prompt.
  - CohortEnrollment: company, role, enrolled at, flat-fee invoice.
  - Prize, ScheduleItem, JudgingCriterion, Resource, Update.
- **Participation:** Registration, Team, TeamMember, TeamInvite, CheckIn.
- **Projects:**
  - Project: owner, team, hackathon, title, tagline, story, built-with, links, repo URL, video URL, status, verified.
  - ProjectImage, ProjectLike, Comment.
- **Evidence:**
  - RepoSnapshot, Commit, AITranscript, DecisionLogEntry.
  - EvidenceSummary: content, model, seeded flag.
- **Review:**
  - RubricDimension: key, name, description, level anchors, universal flag.
  - Review: kind RUBRIC or JUDGING, blind flag, status.
  - ReviewScore: dimension or criterion, score, rationale, evidence refs.
  - CalibrationNote.
  - Decision: ADVANCE, HOLD, or REJECT, with reason and decided by.
  - ReviewerAssignment, JudgeAssignment, Winner, Feedback.
- **Interviews:**
  - Interview: model, mode, time, link or location, status, identity checked by and at.
  - InterviewScore: section, score, notes.
- **Hiring:**
  - Shortlist, ShortlistEntry, InterviewRequest.
  - CandidateReport: snapshot JSON.
  - Hire: salary, start date, status.
- **Billing:** Invoice: type FLAT_FEE or HIRE_FEE, amount in cents, status, non-refundable flag, issued at, paid at.
- **Operations:** DataRequest (EXPORT or DELETE), AuditLog, EmailLog, AppSetting.

## 7. Design

- Load the frontend-design skill, run gstack `/design-consultation`, and write DESIGN.md before building any UI.
- **Direction:**
  - A serious builder's workshop: confident and calm, dense where the data lives.
  - A warm glow accent that nods to the name.
  - Editorial type on public pages, compact type in work views.
  - Dark and light themes.
  - It should look nothing like Devpost.
- **Shared components:** build `components/ui` from DESIGN.md:
  - buttons, inputs, selects, textarea
  - tabs, cards, badges, tables
  - dialogs, toasts, empty states, skeletons
  - avatar, page header, stat tile, timeline
  - evidence chip, score input
- **Accessibility:** WCAG AA contrast, full keyboard use, visible focus, a label on every input, and layouts that work down to 375px wide.
- **UI copy:** plain and short. No em dashes, no AI hype, and no AI credit lines.

## 8. Demo path and seed data

The demo path is P0. It must work end to end after `npm run demo:reset && npm run dev`, switching roles through demo sign-in:

1. **Visitor:** landing page → hackathon listing → the "Fall Builders Cohort" hiring cohort page → the "Open Build Weekend" hackathon with its winners.
2. **Company (Northwind Labs):**
   - Open the dashboard and the seeded "Founding Engineer" role intake.
   - Enroll in a cohort. A $1,000 non-refundable invoice appears.
3. **Candidate (Maya Chen):**
   - The dashboard shows cohort progress and check-ins.
   - Open the project page, then the evidence locker: commit timeline, AI transcript, decision log, and AI summary.
4. **Reviewer:**
   - Open the review queue, then the blind scoring workspace with evidence links, and submit.
   - The calibration view shows one flagged disagreement. Reconcile it.
   - Advance the candidate with a written reason.
5. **Interviewer:** run the defense interview with the identity check, script, and scorecard. The project becomes verified.
6. **Company again:**
   - Open the shortlist, then the candidate report. The view is written to the audit log.
   - Report a hire at $140,000. A $7,000 hire invoice appears.
7. **Admin:** funnel dashboard, the audit log showing the report view, the email log, and invoices.
8. **A finisher who wasn't hired:** the dashboard shows written feedback and the talent pool opt-in.

**Seed data:** fictional people and companies only (no real names or logos), with dates relative to today so the timelines look current. It includes:
- 3 hackathons:
  - a hiring cohort at the defense stage
  - a finished open hackathon with winners
  - an upcoming open hackathon
- 4 companies with 6 roles between them
- 24 candidates and 3 reviewers
- 18 projects with commits, transcripts, and decision logs
- double reviews, including one disagreement
- 6 interviews and 2 hires, with matching invoices
- audit entries and emails

## 9. The run

### Step 1: prepare
1. Do section 2 first.
2. List the installed skills and note which ones you'll use where.
3. Create `build/platform` from the PR #31 branch.
4. Read `docs/prd/PRD.md`, `docs/prd/flows.md`, `docs/research/evaluation.md`, `docs/research/verification.md`, `docs/technical-design.md`, `docs/execution-plan.md`, and `docs/designs/`.

### Step 2: foundation (you)
Build these in order and commit after each:
1. DESIGN.md (section 7).
2. The Next.js scaffold, with the stack and scripts from section 5.
3. The full Prisma schema (section 6) and the first migration.
4. The shared services, fully implemented and tested:
   - `lib/db`
   - `lib/auth`: Auth.js, the GitHub provider, demo sign-in, and a session that carries the role.
   - `lib/permissions`: `requireRole` plus `can(user, action, resource)` helpers covering every rule in 4.4.
   - `lib/audit`
   - `lib/email`: writes to EmailLog.
   - `lib/storage`
   - `lib/billing`: flat-fee and hire-fee math, invoice creation, and the non-refundable rule.
5. `components/ui` from DESIGN.md.
6. The app shell: header, role-aware navigation covering every route, footer, theme toggle, and a stub page for every route in step 3, so each builder only fills in its own routes.
7. Stubs with final props for the cross-area evidence components, exported from `components/evidence/index.ts`: CommitTimeline, TranscriptViewer, DecisionLog, CheckInHistory, EvidenceSummaryCard, EvidenceLink. Other builders can import these before the evidence builder replaces them.
8. A seed skeleton that creates one user per role.
9. Unit tests for permissions and billing, plus a Playwright smoke test that signs in through demo sign-in.
10. `docs/build/contracts.md`: route owners, data model notes, server action conventions (Zod input, permission check, audit where required, revalidatePath), shared service and component APIs, and the builder rules from step 3.
11. `docs/build/feature-map.md`: every item in 4.1 and 4.2, with its owner and priority. P0 means it's on the demo path.

The foundation is done when `install`, `typecheck`, `lint`, `test`, `build`, `db:migrate`, `db:seed`, and `e2e` all pass. Commit.

### Step 3: ten builders in parallel
Launch all ten in one message, each with worktree isolation, so each one works on its own branch off `build/platform`. Give every builder its brief below plus these rules:

- Read CLAUDE.md, DESIGN.md, `docs/build/contracts.md`, `docs/build/feature-map.md`, and the PRD and research files for your area.
- Load the frontend-design skill before writing UI. Use any other installed skill that fits your area.
- Edit only the paths you own. Never edit the Prisma schema, shared services, `components/ui`, navigation, package.json, or another builder's paths. If you need a change there, describe it exactly in your report.
- Do your P0 items first, then the rest of your area.
- Every page and action checks permissions through `lib/permissions`.
- If you run a dev server, use port 3000 plus your builder number.
- Before finishing, make sure typecheck, lint, and your unit tests pass. Commit with plain messages and no attribution.
- Report back: what works, what's stubbed, the shared changes you need (exact diffs where possible), and how to see your work in the demo.

**1. Discovery**
- Owns: `app/page.tsx`, `app/for-companies`, `app/hackathons/page.tsx`, and in `app/hackathons/[slug]/` the layout, overview, rules, prizes, schedule, judging, resources, updates, and participants; plus `components/discovery` and `lib/discovery`.
- Builds:
  - the landing page for candidates and companies
  - the for-companies page with pricing
  - the hackathon listing with search, filters, and sort
  - the hackathon layout with tabs, and every public tab
- Done when: filters work on seed data, every tab shows real data, and every empty state is designed.

**2. Participation**
- Owns: `app/hackathons/[slug]/register`, `app/hackathons/[slug]/teams`, `app/hackathons/[slug]/check-ins`, `app/dashboard`, `components/participation`, `lib/participation`.
- Builds:
  - registration with eligibility and a consent check
  - teams for open hackathons: create, invite, join, and the looking-for-teammates board
  - weekly check-ins for cohorts
  - the candidate dashboard: deadlines, check-ins due, submissions, results, feedback, and the talent pool prompt
- Done when: a candidate can register, form or skip a team, submit check-ins, and see results and feedback.

**3. Projects**
- Owns: `app/hackathons/[slug]/submit`, `app/hackathons/[slug]/projects`, `app/projects/[id]` (page and edit), `components/projects`, `lib/projects`.
- Builds:
  - a multi-step submission form (basics, story, built-with, media, links, team, review) with saved drafts
  - the project page
  - the gallery with built-with filters and winner badges
  - likes, and comments that organizers can moderate
- Done when: a submission appears in the gallery, and likes and comments work.

**4. Profiles and privacy**
- Owns: `app/u/[username]`, `app/onboarding`, `app/settings`, `components/profiles`, `lib/profiles`.
- Builds:
  - onboarding with role choice and the consent screen
  - the public profile with portfolio, wins, and verified badges
  - profile editing
  - privacy settings, including visibility and talent pool opt-in
  - data export as a JSON download, and delete requests
- Done when: consent is stored with its version and time, the export downloads the user's data, and delete requests reach admin.

**5. Organizer**
- Owns: `app/organize`, `components/organize`, `lib/organize`.
- Builds:
  - the organizer dashboard
  - creating and editing hackathons and hiring cohorts, with every field and the cohort config
  - prizes, schedule (including office hours), criteria, and resources
  - the participants table
  - updates, which are written to the email log
  - judge and reviewer assignment
  - winner selection per prize
- Done when: an organizer can set up a cohort end to end and pick winners for an open hackathon.

**6. Companies**
- Owns: `app/company` (except `app/company/billing`), `components/company`, `lib/company`, `lib/reports`.
- Builds:
  - company onboarding, profile, and team members
  - role intake with role-specific criteria
  - cohort enrollment, which creates the flat-fee invoice through `lib/billing`
  - a shortlist per role
  - the candidate report page and snapshot, with every view audited
  - talent pool browsing (opted-in candidates only)
  - interview requests
  - hire reporting, which creates the hire invoice through `lib/billing`
- Done when: demo steps 2 and 6 work.

**7. Evaluation**
- Owns: `app/review`, `app/judge`, `components/review`, `lib/review`.
- Builds:
  - the reviewer queue
  - the scoring workspace: rubric plus role criteria, an evidence panel built from `components/evidence`, an evidence link and a rationale required on every score
  - blind mode, with every reveal logged
  - the calibration view with reconciliation notes
  - advance, hold, or reject with a required reason
  - judging for open hackathons against their criteria
  - written feedback for finishers
- Done when: demo step 4 works, and no score can be saved without evidence and a rationale.

**8. Evidence**
- Owns: `app/projects/[id]/evidence`, `app/api/github`, `components/evidence` (replacing the stubs), `lib/evidence`.
- Builds:
  - repo connection and snapshots from the GitHub API, with a seeded fallback
  - the commit timeline chart, with author names masked in blind mode
  - transcript upload and a viewer with search and excerpt linking
  - the decision log editor and check-in history
  - the AI evidence summary, following the rules in 4.2
- Done when: demo step 3 works offline on seed data, and the summary falls back cleanly when no API key is set.

**9. Interviews**
- Owns: `app/interviews`, `components/interviews`, `lib/interviews`.
- Builds:
  - scheduling for advanced candidates: model, mode, time, link or location, and interviewers
  - the interviewer view with the identity check
  - the defense script, section by section, with timers
  - a scorecard per section
  - completion, which marks the project verified on a pass and feeds the results into the candidate report
- Done when: demo step 5 works.

**10. Ops**
- Owns: `app/admin`, `app/company/billing`, `components/admin`, `lib/admin`, `prisma/seed/`, `docs/build/demo-script.md`, `tests/e2e/demo-path.spec.ts`.
- Builds:
  - the admin funnel dashboard with charts
  - the audit log viewer with filters, and the email log
  - invoices with "mark paid", data requests, and settings
  - the company billing page
  - the full seed data from section 8
  - the demo script
  - a Playwright test covering all eight demo steps
- Done when: `demo:reset` loads everything and the demo-path test is written. It may fail until integration.

### Step 4: integrate and harden (you)
1. Merge the builder branches into `build/platform` one at a time, in this order: 10, 1, 4, 2, 3, 8, 7, 9, 6, 5. After each merge:
   - apply that builder's requested shared changes and migrate
   - run typecheck, lint, tests, and build
   - fix anything broken before the next merge
2. Run `npm run demo:reset`, walk the demo script in the browser, then make `tests/e2e/demo-path.spec.ts` pass.
3. Run gstack `/qa` against http://localhost:3000 as every role. Fix what it finds.
4. Run three more gstack reviews:
   - `/review` on the full diff from the PR #31 branch
   - `/cso` on auth, permissions, uploads, and the AI summary
   - `/design-review` for visual polish

   Fix every high and medium finding. Use `/investigate` on anything that survives two fixes.
5. Test permissions by hand:
   - a company can't open another company's report
   - a reviewer can't open an unassigned project
   - a candidate can't see other candidates' reviews or evidence
6. Use gstack `/browse` to save a screenshot of each demo step to `docs/build/screenshots/` for our pitch deck.
7. Final gate: typecheck, lint, test, build, and e2e all pass on `build/platform`.

### Step 5: deliver
1. **README:**
   - what Firefly is
   - setup, and every env var with its fallback (mirrored in `.env.example`)
   - `demo:reset`, running, and testing
   - the demo path
2. **`docs/build/status.md`:**
   - what works
   - what's mocked and why
   - known gaps
   - items that need a lawyer (consent text, terms, data retention)
   - what to build next
3. Run the attribution check from section 2.
4. Push `build/platform`. Open a draft PR titled "Firefly platform v1", with the PR #31 branch as its base. The body has a summary, the demo steps, how to run it, and a link to status.md, with no attribution. Don't merge and don't deploy.
5. Send us a short final message:
   - the PR link
   - the demo steps
   - what's mocked
   - the top known gaps
   - what to leave out of the pitch if anything is still shaky
   - confirmation that no commit, PR, or issue credits Claude

## 10. Definition of done

- All eight demo steps work from a fresh `demo:reset`.
- Every item in 4.1 and 4.2 works, or is listed in status.md with the reason it doesn't.
- Permissions hold for every role.
- Typecheck, lint, test, build, and e2e pass.
- No Claude attribution anywhere.
- The draft PR is open. Nothing is merged and nothing is deployed.

If time or context runs short, protect these in order: the demo path, then permissions and privacy, then Devpost parity, then the Firefly additions, then polish.
