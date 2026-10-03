# Demo script

The eight demo steps from the build brief (section 8), click by click. Run them in order after a fresh reset; steps 4 to 6 change data the later steps rely on.

```
npm run demo:reset
npm run dev
```

Open http://localhost:3000. Switch people at `/signin` ("continue as <name>"). Sign out from the rail (desktop) or the "you" page (mobile) before switching.

`tests/e2e/demo-path.spec.ts` walks the same path.

## Seeded state the script relies on

| Fact | Seed file | Why |
|---|---|---|
| 5 demo users keep their ids: Maya Chen `demo-candidate`, Jordan Reyes `demo-company` (Northwind Labs), Priya Natarajan `demo-reviewer`, Sam Okafor `demo-organizer`, Alex Morgan `demo-admin` | `prisma/seed/people.ts` | contracts.md section 8 |
| Fall Builders Cohort (`/hackathons/fall-builders-cohort`) is a HIRING_COHORT at DEFENSE: build ended 6 days ago, defense window open now, results in 6 days | `hackathons.ts` | step 1 and the cohort timeline |
| Open Build Weekend (`/hackathons/open-build-weekend`) is COMPLETED with 3 prizes and 3 winners: best tool (Patchwork), best use of open data (Transit Gaps), best first hackathon project (Alt Text Check) | `hackathons.ts`, `review.ts` | step 1 |
| Tools for Makers Jam is the UPCOMING OPEN hackathon | `hackathons.ts` | brief section 8 |
| DECISION: a fifth hackathon, **Summer Builders Cohort** (`/hackathons/summer-builders-cohort`, COMPLETED HIRING_COHORT), is the past cohort. Theo (Shift Board, `proj-theo-summer`), Lina (Pantry Planner, `proj-lina-summer`) and Nadia (Block Map, `proj-nadia-summer`) finished it. Lina passed her defense (`interview-lina-summer`), so her project is verified and `/u/linahaddad` shows the verified badge. Lina and Nadia opted in, so Northwind's talent pool lists them. | `hackathons.ts`, `projects.ts`, `hiring.ts` | talent pool, verified badge |
| DECISION: a fourth hackathon, **Winter Builders Cohort** (UPCOMING HIRING_COHORT), exists so step 2 has a cohort to enroll in. Founding Engineer is already enrolled in Fall Builders Cohort and `enrollRoleInCohort` refuses OPEN hackathons. | `hackathons.ts` | step 2 |
| Northwind's Fall Builders Cohort invoice FF-YYYY-0001 ($1,000) is SENT, not paid | `hiring.ts` | step 7 "mark paid" |
| Maya's project "Reschedule Desk" (`/projects/proj-maya`) has Priya and Leo Park assigned. Leo's review is posted: 3 on every score except D (technical decisions) = 2, and 3 on every role criterion. Priya has no review yet. Maya has no decision. | `review.ts` | step 4 |
| DECISION: the disagreement is created live on Maya's project. Priya enters 3 everywhere except D = 4, which makes exactly one gap of 2 (dimension D). Every other seeded double review differs by at most 1, except Grace Mensah's gap on E, which already has a reconciliation note. | `review.ts` | step 4 calibration |
| DECISION: Maya's defense interview is pre-scheduled (JOINT, in person at the Firefly studio, about 3 hours after the reset, interviewers Priya and Jordan) so step 5 needs no scheduling step. It only makes sense after step 4's advance, so steps 4 and 5 must run in order. | `hiring.ts` | step 5 |
| 5 advanced Fall candidates are on the shortlists of the 3 enrolled roles; Aisha Rahman is marked HIRED for Harbor Health | `hiring.ts` | step 6 context |
| Maya is also on team Patchwork (Open Build Weekend, winner of best tool), so her profile shows a win before step 5 makes her cohort project verified | `hackathons.ts`, `projects.ts` | profile |
| Theo Grant (`cand-theo`) finished Open Build Weekend and Summer Builders Cohort, was not hired, has visible written feedback and `talentPoolOptIn = false`. The Summer project makes him eligible for the talent pool | `people.ts`, `hackathons.ts`, `projects.ts`, `review.ts` | step 8 |
| Invoice numbers FF-YYYY-0001 to 0005 are seeded; step 2 creates 0006 and step 6 creates 0007 | `hiring.ts` | step 7 |

Blind codes are derived from user ids, so they are stable: Maya is **candidate 9824**, Theo is candidate C4BF.

## Step 1. Visitor

1. Signed out, open `/`. Expect the landing page.
2. Choose "hackathons" in the nav. Expect `/hackathons` listing Fall Builders Cohort, Winter Builders Cohort, Summer Builders Cohort, Open Build Weekend and Tools for Makers Jam.
3. Open **Fall Builders Cohort**. Expect the hiring cohort overview with type "hiring cohort", the 2-week schedule (kickoff, 2 check-ins, 2 office hours, deadline, defense window, results) with times in America/Los_Angeles.
4. Back to the listing, open **Open Build Weekend**, then the prizes tab. Expect "awarded" labels: best tool (Patchwork), best use of open data (Transit Gaps), best first hackathon project (Alt Text Check).

## Step 2. Company: Northwind Labs

1. `/signin`, continue as **Jordan Reyes**. Expect `/company`, the Northwind Labs dashboard.
2. Open the **Founding Engineer** role. Expect the intake: level, description, skills, salary range $130,000 to $155,000, Seattle hybrid, and 3 criteria (ships end to end, data correctness, written communication), each with its job-related reason.
3. Enroll Founding Engineer in **Winter Builders Cohort** and confirm.
4. Expect a new invoice for **$1,000** marked **non-refundable** (FF-YYYY-0006). It also shows on `/company/billing` with status "sent".

## Step 3. Candidate: Maya Chen

1. Sign out, continue as **Maya Chen**. Expect `/dashboard` with Fall Builders Cohort progress and both weekly check-ins posted.
2. Open **Reschedule Desk** (`/projects/proj-maya`).
3. Open the evidence locker (`/projects/proj-maya/evidence`). Expect:
   - commit timeline: 8 commits, including "test: reschedule across the DST change keeps the local time"
   - AI transcripts: "designing the slot claim" and "time zones and the DST change"
   - decision log: database, double booking (AI involved), scope
   - check-in history: week 1 and week 2
   - AI summary marked as seeded (no API key needed)

## Step 4. Reviewer: Priya Natarajan

1. Sign out, continue as **Priya Natarajan**. Expect `/review` with **candidate 9824** waiting. No name, photo or school shows.
2. Open candidate 9824's scoring workspace. For every rubric dimension and role criterion, choose the score below, write a rationale, and attach one evidence link from the panel:

   | Score | Value | Suggested evidence |
   |---|---|---|
   | A comprehension and ownership | 3 | week 2 check-in |
   | B verification and handling AI errors | 3 | transcript "time zones and the DST change" |
   | C debugging | 3 | commit "test: reschedule across the DST change..." |
   | D technical decisions and tradeoffs | **4** | decision "double booking" |
   | E problem framing and product judgment | 3 | decision "scope" |
   | F working output | 3 | commit "README: who this is for..." |
   | every Founding Engineer, Backend Engineer and Data Platform Engineer criterion | 3 | any commit |

3. Post the review, then press **reveal identity**. Expect Maya Chen (written to the audit log). Priya needs this reveal before she can run the defense in step 5.
4. Open calibration for this project. Expect **one** flagged dimension: D, Priya 4 and Leo 2. Write a reconciliation note, for example "the decision log names the alternative and the downside for the lock; Leo scored before reading it. settled on 3." and save it.
5. Choose **advance** and write the reason, for example "evidence shows she catches AI errors and tests first; ready for a defense." Expect the decision saved and Maya added to the Founding Engineer shortlist.

## Step 5. Interviewer: Priya Natarajan

1. Stay as Priya. Open `/interviews`. Expect Maya Chen's defense interview, JOINT, in person at the Firefly studio.
2. Open the interview room. Confirm the identity check.
3. Work through the script: walkthrough, what breaks if, live change, planted bug, product questions. Score each section (3 or 4) with notes.
4. Complete the interview with outcome **defense passed**. Expect the project marked **verified**.

## Step 6. Company again: Jordan Reyes

1. Sign out, continue as **Jordan Reyes**. Open the **Founding Engineer** shortlist. Expect Maya Chen with a verified project.
2. Open her **candidate report**: rubric scores with evidence links, interview scorecard and the summary. The view is written to the audit log.
3. Report a hire: salary **$140,000**, a start date, confirm. Expect a **$7,000** hire-fee invoice (FF-YYYY-0007).

## Step 7. Admin: Alex Morgan

1. Sign out, continue as **Alex Morgan**. Expect `/admin`: the funnel figures (builder signups, registrations, check-ins, projects posted, reviews, advances, interviews, shortlisted, hires), a bar chart, and revenue (invoiced, paid, outstanding).
2. Open **audit log**, filter action "candidate report viewed". Expect Jordan Reyes about Maya Chen at the top, plus the seeded views.
3. Open **email log**. Expect the invoice emails from steps 2 and 6 and the decision and interview emails.
4. Open **invoices**. Expect the Winter Builders Cohort fee ($1,000, non-refundable) and Maya's hire fee ($7,000). Choose **mark paid** on FF-YYYY-0001 (Northwind, Fall Builders Cohort). Expect "paid" and a toast. Flat-fee rows have no refund action.

## Step 8. A finisher who wasn't hired: Theo Grant

1. Sign out, continue as **Theo Grant**. Expect `/dashboard` with Open Build Weekend finished and the written feedback on Grocery Split ("...handle a receipt line that two people share unevenly...").
2. Expect the talent pool prompt, linking to `/settings#talent-pool`.

## Also worth showing

| Where | What |
|---|---|
| `/admin/data-requests` | Jamal Carter's open delete request (confirm in the dialog) and Kenji Mori's export |
| `/admin/settings` | fees, attribution window and retention; changes are audited |
| `/company/billing` as Jordan | Northwind's own invoices only |
