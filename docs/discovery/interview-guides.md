# Customer discovery interview guides

v0, 2026-10-03. Two 30-minute guides: startup founders or CTOs, and early-career candidates.

**Sign-off before call 1:** both founders approve these thresholds in writing before the first call (constitution 2.1). At n=12 these counts are go/no-go triggers. Don't quote them to judges as rates.

## Rules for the interviewer

1. **Ask about the past.** "Tell me about the last time..." Never "Would you...?" or "How much would you pay?" If someone predicts what they'd do, write it down and label it a prediction. Predictions are weak evidence.
2. **Don't pitch until the last 5 minutes.** If you describe the platform early, every answer after that is about our idea instead of their life.
3. **Ask for numbers and specifics.** Hours, dollars, weeks, which tool, which hire.
4. **Follow the energy.** If they get animated about a problem, stay there. Skip questions to make time.
5. **Note-taking:** use the template in `docs/discovery/calls/README.md`. IDs only (`S-01`, `C-01`). No names or employers in the repo.
6. **Score it the same day.** At the end of each note, mark each hypothesis below as supports, weakens, or no signal.

## Hypotheses these guides test

The same IDs are used in `docs/prd/PRD.md`, `docs/project-state.md` and the GitHub issues. All thresholds are proposals until both founders confirm them.

| ID | Hypothesis | Pass threshold (after 12 startup or 10 candidate calls) |
|---|---|---|
| H1 | Seed to Series A startups have a costly, recent failure in how they find or assess engineers. | 8 of 12 startups describe a specific failure in the last 12 months (bad hire, or a role open more than 8 weeks) **and** put hiring in their top 3 problems when asked (A13). 6 or 7 of 12: run 6 more calls before deciding. |
| H2 | AI has made their current assessments less trustworthy. | 6 of 12 describe a concrete case: a candidate who passed an assessment or take-home and then couldn't explain or extend the work. |
| H3 | Some startups will commit to a hand-run pilot. | 3 or more startups agree in writing (email is enough) to review our finalists, join shared defenses for up to 4 of them (about 6 hours in total), and pay $1,000 flat plus 5% per hire. |
| H4 | Early-career candidates already do unpaid build work to get hired, so a two-week build is a realistic ask. | 6 of 10 candidates did a take-home, hackathon, or work sample for a single employer in the last 12 months. The median of the most hours they actually spent on one is 10 or more. |
| H5 | Enough candidates finish a two-week build (DECISION: two weeks). | Interviews give direction only: whether candidates have finished a multi-day build or hackathon before, and why they dropped any. Pilot test (see PRD): 30% or more of starters submit. |
| H6 | Our cut beats chance: companies rate the people we pick above the people we don't. | Pilot only: in the blind comparison (PRD M13) companies rate shortlisted artifacts above below-cut ones, and 60% or more of finalists are rated "would advance". Below 40% fails. |
| H7 | Our timeline is no slower than how startups hire now. | Median reported time from opening a role to signed offer is 6 weeks or more (a tie with ours counts as a pass). Recruiting lead time before a cohort comes on top of ours. Our projected time is about 4 weeks from kickoff to defended finalists (two-week build, one week of review, one week of interviews) plus about 2 weeks to an offer. |
| H8 | Startups already spend real money and engineer time per early-career hire. | Median reported spend per hire (fees, tools, ads, plus engineer interview hours at $90/hr, illustrative, matching business-model.md) is $5,000 or more. This sizes pricing. It doesn't set it. |
| H9 | Seed to Series A startups actually hire engineers with 0 to 3 years of experience. Research cuts against this: new grads were under 6% of startup hires in 2024 ([hiring-practices.md](../research/hiring-practices.md)). Counted over **every startup contacted**, including those screened out. Pass: 40% or more hired someone with under 3 years of experience in the last 12 months, or have an open role for one today. Below 25%, change the target level. 25 to 39%: run 6 more calls. |
| H10 | Startups accept our price: $1,000 flat per company per cohort plus 5% of first-year salary per hire (DECISION). | 2 or more of the H3 commitments accept that price in A16. Reactions to price alone are predictions, so they count only as color. |

---

## Guide A: startup founder or CTO (30 minutes)

**Who:** a founder, CTO or engineering lead at a seed to Series A startup that hired, or tried to hire, any software engineer in the last 12 months. Don't screen on experience level: H9 needs the real base rate. If they hired only senior engineers, run sections 2 and 3 on that hire anyway.

**Keep a contact log** (outside the repo, IDs only inside it): every startup approached, how you reached them (warm intro, cold, which city), and whether they took the call. H9 and the sampling frame both depend on it.

### 1. Context (3 min)
| # | Question | Tests |
|---|---|---|
| A1 | What does the company do, and how many engineers are there today? | screening |
| A2 | How many engineers have you hired in the last 12 months? How many had 0 to 3 years of experience? | screening, H1, H9 |
| A2b | Do you have an engineering role open right now? What level is it? | H9 |

### 2. The last hire (12 min)
| # | Question | Tests |
|---|---|---|
| A3 | Walk me through the most recent engineering hire, from deciding to hire to the signed offer. | H1, H7 |
| A4 | Where did the candidates come from? Which channel produced the person you hired? | H1, H8 |
| A5 | How many weeks from opening the role to a signed offer? | H7 |
| A6 | What did you use to assess technical skill? Take-home, live coding, a tool, a trial week? | H2 |
| A7 | Roughly how many engineer hours went into interviewing for that one role? | H8 |
| A8 | What did you spend in money: agency fees, job boards, tools? | H8 |
| A9 | Did AI tools show up anywhere in the process? What did you see candidates do with them? | H2 |

### 3. When it went wrong (8 min)
| # | Question | Tests |
|---|---|---|
| A10 | Tell me about a hire in the last two years that didn't work out. What did the process miss? | H1 |
| A11 | Have you had a candidate who did well on an assessment but couldn't explain or extend their own work later? What happened? | H2 |
| A12 | What have you already tried to fix your hiring process? What did it cost, and did it work? | H1, H8 |
| A13 | Where does hiring rank among the problems you're dealing with right now? | H1 |

### 4. Reaction and commitment (5 min)
Describe the pilot in two sentences. Use the same words every call:
> "We host a two-week, AI-allowed build for early-career engineers. Then we host in-person interviews where each finalist explains their own project, changes it live, and fixes a bug we planted. You can co-interview or run the interview yourself, and you get a short written report on each finalist."

| # | Question | Tests |
|---|---|---|
| A14 | What's the first thing that worries you about that? | H3, H6 |
| A15 | What would you need to see in a finalist report to skip your own first-round screen? | H6 |
| A16 | We're running a pilot with 2 to 4 startups. We host the interviews in person, and someone from your team joins to co-interview or runs them with our script, 75 minutes per finalist, for up to 4 finalists, plus a 30-minute rating task (about 6 hours in total), and a fee of $1,000 to join the cohort plus 5% of first-year salary for each hire. Would you review our finalists and interview at least two? *If yes:* can I confirm that by email this week? | **H3 (commitment test)** |

Only a written yes to A16 counts toward H3. "Sounds interesting" does not count. A yes at the stated fee counts toward H10.

---

## Guide B: early-career candidate (30 minutes)

**Who:** a software engineer with 0 to 3 years of experience (including new grads and bootcamp grads) who looked for a job in the last 12 months.

### 1. Context (3 min)
| # | Question | Tests |
|---|---|---|
| B1 | What's your background, and how long have you been building software? | screening |
| B2 | When did you last look for a job? Are you working now? | H4, H5 |

### 2. The last search (12 min)
| # | Question | Tests |
|---|---|---|
| B3 | Walk me through your last job search. How many applications, how many interviews, how long did it take? | H4 |
| B4 | Which assessments did you do? Take-homes, timed tests, live coding, hackathons? | H4 |
| B5 | Pick the longest unpaid assignment you did for one company. How many hours did it actually take? What happened after? | H4, H5 |
| B6 | Was there an assignment you started and dropped, or refused? Why? | H5 |
| B7 | How did you use AI tools in assessments? Were you told the rules? | H2 |
| B8 | Which AI tools do you pay for, if any? | fairness (constitution 4.13) |

### 3. What felt fair or unfair (8 min)
| # | Question | Tests |
|---|---|---|
| B9 | Tell me about the assessment that felt most fair. What made it fair? | H4 |
| B10 | And the least fair? | H4 |
| B11 | After you were rejected, what feedback did you get? | candidate value (constitution 4.12) |
| B12 | Have you joined a hackathon in the last two years? What did you get out of it? | H4 |

### 4. Reaction (5 min)
Read the same two-sentence pilot description, adapted for candidates:
> "You'd spend two weeks on an AI-allowed build from a fixed prompt, then a 60-minute in-person interview where you walk us and a startup through your project, change it live, and fix a bug we planted. The strongest finalists meet 2 to 4 hiring startups."

| # | Question | Tests |
|---|---|---|
| B13 | What's your first concern? | H4 |
| B14 | During your last search, was there a two-week stretch where you could have put about 10 hours a week into one project? What else was going on? | H4, H5 |
| B15 | Can we contact you when the pilot opens? | weak signal for H4. Record it and don't count it as a pass. |

---

## After every 5 calls
Update the hypothesis issues on GitHub (and `docs/project-state.md`). Flag any hypothesis that is clearly failing. Don't wait for call 12 to change the plan.
