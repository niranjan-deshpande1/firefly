# Flows: candidate journey, company journey, screens, hackathon

Draft v0.1, 2026-10-03. Owner: product-designer. Labels follow constitution 2.1.

**Bottom line (RECOMMENDATION):** run the whole first cohort by hand on existing tools (forms, email, a chat server, GitHub, spreadsheets, a booking link). No screen needs custom software for cohort 1. The step most likely to lose candidates is the middle of the build (days 4 to 10), so the design spends its effort there: a fixed prompt, a stated hour budget, a week-1 check-in that gives feedback, and a clear promise of what every finisher gets.

**Inputs used:**

| Input | Label |
|---|---|
| Two-week build | DECISION (founders, 2026-10-03) |
| $1,000 flat fee per company per cohort, plus 5% of first-year salary per hire | DECISION (fee amounts); per-cohort trigger is ASSUMPTION |
| We host and facilitate every interview in person; each startup co-interviews or runs it entirely | DECISION (founders, 2026-10-02) |
| Hackathon hosting platform plus talent marketplace | KNOWN |
| Early-career engineers (0 to 3 years), full-time, seed to Series A | ASSUMPTION |
| One city | ASSUMPTION |
| Zero customer or candidate calls | KNOWN. Every drop-off rating below is therefore ASSUMPTION. |

**Wording note:** every quoted line meant for candidates or companies is marked **[DRAFT, founder approval]** (constitution 12).

## 1. Candidate journey

Cohort timeline (RECOMMENDATION): week 0 apply and accept, weeks 1 to 2 build, week 3 review and shortlist, week 4 in-person interviews, week 5 offers and results to everyone.

| # | Step | What they do and see | What we need from them | What they get back | Time cost | Drop-off risk (ASSUMPTION) |
|---|---|---|---|---|---|---|
| 1 | Discovery | Find a one-page cohort description via a post, school group, or referral | Nothing | Dates, prompt style, hour budget, how judging works, which companies are hiring, what non-hired finishers get | 3 min | High. Unknown brand, two-week ask. |
| 2 | Application | Fill one short form | Name, email, city, GitHub link, years of experience, work authorization, availability for both weeks and interview week, consent to rules | Confirmation email with the rules doc | 10 min | Medium |
| 3 | Acceptance | Get an accept or waitlist email within 3 days | Reply "I'm in" | Kickoff time, chat server invite, rules | 2 min | Medium. Silence between steps 2 and 3 loses people. |
| 4 | Kickoff | Join a 45 min video call | Attendance, or watch the recording within 24 hours | The prompt, the rubric, Q&A | 45 min | Low |
| 5 | Build, week 1 | Build solo with any AI tools | Push commits to a public or shared GitHub repo | Help channel answers within one business day | 10 to 15 h (RECOMMENDATION) | Medium |
| 6 | Week-1 check-in | Submit a 3-question form plus a 2-min video or 15-min call | Progress, one decision made, one blocker | Short written feedback within 48 h | 20 min | Low, and it reduces later drop-off |
| 7 | Build, week 2 | Keep building | Commits | Office hours, reminder emails | 10 to 15 h | **Highest.** Work, school, or a stalled build pushes people out here. |
| 8 | Submission | Submit one form by the deadline | Repo link, 3-min demo video, one-page decision log | Receipt email with review dates | 1 to 2 h | Medium. Demo video and log feel like extra work. |
| 9 | Evaluation | Wait | Nothing | Status email on review day 3 | 0 | Medium. Silence reads as rejection. |
| 10 | Shortlist and matching | Get told which companies want to interview them | Yes or no per company; ID at the interview | Interview slot options | 10 min | Low for those picked |
| 11 | Defense interview | Attend in person, 60 to 90 min at our venue | Show up, walk through code, make a live change, fix a planted bug | Same-week thank-you; decision by a stated date | 2 to 3 h incl. travel | Low to medium (travel, scheduling) |
| 12 | Offer | Get offer from the company directly | Tell us if they accept | Our help with questions about the process | Varies | Owned by the company |
| 13 | Hire | Start the job | Tell us the start date (consented) | A 90-day check-in from us | 5 min | Low |

**Steps cut (RECOMMENDATION):**
- **Separate qualification test (HackerRank or similar).** It adds hours before the build and its signal overlaps with the build and the defense (constitution 4.7). Application questions replace it.
- **Separate "ranking" step shown to candidates.** Candidates see one outcome: shortlisted or not, with feedback. A visible rank adds anxiety and no value.
- **Separate "startup matching" step.** Folded into the shortlist (step 10). We match by hand.

## 2. Company journey

| # | Step | What they do and see | What we need from them | What they get back | Time cost | Drop-off risk (ASSUMPTION) |
|---|---|---|---|---|---|---|
| 1 | Discovery | Warm intro, one-page pitch | Nothing | How it works, timeline, price | 5 min | High. Zero calls so far (KNOWN). |
| 2 | Intro call | 30 min call with a founder | Current hiring pain, open role, start date | A yes or no on fit for this cohort | 30 min | Medium |
| 3 | Agreement | Sign a short agreement | Signature; the flat fee per the agreement terms | Signed copy, cohort dates | 15 min | **Highest company step.** Paying $1,000 before seeing a candidate. |
| 4 | Role intake | One form: role, must-have skills, salary range, interview availability, model choice (co-interview or run it) | Job-related criteria only, written down (constitution 4.10) | Our edit-back of the criteria within 2 days | 30 min | Low |
| 5 | Hackathon setup | Read the shared prompt and rubric; optionally suggest a theme | Optional feedback | Final prompt and rubric | 15 min | Low |
| 6 | Candidate pool | Get a weekly email with counts (applied, building, checked in) | Nothing | Visibility | 2 min/week | Low |
| 7 | Evaluation and shortlist | Get a shortlist doc: 3 to 8 candidates with project links, decision log, our evidence notes | Pick who to interview within 3 days | Candidate packets | 1 to 2 h | Medium. A slow pick stalls candidates. |
| 8 | Interviews | Attend in person at our venue (co-interview or run it) | 1 to 2 engineers for half a day; a scorecard per candidate | Our facilitation notes; candidate ID checked | 4 h | Medium (calendar) |
| 9 | Offer | Make offers directly | Tell us who got an offer | Our help closing if wanted | Varies | Low |
| 10 | Hire | Candidate accepts | Start date and first-year salary | Confirmation | 5 min | Low |
| 11 | Payment | Pay the 5% invoice | Payment per agreement terms | Receipt; 90-day check-in | 10 min | Low to medium (attribution disputes, constitution 9) |

**Steps cut or merged (RECOMMENDATION):** "hiring requirements" and "candidate criteria" are one intake form. "Hackathon setup" is ours; the company only reviews.

## 3. Screen list and pilot mode

"By hand" means a form, email, doc, spreadsheet, or existing tool run by a founder. RECOMMENDATION throughout.

### Candidate side

| Screen | Purpose | Pilot mode | Reason |
|---|---|---|---|
| Cohort page | Pitch, dates, rules summary, FAQ | By hand (one-page site builder or public doc) | Static text; no logic |
| Application | Collect step 2 fields and consent | By hand (form tool) | Form tools cover this fully |
| Accept/waitlist | Decision and next steps | By hand (email template) | Under ~100 applicants (ASSUMPTION) |
| Rules and handbook | Rules, rubric, timeline, what you get | By hand (shared doc) | Text that will change after cohort 1 |
| Kickoff | Prompt reveal, Q&A | By hand (video call + recording) | Live is the value |
| Help channel | Questions, announcements | By hand (chat server) | Existing tool |
| Check-in | Week-1 progress | By hand (form + video link) | Three fields |
| Submission | Repo, demo, decision log | By hand (form; repo on GitHub) | GitHub already stores code and history (constitution 14) |
| Interview booking | Pick a slot | By hand (booking link tool) | Existing tool |
| Results and feedback | Outcome and written feedback | By hand (email + doc) | Feedback is written by people anyway |
| Verified project profile | Shareable proof of finishing and defense | By hand (one-page doc or PDF per finisher) | **First software candidate** once finishers exceed ~30 per cohort (ASSUMPTION) |

### Company side

| Screen | Purpose | Pilot mode | Reason |
|---|---|---|---|
| Company pitch | How it works, price | By hand (one-pager) | Static |
| Agreement | Terms, fee | By hand (doc + e-signature tool) | Needs lawyer review first, so stays a doc |
| Role intake | Criteria, salary, availability | By hand (form) | We edit criteria with them; a form is enough |
| Pool updates | Funnel counts | By hand (weekly email from the tracker) | 2 to 4 companies (constitution 10) |
| Shortlist packet | Candidate evidence | By hand (one doc per company, access-limited) | Keeps each company's view separate (constitution 14) |
| Interview scorecard | Structured notes | By hand (form per interviewer) | Same rubric for both models |
| Hire report and invoice | Attribution and payment | By hand (email + invoicing tool) | Under 10 hires per cohort (ASSUMPTION) |

### Our team

| Screen | Purpose | Pilot mode | Reason |
|---|---|---|---|
| Cohort tracker | Every candidate, status, funnel events | By hand (spreadsheet) | Measures the funnel from day one (constitution 14) |
| Review sheet | Rubric scores with evidence links | By hand (spreadsheet, two reviewers) | Lets us measure reviewer agreement |
| Interview schedule | Rooms, slots, companies | By hand (calendar) | One venue, one week |

**What moves to software first, when manual becomes the bottleneck (RECOMMENDATION):** (1) verified project profile, (2) company shortlist view, (3) application-to-tracker sync. None is needed to test the core thesis in cohort 1.

## 4. The two-week hackathon

### 4.1 Format (RECOMMENDATION unless labeled)

| Choice | Pick | Why |
|---|---|---|
| Solo or team | Solo | Teams blur individual signal (constitution 7.6) |
| Prompt | One fixed, synthetic prompt for the cohort with room for product choices | Fair comparison; avoids unpaid work on a company's real problem (constitution 4.4) |
| Hours | Stated budget of 20 to 30 hours total | Early-career people with jobs or classes need a known ceiling. OPEN QUESTION: right number. |
| AI tools | Any tool allowed; disclose which ones in the decision log | Constitution 3.7. Tool access equity (4.13) is an OPEN QUESTION. |
| Code ownership | Candidate keeps full ownership | Removes the unpaid-labor objection. Needs lawyer review. |
| Process data | Git history plus a one-page decision log. AI transcripts optional. | Minimum data (constitution 14). Requiring transcripts needs founder approval (constitution 12). |

### 4.2 What candidates are told up front **[DRAFT, founder approval]**

On the cohort page, the application confirmation, and at kickoff:

1. "You'll build one project, alone, over two weeks. Plan on 20 to 30 hours total."
2. "Use any AI tools you like. We care how well you use them and whether you understand what you built."
3. "We judge on: does it work, the decisions you made and why, how you used AI, and how well you can explain and change your code. The full rubric is in the handbook."
4. "Two people review every submission. A person makes every advance decision. No automated scoring."
5. "If you're shortlisted, you'll do a 60 to 90 minute in-person interview at [venue] in [week]. You'll walk through your code, make a live change, and fix a bug we add. Bring photo ID."
6. "You own your code. Companies see it only to evaluate you."
7. "Everyone who submits gets written feedback and a verified project profile by [date], hired or not."
8. "Hiring companies this cohort: [list]. Roles are full-time, early-career."

### 4.3 Kickoff (day 1)

1. 45 min video call: welcome (5), the prompt (10), rubric and rules (10), timeline and what you get (5), Q&A (15).
2. Recording and handbook link posted in the help channel within an hour.
3. Each candidate replies in the channel with their repo link by end of day 2. This is the first funnel event after kickoff.

### 4.4 Weekly check-ins

| When | What candidates do | What we do | Why |
|---|---|---|---|
| Day 3 | Nothing required; reminder email | Ping anyone with no commits | Catch silent dropouts early |
| Day 7 (week-1 check-in) | 3-question form: what works so far, one decision and why, one blocker. Plus a 2-min video or a 15-min call slot. | Write 3 to 5 lines of feedback within 48 h | Process evidence (constitution 8 layer 3) and the main retention lever |
| Day 10 | Optional 1 h office hours | Answer questions live | Week-2 is the highest drop-off point |
| Day 13 | Reminder of submission contents and deadline | Confirm everyone's repo link works | Fewer broken submissions |

**[DRAFT, founder approval]** Day 7 email: "Halfway there. Send us three quick answers and a 2-minute video by [time]. You'll get feedback from us within two days."

### 4.5 Submission (end of day 14)

1. One form: repo link, 3-min demo video link, one-page decision log (what you built, three key decisions and why, where AI helped and where it was wrong, what you'd do next).
2. Deadline is a fixed time with a 2-hour grace window (RECOMMENDATION). Late submissions get feedback and are not shortlisted.
3. Receipt email states review dates and when they'll hear back.

### 4.6 Review and defense-interview scheduling (week 3 to 4)

1. Days 15 to 19: two reviewers score each submission on the rubric with evidence links. Disagreements over one level get a third look.
2. Day 18: status email to all submitters ("review in progress, you'll hear by [date]").
3. Day 19: each company gets its shortlist packet and picks interviewees within 3 days.
4. Day 22: shortlisted candidates get a booking link with slots in week 4, at one venue, in one city.
5. Week 4: in-person defense interviews. We facilitate every one. The company either co-interviews or runs it, per its intake choice. We check ID on arrival.
6. Each interviewer fills a scorecard the same day.

### 4.7 Results (week 5)

| Group | What they get | When |
|---|---|---|
| Interviewed, offer | Offer from the company; our congratulations and a request to tell us if they accept | Company's timeline, target within 5 days of the interview |
| Interviewed, no offer | Written feedback from the interview plus everything below | Within 7 days of the interview |
| Submitted, not shortlisted | Written feedback against the rubric (3 to 5 lines per dimension), verified project profile, opt-in to a standing pool for future companies | Day 26 |
| Didn't submit | A short note, an invite to the next cohort | Day 16 |
| Top 3 submissions | Prize (amount OPEN QUESTION; budget ASSUMPTION $5,000 to $10,000 total) | Day 26 |

**[DRAFT, founder approval]** Not-shortlisted email opener: "Thanks for building with us. You weren't shortlisted this cohort. Here's specific feedback on your project, and your verified project profile you can share with any employer."

## 5. Implications for the PRD

1. The PRD's MVP scope for cohort 1 should contain zero custom screens. Every screen above runs on existing tools. Software work starts with the verified project profile when volume justifies it.
2. Retention during week 2 is the metric to watch. Add a funnel metric: started (repo link posted) to submitted. RECOMMENDATION: set a pass threshold before the cohort (for example, 50%, illustrative).
3. Feedback for every submitter is a real cost: about 20 to 30 min per submission per reviewer (ASSUMPTION). Budget reviewer hours in the PRD.
4. The rubric must exist before kickoff, since candidates see it on day 1.
5. Interview week needs a venue, ID check steps, and a facilitator script for both models (co-interview and company-run).
6. Company drop-off peaks at signing and paying before seeing candidates. The PRD should state when the $1,000 is due.
7. The standing pool needs consent and a retention limit, since it keeps candidate data past the cohort.
8. Week-1 check-in feedback means founders must be available days 7 to 9. Put it on the ops calendar.

## 6. Open questions

1. When is the $1,000 flat fee due: at signing, at kickoff, or at shortlist delivery? Recommended: at shortlist delivery, to lower the signing barrier. Founder decision.
2. What hour budget do we state? Recommended: 20 to 30 hours. Test with 3 to 5 candidate interviews.
3. Are AI transcripts required, optional, or not collected? Recommended: optional. Founder decision (new personal data).
4. Prize amounts and count? Recommended: top 3, within the $5,000 to $10,000 budget ASSUMPTION. Founder decision (spending).
5. Do we provide AI tool credits to level access (constitution 4.13)? Recommended: offer a small credit to anyone who asks. Founder decision (spending).
6. Which city and venue? Blocks interview week. Founder decision.
7. Who writes candidate feedback, given neither founder is assumed to be a senior engineering interviewer? Recommended: founders write rubric-based feedback; company interviewers add interview feedback.
8. Is the standing pool part of cohort 1? Recommended: yes, opt-in only, 12-month retention.
9. All quoted wording in sections 4.2, 4.4, and 4.7 needs founder approval and, for rules and ownership, lawyer review.
