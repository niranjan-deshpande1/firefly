# Skeptic review of PRD v0 and technical design v0

Run 2026-10-03 by the `skeptic` subagent on `docs/prd/PRD.md` v0, `docs/technical-design.md` v0, `docs/execution-plan.md`, `docs/prd/flows.md` and `docs/discovery/interview-guides.md`. The review is reproduced below, followed by what changed and what was left.

---



---

## What changed

| Objection | Change |
|---|---|
| 1. Funnel doesn't connect | One canonical funnel in PRD section 6: about 100 applicants, 40 starters, plan for 15 submissions (H5 passes at 12), shortlist up to 8, each company sees up to 4. The technical design and execution plan use the same numbers. |
| 2. Defense length vs the company ask | One length: 75 minutes plus a 10-minute scoring debrief. Shared defense (old S3) is now Must M8: one session per finalist with every interested company, one planted bug per finalist. Guide A16 now asks for 75 minutes for up to 4 finalists plus a 30-minute rating task, about 6 hours. |
| 3. H6, H9, H11 can't decide | New Must M13: each company blind-rates its shortlist mixed with 2 or 3 anonymized below-cut artifacts (candidate consent covers it). H6 now needs both the comparison and 60% "would advance", with a defined middle zone. H11 is pre-registered as "the defense predicts company verdicts better than the artifact review alone", directional only. H9 is a share of startups contacted: pass at 40%, fail below 25%, more calls in between. |
| 4. No engineering judgment in the ranking | The paid contract engineer is the second reviewer, blind to names, schools and handles. The founder reviewer isn't blind, and the PRD says so. Founder plus contractor decide who advances, with written reasons. Company criteria pick among the shortlist, which reconciles constitution 3.3.5. |
| 5. Software Musts fail manual-first | Cohort 1 runs with no custom software. M4 is the SHA on the deadline form plus a clone and bundle at the deadline. M9 is one access-limited doc per company. Software for either moves to Later, first to build for cohort 2 if cohort 1 shows it's the bottleneck. The technical design was rewritten to match (272 to 170 lines). |
| 6. Pitch demo | Leads with the scoreboard and any written A16 yeses. Shows the manual company doc as it actually runs. Dry-run material is captioned. A15 (pitch build) is removed. The pitch must fall after the dry run (new Q8). |
| 7. Labels and sources | `docs/research/hiring-practices.md` copied in from the earlier research pass. The `business-model.md` citation is gone. A7 is a RECOMMENDATION. Tech design 3.1 relabeled. |
| Other drift | The PRD declares itself canonical over flows and research on numbers, days and steps (day 8 check-in, about 20 hours). H3 wording now names the full ask and price. H7 counts a tie as a pass and notes the recruiting lead time. |
| Missing | Capacity budget added (PRD section 7: about 67 founder hours and 33 contractor hours, illustrative). Lawyer cost and timing (Q7) and pitch date (Q8) added as OPEN QUESTIONS. One canonical defense script with timings in PRD section 6. |
| Over-built | The 20-entity model became 10 sheet tabs. The reconciler, backfill, digest, admin page and triggers are gone. Stack options cut to one plus one alternative. Track A tasks are now tool setup and runbooks, about 3 days. |

## What I left, and why

- **Flat fee charged at signing.** Pricing is a founder DECISION, and the trigger is an OPEN QUESTION (P1). The PRD notes flows' suggestion to charge at shortlist delivery and makes it the fallback if H10 fails. I didn't change it.
- **Hosting every interview in person.** A founder DECISION. Its cost now shows up in the capacity budget, which is the honest consequence.
- **flows.md and the research files are unedited.** Each belongs to its subagent. The PRD declares itself canonical where they differ. A follow-up pass should bring them into line before the pitch, since judges may click through.
- **Thresholds are still unsigned.** Both founders must sign them off before call 1. That can't happen in a draft.
