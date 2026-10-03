Source: /plan-ceo-review (gstack 1.58.5), run by nd on 2026-10-03 against docs/prd/PRD.md v0.1. Mode: SCOPE REDUCTION. Founder answers marked DECISION were given during the review and are folded into PRD v0.2; everything else is input to planning.

# CEO review: PRD v0.1 (scope reduction)

**Verdict:** the PRD tests the right things. It carried about 10 founder hours of work that fed no hypothesis. After the cuts and the founders' answers, it's ready to take into discovery calls. It still can't clear the Phase 2 gate until H1, H3 and H9 have call evidence.

## Step 0

**Premise.** Cohort 1 exists to answer three questions:
1. Do candidates finish a two-week build? (H5)
2. Does our cut beat chance? (H6, H11)
3. Do startups commit and pay? (H3, H10)

Anything that doesn't feed one of these is a cut candidate. Settled earlier and not reopened: the full cohort over a defense-only Pilot 0, in-person interviews, the two-week length, and pricing.

**Approaches considered**

| Approach | Summary | Founder hours (illustrative) | Choice |
|---|---|---|---|
| A. Trimmed v0.1 | Cut the verified profile, day-10 office hours, S2 similarity check, S4 standing pool | about 57 before D2, 83 after | **DECISION (D1)** |
| B. v0.1 as written | All 13 Musts and 3 Shoulds | about 67 | |
| C. Trim harder | A, plus shortlist 6 and drop M13 | about 52 | Rejected: H6 could no longer fail |

## Founder answers (DECISION, 2026-10-03)

| # | Question | Answer | PRD change |
|---|---|---|---|
| D1 | Scope | Trimmed v0.1 | M10 profile, day-10 office hours, S2 and S4 moved to Later |
| D2 | Second reviewer and bug planter | **Founders.** The company intake must ask for: domain knowledge, behavioral characteristics, number of expected offers, a detailed job description, and other traits. | A2, M2, M7, section 6 and section 7 rewritten. Contract engineer removed. Intake answers are reviewed for job-relatedness (legal F3). |
| D3 | When the $1,000 is charged | At signing, per company per cohort | Section 11. P1 closed. |
| D4 | Pitch timing | Not a planning input. The pitch competition is the morning of 2026-10-04. | Pitch timing removed. The demo uses only material that exists today. |
| D5 | Under-delivery | The number of finalists is proportional to expected offers. The $1,000 is flat. A hire who leaves within 90 days is replaced free. | Section 11. P3 closed. |

## Review sections

| # | Section | Finding |
|---|---|---|
| 1 | Architecture | No custom software in cohort 1. The flow is form, then sheet, then review, then defense, then company doc. No issues. |
| 2 | Error and rescue | The technical design's failure tables cover the evidence and company-doc flows. Gap found: under-delivery after paying at signing. Resolved by D5. |
| 3 | Security and threat | The public repo holds no candidate data. Isolation is one doc per company. Blind review only works if the blind founder never opens the tracker. Noted in M7. |
| 4 | Edge cases | A company expecting 0 offers gets no finalists, so it shouldn't sign (intake screens for it). A candidate can approve one company and decline another (M9 is per company). Withdrawal is handled. |
| 5 | Code quality | Not applicable: no code. |
| 6 | Tests | The M12 dry run is the end-to-end test. TQ1 and TQ2 are tested before it. No issues. |
| 7 | Performance | Founder capacity is the bottleneck: about 83 hours per cohort, both founders combined (illustrative). First lever: a shortlist of 6. |
| 8 | Observability | The sheet plus a weekly founder check. No issues. |
| 9 | Rollout | Gated by kickoff go/no-go (40 starters, 3 partners) and review go/no-go (6 finalists). No issues. |
| 10 | Long-term trajectory | Manual first. Build evidence capture or the company view for cohort 2 only if cohort 1 shows that step is the bottleneck. The column names already match the later tables. |
| 11 | Design and UX | No custom screens. Candidate-facing and company-facing wording still needs founder approval before use. |

**Outside voice** (independent model challenge): skipped. The skeptic subagent already ran an adversarial pass on v0 ([review-v0.md](../prd/review-v0.md)).

## Failure modes registry

| Flow | Failure | Handled? | User sees |
|---|---|---|---|
| Submission | SHA missing, wrong, or not in clone | Yes (tech design 3.1) | Email from founder |
| Company doc | Shared with the wrong company | Yes (tech design 3.2) | Candidate told, doc unshared |
| Funnel | Under 12 submissions | Yes (H5 middle zone; D5 proportional delivery) | Fewer finalists per company |
| Ranking | A CTO doubts a founder-made shortlist | Partly (company co-interviews, M13 blind comparison) | Packet shows evidence links next to every score |
| Capacity | Founders short on hours | Yes (shortlist to 6) | Fewer defenses |

Critical gaps: 0.

## Not in scope (deferred to PRD Later)

- Verified project profile: candidates still get written rubric feedback.
- Day-10 office hours: day-8 feedback covers mid-build help.
- Dolos similarity check: the defense carries verification.
- Standing pool: first to build if H7 fails.
- Contract engineer: the founders review and plant bugs (D2).

## Still open for founders

1. Founder hours: confirm about 40 hours each over the 5-week cohort.
2. Wording of the intake questions, especially "behavioral characteristics". It goes to the lawyer with the agreement (legal F3).
3. Q2 to Q7 and P2, P4 and P5 in PRD section 13.

## GSTACK REVIEW REPORT

| Review | Runs | Status | Findings |
|---|---|---|---|
| CEO review (SCOPE REDUCTION) | 1 | clean | 5 founder decisions, 4 items cut to Later, 1 gap closed (under-delivery) |

VERDICT: PRD v0.2 is ready for discovery calls. The Phase 2 gate waits on call evidence.

NO UNRESOLVED DECISIONS
