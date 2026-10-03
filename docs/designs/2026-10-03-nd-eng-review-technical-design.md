Source: /plan-eng-review (gstack 1.58.5), run by nd on 2026-10-03 against docs/technical-design.md v0.1. Founder answers marked DECISION were given during the review and are folded into the technical design, PRD v0.2 and execution plan v0.2.

# Engineering review: technical design v0.1

**Verdict:** right-sized. Cohort 1 runs on forms, sheets, docs, GitHub and Codespaces with no custom code, which fits a 40-person pilot. Two claims in the design weren't true as built: blind review and the company view log. Both are fixed below.

## Step 0: scope

- **Existing tools cover every job.** Forms, Sheets, Docs, Dropbox Sign, Cal.com, Stripe Invoicing and Codespaces.
- **Complexity check:** no new services, no code, so it doesn't trigger.
- **Later software sketch** (GitHub App, row-level security): kept as a sketch only. Nothing gets built without its own APPROVED after cohort 1.

## Findings

| # | Section | Finding | Decision |
|---|---|---|---|
| E1 | Architecture (security) | Blind review wasn't blind. A Google Sheet can't hide a tab from anyone who can open the file, and git history carries commit author names and emails. | **DECISION:** a separate review sheet keyed by candidate_id, plus a `git archive` export of the submitted SHA (no history) for the blind founder. Candidates are asked to keep their name out of the README. |
| E2 | Architecture (data access) | The company view log can't be built on our plan. RESEARCHED: Drive's Activity dashboard isn't in Business Starter and doesn't track people outside our Workspace ([Google admin help](https://support.google.com/a/answer/7573825), accessed 2026-10-03). | **DECISION:** keep a share log (who could see each report) instead, and say so in the PRD. TQ1 closed. |
| 2 | Code quality | Not applicable: no code in cohort 1. | None |
| 3 | Tests | The M12 dry run is the end-to-end test. Added: check that the blind export carries no name. | Folded into the execution plan |
| 4 | Performance | Not applicable at about 40 repos. Founder hours are the real limit (PRD section 7). | None |

**Outside voice:** skipped. The skeptic subagent already reviewed the design adversarially ([review-v0.md](../prd/review-v0.md)).

## Failure modes

| Flow | Failure | Handled? | Seen by |
|---|---|---|---|
| Blind review | A name shows up in the README or the code | Partly. Candidates are asked not to; if it happens, the reviewer notes it. | Reviewer |
| Company report | Shared with the wrong company | Yes (technical design 3.2) | Candidate and founders |
| Company report | A viewer forwards a screenshot | No technical control; the contract bars it | Nobody, until it surfaces |
| Deadline clone | SHA missing or not in the clone | Yes (technical design 3.1) | Candidate, by email |

Critical gaps: 0. The screenshot risk is accepted and noted in the consent text (founder wording).

## Not in scope

- Any custom software in cohort 1.
- A true per-person view log. It comes back with the cohort 2 company view, if that gets built.

## GSTACK REVIEW REPORT

| Review | Runs | Status | Findings |
|---|---|---|---|
| Eng review | 1 | clean | 2 issues found, 2 folded in (blind review, view log) |

VERDICT: the technical design is approved for review by both founders as the cohort 1 manual setup.

NO UNRESOLVED DECISIONS
