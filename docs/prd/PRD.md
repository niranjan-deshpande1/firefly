# PRD: firefly MVP pilot

**v0, pre-validation.** Customer evidence today is **zero recorded calls**. This PRD can't clear the Phase 2 gate until customer interviews back it up (section 9). Only items marked DECISION are decided.

Driver: Founder A (nd) · Reviewer: Founder B · 2026-10-03

Built from: [flows](flows.md) · [evaluation](../research/evaluation.md) · [verification](../research/verification.md) · [competitors](../research/competitors.md) · [legal flags](../research/legal-flags.md) · [interview guides](../discovery/interview-guides.md) · [Batch 1 answers](../discovery/batch-1-answers.md)

**Canonical rule:** where the research files disagree on a number or a step, this PRD wins.

---

## 0. Assumptions for the founders to confirm

| ID | ASSUMPTION | Source | Risk if wrong | How to verify |
|---|---|---|---|---|
| A1 | Target: early-career software engineers (0 to 3 years), full-time, at seed to Series A startups | Kickoff default | **High.** Research says new grads were under 6% of startup hires in 2024. Our buyers may not hire this segment. | H9 |
| A2 | Team: two founders, part-time. Neither is assumed to be a senior engineering interviewer, so company interviewers and a paid contract engineer supply technical judgment. | Kickoff default | High. It decides who plants bugs and who scores the defense. | Founders state roles and hours |
| A3 | Pilot cash budget: $5,000 to $10,000, mostly prizes (illustrative) | Kickoff default | Medium | Founders state it |
| A4 | One city, whichever gives more warm access (Seattle or San Francisco) | Kickoff default | Low. California triggers the ADS rules (legal F3). | Founders pick |
| A5 | The $1,000 flat fee is charged per company per cohort | Default for an OPEN QUESTION | Medium. Paying before seeing candidates may deter companies (flows). | H10 |
| A6 | Candidates will put about 20 hours into a two-week build | Evaluation research | High. Week 2 is the likeliest drop-off point. | H4, H5 |
| A7 | Hiring startups will send someone to our in-person interviews, about 75 minutes per finalist | Interview DECISION | Medium | Guide A16 |
| A8 | Candidates keep code ownership. The brief is synthetic. Companies get view-only access. | Legal F5 | Low | Lawyer |
| A9 | Candidate reports contain only first-hand observations and are shared only after the candidate approves | Legal F1 (FCRA, California ICRAA) | **High.** Could change the report's shape. | Lawyer, before signup |

## 1. Product summary

**What it is (KNOWN):** a hackathon hosting platform that also works as a talent marketplace.
1. Early-career engineers spend **two weeks (DECISION)** building one AI-allowed project from a fixed, synthetic brief.
2. We review every submission.
3. We host in-person defense interviews **(DECISION)**. Each hiring startup co-interviews or runs the interview with our script.
4. Companies pay **$1,000 flat plus 5% of first-year salary per hire (DECISION)**.

**Core HYPOTHESIS (constitution 3.6):** the way someone builds with AI reveals meaningful information about how well they'll do in a modern software job. The pilot tests a narrower version: our two-week build plus defense picks people that startups also rate highly (H6), and the defense adds signal beyond the artifact review (H11).

**Where we're different (RESEARCHED, [competitors.md](../research/competitors.md)):** "AI allowed" no longer sets anyone apart. HackerRank, CodeSignal, Karat and CoderPad all offer it, in sessions of 20 to 60 minutes. Karat NextGen (December 2025) is the closest rival: a remote, one-hour build-and-defend. Nobody we found combines a multi-week project, an in-person defense and a hiring marketplace. **HYPOTHESIS:** that combination is worth two weeks of a candidate's time (H4, H5).

## 2. Users

| User | Role | What they need |
|---|---|---|
| Startup founder or CTO | Customer, pays | Finalists they'd advance anyway, with evidence they can check |
| Company interviewer | Co-interviews or runs the defense | A script, a rubric, about 75 minutes per finalist |
| Early-career candidate | Free user | A fair, known time ask; real interviews; written feedback and a verified project profile whether hired or not |
| Our team | Operator | Runs cohort 1 mostly by hand |

## 3. Feature spec

Pilot mode: **Hand** means forms, email, docs, spreadsheets, GitHub and calendars ([flows.md](flows.md) section 3). **Software** means something we build.

### Must have

| ID | Feature | Tests | Pilot mode |
|---|---|---|---|
| M1 | Cohort page, application with consent (versioned consent text, timestamp, method recorded) | H4, legal F2 | Hand (form tool) |
| M2 | Company agreement and role intake (job-related criteria only, salary, interview mode) | H3, H10, legal F3 | Hand (doc, e-signature, form) |
| M3 | Brief, rules, rubric and handbook published at kickoff | H5 | Hand (doc, video call) |
| M4 | **Evidence capture:** candidate-owned repo connected through a read-only GitHub App; we log when each push arrives (by our clock) and snapshot the head commit at the deadline | H11, verification layer 3 | **Software.** Manual fallback: candidates add our account as a read-only collaborator and we clone at the deadline (commit dates stay self-reported). |
| M5 | Check-ins: day 3 written plan, day 8 form plus a 2-minute recorded walkthrough, day 10 office hours. Feedback within 48 hours. | H5 | Hand (form, chat server) |
| M6 | Submission: repo, README, `DECISIONS.md`, 3 to 5 minute demo video, weekly hours log. Optional AI transcript excerpts (up to 3 sessions). | H6, H11 | Hand (form) |
| M7 | Artifact review: two blinded reviewers, rubric v0 ([evaluation.md](../research/evaluation.md) section 3), evidence note for every score, written reason for every reject | H6, H11, legal F3 | Hand (spreadsheet) |
| M8 | Defense interview, 75 minutes ([verification.md](../research/verification.md) section 3.1). In person, ID checked (logged as "checked, matched", never copied). Planted bug prepared in a disposable cloud sandbox. Scores filed independently before discussion. | H6, H11 | Hand (calendar, venue, scorecard form, Codespace) |
| M9 | **Company view:** each company sees only its own shortlist; reports show six rubric scores side by side with no total; every view is logged; a candidate approves each report before any company sees it | H6, legal F1, constitution 14 | **Software.** Manual fallback: one access-limited doc per company, with candidate approval by email. |
| M10 | Results, written feedback to every submitter, and a verified project profile | H4 (retention), constitution 4.12 | Hand (email, PDF) |
| M11 | Funnel and evidence tracker. Per candidate: funnel events, both reviewers' scores, defense scores, company verdict, hire. | All | Hand (spreadsheet) |
| M12 | Dry run before cohort 1: 2 volunteers, shortened brief, full defense. Calibrates reviewers and timings, and produces the pitch clip. | H6, H11 | Hand |

### Should have
- **S1.** A free tool credit for anyone who asks (fairness, constitution 4.13).
- **S2.** Code similarity check with Dolos. Results are flags only, never an auto-reject.
- **S3.** Shared defense: one session per finalist with every interested company in the room, then 30-minute company follow-ups (scale concern in [verification.md](../research/verification.md)).
- **S4.** A standing pool of past finishers who opt in, with a retention limit (helps with H7).

### Later
Verified profile as a public page; application-to-tracker sync; self-serve company signup; second city with verified video interviews; AI summaries of evidence for reviewers (founder approval needed, constitution 7.5).

### Do not build
| Item | Why |
|---|---|
| Automated or AI scoring, ranking, or auto-reject | Constitution 7.5. Legal F3 (California ADS rules). |
| Proctoring, screen recording, keystroke or IDE logging, browser monitoring | Conflicts with our AI-allowed stance. Triplebyte's trust lessons point the same way ([competitors.md](../research/competitors.md)). |
| Face matching or stored ID images | Biometric law. A manual check is enough. |
| HackerRank or similar tests | They add nothing over the defense ([evaluation.md](../research/evaluation.md)). |
| Running candidate code on our servers or laptops | Untrusted code. Disposable sandboxes only. |
| Any candidate payment flow | Legal F6 (employment agency rules) |
| ATS integrations, automated matching, automated payments, mobile apps | Constitution 10 |
| Company-supplied real problems | Unpaid-work and IP risk (legal F5) |

## 4. Candidate experience

Week 0: apply and get accepted. Weeks 1 to 2: build. Week 3: review. Week 4: in-person defense. Week 5: results. The step-by-step table, time costs, drop-off risks and draft wording are in [flows.md](flows.md) sections 1 and 4. What candidates are told up front is in flows section 4.2, which is **draft wording for founder approval**. It changes in one way: hours are "about 20 in total; extra hours earn no credit".

**Biggest drop-off risk:** week 2 (ASSUMPTION). The mitigations are the day-8 feedback, day-10 office hours, a known hour budget, and feedback plus a profile for everyone who submits.

## 5. Company experience

Intro, then agreement (M2), then role intake, then a weekly pool update, then the shortlist in the company view (M9), then the company picks interviewees within 3 days, then in-person defenses (co-interview or company-run), then a decision within 2 days, then offer, then a hire report and invoice. Details are in [flows.md](flows.md) section 2.

## 6. Hackathon mechanics

These settle the differences between the research files:

| Item | Setting |
|---|---|
| Length | Two weeks (DECISION) |
| Format | Solo. One fixed synthetic brief with an open product choice inside it. |
| Hours | About 20 suggested. No enforced cap. Weekly hours log. |
| Check-ins | Day 3 plan, day 8 walkthrough plus form, day 10 office hours |
| Deadline | Day 14 at a fixed time, with a 2-hour grace window. Late work gets feedback but isn't shortlisted. |
| Review | Days 15 to 19, two blinded reviewers. Founders make the advance decision, with written reasons. |
| Defense | 75 minutes. Walkthrough 12, "what breaks if" 10, live change 15, planted bug 15, fresh task 13, candidate questions 5. Then independent scoring. |
| Bug planting | Done by a paid contract engineer for cohort 1 (RECOMMENDATION; Q1) in a disposable Codespace. A different bug for each company session. |
| AI transcripts | Optional excerpts. `DECISIONS.md` is required. We never ask for whole-account exports. |

## 7. User stories and functional requirements

| Must | User story | Functional requirements |
|---|---|---|
| M1 | As a candidate, I apply and know exactly what I'm agreeing to | FR1.1 The application records consent text version, timestamp and method. FR1.2 Rules, rubric and the time ask are shown before submit. |
| M2 | As a founder, I sign up my startup and say what the role needs | FR2.1 The intake accepts job-related criteria only. FR2.2 We review the criteria for proxies such as "culture fit" before accepting. |
| M3 | As a candidate, I know the brief, rules and rubric on day 1 | FR3.1 Everything is published at kickoff and recorded for anyone who misses it. |
| M4 | As a reviewer, I trust when the work happened | FR4.1 The GitHub App has read-only access to one repo per candidate. FR4.2 Push arrival times are logged by our server clock. FR4.3 A deadline snapshot is stored. FR4.4 Nothing outside the repo or the build window is collected. |
| M5 | As a candidate, I get feedback mid-build | FR5.1 Feedback within 48 hours of the day-8 check-in. FR5.2 Anyone with no commits by day 3 gets a ping. |
| M6 | As a candidate, I submit in one step and get a receipt | FR6.1 One form. FR6.2 The receipt states review dates. |
| M7 | As a reviewer, I score fairly and consistently | FR7.1 Names and schools are hidden where possible. FR7.2 Each score has an evidence note. FR7.3 Disagreements of more than one level get a third look. FR7.4 Every reject has a written reason. |
| M8 | As a company interviewer, I run a structured defense | FR8.1 Script and rubric are sent 48 hours ahead. FR8.2 ID is logged as checked, never copied. FR8.3 Scores are filed before discussion. FR8.4 The sandbox is destroyed after the interview. |
| M9 | As a company, I see only my shortlist and the evidence | FR9.1 Each company sees only its own candidates. FR9.2 Six scores are shown with no total, next to evidence links. FR9.3 Every view is logged. FR9.4 A report becomes visible only after the candidate approves it. FR9.5 Candidates can withdraw consent, and the report is hidden immediately. |
| M10 | As a candidate who wasn't hired, I leave with something useful | FR10.1 Rubric-level feedback by day 26. FR10.2 A verified project profile. |
| M11 | As a founder, I see the funnel and the hypothesis data | FR11.1 Every funnel event is logged the same day. FR11.2 The H5, H6 and H11 fields are captured per candidate. |
| M12 | As a founder, I test the process before real candidates see it | FR12.1 The dry run produces timings, reviewer agreement and a consented clip. |

## 8. Non-functional requirements

- **Privacy.** Collect the minimum ([verification.md](../research/verification.md) section 2.4). The repo is public, so candidate data never goes in it. Each company's view is kept separate, and views are logged.
- **Security.** Candidate code is untrusted and runs only in disposable sandboxes with no real secrets. Any AI that reads submissions treats them as untrusted input (constitution 7.5). Admin access is limited to the founders.
- **Data retention (legal F4).** We keep a "hiring record" for 4 years (California rule): consent, scores, reasons, decisions. Everything else is deleted on request or 12 months after the cohort. Recordings are deleted within 90 days. A lawyer confirms all of this.
- **Human review (legal F3).** A named person makes every advance or reject decision and gives a written reason.
- **Accessibility.** Accommodations are offered at application (extra time, interview format). Documents and forms work with screen readers. The venue is accessible.
- **Recording consent (legal F2).** Opt-in, with every person present consenting (California and Washington).

## 9. Validation

Customer interviews test H1 to H4 and H7 to H10. The pilot tests H5, H6 and H11. Thresholds are proposals that both founders sign off before call 1. At n=12 they're go/no-go triggers, so they can't be quoted as rates.

| ID | Hypothesis | Pass threshold | If it fails |
|---|---|---|---|
| H1 | Startups have a costly, recent engineering hiring failure | 8 of 12. 6 or 7: run 6 more calls. | Stop and revisit the target before the pilot |
| H2 | AI has made their assessments less trustworthy | 6 of 12 | Drop the AI framing in the pitch and sell on signal quality |
| H3 | Startups commit to the pilot in writing | 3 or more | Shrink the pilot: one company, defense only |
| H4 | Candidates already do unpaid builds | 6 of 10, median 10 hours or more | Add stipends for every finisher, or shorten the suggested hours |
| H5 | Enough candidates finish two weeks | Pilot: 30% or more of starters submit | Add stipends and more check-ins. Raise build length with the founders (a DECISION, so only they can change it). |
| H6 | Companies agree with our picks | Pilot: 60% or more of finalists rated "would advance". Below 40% fails. | Rework the rubric and artifact review |
| H7 | Our timeline is no slower than theirs | Their median is 6 weeks or more | Build the standing pool (S4) before cohort 2 |
| H8 | Startups spend real money per hire today | Median $5,000 or more | Our price looks high. Revisit with the founders. |
| H9 | Buyers hire 0 to 3 year engineers | 5 or more of every startup contacted. Below 3 fails. | Change the target level, then the brief and candidate pitch |
| H10 | Startups accept $1,000 plus 5% | 2 or more of the H3 commitments | Test charging the flat fee at shortlist delivery (OPEN QUESTION P1) |
| H11 | The defense adds signal beyond the artifact review | Pilot: 25% or more of finalists move 2 or more places between the artifact ranking and the defense ranking | If the defense rarely changes rankings, the cheaper artifact review may be enough. Revisit interview length. Triplebyte's finding that project talk didn't predict success is the warning ([competitors.md](../research/competitors.md)). |

**Gate rule (RECOMMENDATION):** if H1, H3 or H9 fails, don't run the pilot as written.

## 10. Pricing

**DECISION (founders, 2026-10-03):** companies pay $1,000 flat plus 5% of first-year salary per hire. The 1% model is retired.

OPEN QUESTIONS:
- **P1.** What triggers the flat fee? Default (ASSUMPTION): per company per cohort. Flows suggests charging it at shortlist delivery.
- **P2.** How long after a candidate is introduced does a hire still count as ours? Suggested starting point: 12 months.
- **P3.** Refund or replacement if the hire leaves within 90 days
- **P4.** How "first-year salary" treats bonus and equity
- **P5.** How we learn a hire happened. Suggested: a contract clause, plus asking candidates.

## 11. Pitch demo (Must haves only)

1. **The brief and rubric** (M3, M7). Show the six dimensions and the absence of a total score.
2. **Evidence capture** (M4) on a dry-run repo: push times by our clock, and the deadline snapshot.
3. **The company view** (M9) with a sample report, captioned "Volunteer dry run. Not a candidate." Show candidate approval and the view log.
4. **A 2-minute clip from the dry-run defense** (M12): the planted-bug segment. Everyone in the room consents to the recording.
5. **The scoreboard:** calls completed against each threshold, with exact counts. If it's zero, show zero.

Say: "We think how someone defends AI-built code shows whether they can engineer with AI. This pilot tests it." Never say "predicts", "validated", "bias-free" or "compliant".

## 12. Open questions

| ID | Question | Blocks | Who answers |
|---|---|---|---|
| Q1 | Who plants bugs and builds the fresh-task bank? Recommended: a paid contract engineer. | M8, M12 | Founders |
| Q2 | City and venue | M8 | Founders |
| Q3 | Prize amounts and tool credits | M10, S1 | Founders |
| Q4 | Do candidate reports make us a consumer reporting agency (FCRA, California ICRAA)? | M9 | Lawyer |
| Q5 | Retention schedule and the license terms for submitted code | M1, M4 | Lawyer |
| Q6 | Do we build M4 and M9 for cohort 1, or run their manual fallbacks? | Execution plan | Founders |
| P1 to P5 | Pricing details | M2 | Founders |
