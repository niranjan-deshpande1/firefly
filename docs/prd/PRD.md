# PRD: firefly MVP pilot

**v0.2, pre-validation.** Customer evidence today is **zero recorded calls**. This PRD can't clear the Phase 2 gate until customer interviews back it up (section 10). Only items marked DECISION are decided. v0.1 folded in the skeptic review ([review-v0.md](review-v0.md)). v0.2 folds in the founders' answers to the CEO review ([designs](../designs/)).

Driver: Founder A (nd) · Reviewer: Founder B · 2026-10-03

Built from: [flows](flows.md) · [evaluation](../research/evaluation.md) · [verification](../research/verification.md) · [competitors](../research/competitors.md) · [hiring practices](../research/hiring-practices.md) · [legal flags](../research/legal-flags.md) · [interview guides](../discovery/interview-guides.md) · [Batch 1 answers](../discovery/batch-1-answers.md) · [technical design](../technical-design.md)

**Canonical rule:** where flows, research, the technical design or the execution plan disagree with this PRD on a number, a day or a step, this PRD wins. Superseded details include flows' "20 to 30 hours", flows' day-7 check-in, the research files' defense orders and lengths, and the guide's earlier 60-minute ask.

---

## 0. Assumptions for the founders to confirm

| ID | ASSUMPTION | Source | Risk if wrong | How to verify |
|---|---|---|---|---|
| A1 | Target: early-career software engineers (0 to 3 years), full-time, at seed to Series A startups | Kickoff default | **High.** New grads were under 6% of startup hires in 2024 (RESEARCHED, [hiring-practices.md](../research/hiring-practices.md)). | H9 |
| A2 | Team: two founders, part-time. **The founders review every submission, plant the bugs and build the fresh-task bank** (DECISION, CEO review 2026-10-03). No contract engineer. | Founders | High. A CTO may ask why to trust a founder-made shortlist. Mitigation: company engineers co-interview in every defense, and M13 tests our cut against their blind ratings. | Founders state roles and hours |
| A3 | Pilot cash budget: $5,000 to $10,000, mostly prizes (illustrative). **It doesn't yet cover a lawyer.** | Kickoff default | Medium | Founders state it (Q7) |
| A4 | One city, whichever gives more warm access (Seattle or San Francisco) | Kickoff default | Low. California triggers the ADS rules (legal F3). | Founders pick |
| A5 | The $1,000 flat fee is charged per company per cohort, at signing (DECISION, CEO review 2026-10-03) | Founders | Medium. Flows rates paying before seeing anyone as the biggest company drop-off. | H3, H10 |
| A6 | Candidates will put about 20 hours into a two-week build | Evaluation research | High. Week 2 is the likeliest drop-off. | H4, H5 |
| A7 | Companies give about 6 hours per cohort: a 75-minute shared defense for each of up to 4 finalists, plus a short blind-rating task (M13) | Interview DECISION plus a RECOMMENDATION on length | Medium | Guide A16 states exactly this |
| A8 | Candidates keep code ownership. The brief is synthetic. Companies get view-only access. | Legal F5 | Low | Lawyer |
| A9 | Reports hold only first-hand observations and are shared only after the candidate approves | Legal F1 (FCRA, California ICRAA) | **High** | Lawyer, before signup (Q4) |

## 1. Product summary

**What it is (KNOWN):** a hackathon hosting platform that also works as a talent marketplace.
1. Early-career engineers spend **two weeks (DECISION)** building one AI-allowed project from a fixed, synthetic brief.
2. We review every submission.
3. We host in-person defense interviews **(DECISION)**. Each hiring startup co-interviews or runs the interview with our script.
4. Companies pay **$1,000 flat plus 5% of first-year salary per hire (DECISION)**.

**Cohort 1 runs with no custom software (RECOMMENDATION).** Every step uses forms, email, docs, spreadsheets, GitHub and calendars. Under manual-first (constitution 2.4), neither software piece earns its place yet:
- **Evidence capture:** a commit SHA in the deadline form pins exactly what was submitted.
- **Company view:** a founder can keep 2 to 4 companies separate by hand.

Both are the first things to build if cohort 1 shows the manual version is the bottleneck (section 3, Later).

**Core HYPOTHESIS (constitution 3.6):** the way someone builds with AI reveals meaningful information about how well they'll do in a modern software job. The pilot tests a narrower version:
- startups rate our finalists above people below our cut (H6)
- the defense predicts company verdicts better than the artifact review alone (H11)

**Where we're different (RESEARCHED, [competitors.md](../research/competitors.md)):** "AI allowed" no longer sets anyone apart. Karat NextGen (December 2025) runs a remote, one-hour build-and-defend. Nobody we found combines a multi-week project, an in-person defense and a hiring marketplace. **HYPOTHESIS:** that combination is worth two weeks of a candidate's time (H4, H5).

## 2. Users

| User | Role | What they need |
|---|---|---|
| Startup founder or CTO | Customer, pays | Finalists worth advancing, with evidence they can check |
| Company interviewer | Co-interviews or runs the defense | One script, one rubric, about 6 hours per cohort |
| Early-career candidate | Free user | A fair, known time ask; real interviews; written feedback whether hired or not |
| Our team | Operator | Runs cohort 1 by hand, within the capacity budget in section 7 |

## 3. Feature spec

Everything in cohort 1 is run by hand.

### Must have

| ID | Feature | Tests | How cohort 1 runs it |
|---|---|---|---|
| M1 | Cohort page, application with consent (versioned consent text, timestamp, method recorded) | H4, legal F2 | Form tool |
| M2 | Company agreement and role intake. The intake asks for: domain knowledge wanted; behavioral characteristics wanted; how many offers they expect to make; a detailed job description; other traits beyond the job description; salary range; interview mode (co-interview or run it). We review every answer for job-relatedness before use. Expected offers sets how many finalists that company sees. | H3, H10, legal F3 | Doc, e-signature, form |
| M3 | Brief, rules, rubric and handbook published at kickoff | H5 | Doc, video call |
| M4 | **Evidence pinning:** the repo is public or shared read-only with us. The deadline form collects the final commit SHA. We clone at the deadline and check the SHA matches. Push times are context only, since they don't prove who wrote the code. | Verification layer 3 | Form plus clone ([technical-design.md](../technical-design.md)) |
| M5 | Check-ins: day 3 written plan, day 8 form plus a 2-minute recorded walkthrough. Feedback within 48 hours. | H5 | Form, chat server |
| M6 | Submission: repo and final SHA, README, `DECISIONS.md`, 3 to 5 minute demo video, weekly hours log. Optional AI transcript excerpts (up to 3 sessions). | H6, H11 | Form |
| M7 | Artifact review: **both founders score every submission independently.** The founder not running operations that week reviews without names, schools or GitHub handles; the other isn't blind, and we say so. Rubric v0 ([evaluation.md](../research/evaluation.md) section 3). An evidence note for every score. | H6, H11, legal F3 | Spreadsheet |
| M8 | **Shared defense, 75 minutes, one per finalist**, with every interested company in the room. One planted bug per finalist, prepared in a disposable cloud sandbox. ID checked and logged as "checked, matched", never copied. Scores filed independently before discussion. | H6, H11 | Calendar, venue, scorecard form, Codespace |
| M9 | **Company packet:** one access-limited doc per company. Six rubric scores side by side with no total, plus evidence links. Shared only after the candidate approves by email. Views checked in the doc's activity log (technical design TQ1). | H6, legal F1 | Docs and email |
| M10 | Results and written rubric feedback to every submitter | H4 (retention), constitution 4.12 | Email |
| M11 | Funnel and evidence tracker. Per candidate: funnel events, both reviewers' scores, defense scores, company verdict, hire. | All | Spreadsheet |
| M12 | Dry run before cohort 1: 2 volunteers, shortened brief, full defense. Calibrates reviewers and timings. | H6, H11 | By hand |
| M13 | **Below-cut comparison:** each company blind-rates the artifacts of its shortlisted candidates mixed with 2 or 3 anonymized below-cut submissions (candidate consent covers this) | H6 | Doc plus form |

### Should have
- **S1.** A free tool credit for anyone who asks (fairness, constitution 4.13).

### Later
1. **First to build, for cohort 2, only if manual was the bottleneck:**
   - **Evidence capture:** a read-only GitHub App logging push times by our clock
   - **Company view:** per-company isolation in the database and a logged read, which needs the lawyer's FCRA answer first

   Designs are in [technical-design.md](../technical-design.md).
2. Verified project profile (cut from M10 in the CEO review); code similarity check with Dolos (was S2); a standing pool of past finishers (was S4, first to build if H7 fails); application-to-tracker sync; self-serve company signup.
3. Second city with verified video interviews; AI summaries of evidence for reviewers (founder approval needed, constitution 7.5).

### Do not build
| Item | Why |
|---|---|
| Any custom software for cohort 1 | Manual-first; nothing in the pilot needs it |
| Automated or AI scoring, ranking, or auto-reject | Constitution 7.5. Legal F3. |
| Proctoring, screen recording, keystroke or IDE logging, browser monitoring | Conflicts with our AI stance and costs candidate trust ([competitors.md](../research/competitors.md)) |
| Face matching or stored ID images | Biometric law |
| HackerRank or similar tests | They add nothing over the defense |
| Running candidate code anywhere except a disposable sandbox | Untrusted code |
| Any candidate payment flow | Legal F6 |
| ATS integrations, automated matching, automated payments, mobile apps | Constitution 10 |
| Company-supplied real problems | Legal F5 |

## 4. Candidate experience

Week 0: apply and get accepted. Weeks 1 to 2: build. Week 3: review. Week 4: in-person defense. Week 5: results. The step-by-step table, time costs, drop-off risks and draft wording are in [flows.md](flows.md) sections 1 and 4. What candidates are told up front (flows section 4.2) is **draft wording for founder approval**, with these changes:
- hours are "about 20 in total; extra hours earn no credit"
- the defense is "75 minutes, in person"

## 5. Company experience

1. Intro, then agreement (M2), then role intake.
2. A weekly pool update.
3. The shortlist packet (M9). The company picks up to 4 finalists using its written, job-related criteria; our rubric decides who's on the shortlist, which reconciles constitution 3.3.5.
4. Blind-rating task (M13), 30 minutes.
5. Shared defenses.
6. Decision within 2 days, then offer, then a hire report and invoice.

Details are in [flows.md](flows.md) section 2.

## 6. Hackathon mechanics (canonical)

| Item | Setting |
|---|---|
| Length | Two weeks (DECISION) |
| Format | Solo. One fixed synthetic brief with an open product choice inside it. |
| Hours | About 20 suggested. No enforced cap. Weekly hours log. |
| Check-ins | Day 3 plan, day 8 walkthrough plus form |
| Deadline | Day 14 at a fixed time, with a 2-hour grace window. The final SHA goes in the form. Late work gets feedback but isn't shortlisted. |
| Review | Days 15 to 19. Both founders review. They decide together who advances, with written reasons. Each company's job-related criteria pick among the shortlist. |
| Defense script (75 min) | ID and setup 5, walkthrough 12, "what breaks if" 10, live change 15, planted bug 15, fresh task 13, candidate questions 5. Then a 10-minute independent scoring and debrief. |
| Bugs | One per finalist, planted by a founder in a disposable Codespace |
| AI transcripts | Optional excerpts. `DECISIONS.md` is required. |

**Canonical funnel (ASSUMPTION; every plan number derives from it):**

| Stage | Count | Gate |
|---|---|---|
| Applicants | about 100 | |
| Accepted and starting | 40 | Kickoff go/no-go: 40 or more accepted and 3 or more partners signed |
| Submissions | plan for 15 | H5 passes at 12 (30% of starters) |
| Shortlist | up to 8 | Review go/no-go: 6 or more |
| Defenses | up to 8 shared sessions | Each company sees up to 4 |
| Hires | 1 or more | Pilot primary metric |

## 7. Capacity budget (illustrative, per cohort)

| Work | Inputs | Founder hours (both founders combined) |
|---|---|---|
| Review | 15 submissions x 30 min x 2 founders | 15 |
| Bug planting and fresh-task bank | 8 finalists x 75 min, plus 4 h for the bank | 14 |
| Defenses | 8 x (75 + 10 min), one founder facilitating | 11 |
| Written feedback | 15 submitters x 30 min | 8 |
| Recruiting, partners, check-ins, comms | estimate | 35 |
| **Total** | | **about 83** |

About 40 hours each over 5 weeks, about 8 a week (ASSUMPTION; founders confirm). If that's too much, cut the shortlist from 8 to 6 first (saves about 6 hours).

## 8. User stories and functional requirements

| Must | User story | Functional requirements |
|---|---|---|
| M1 | As a candidate, I apply and know exactly what I'm agreeing to | FR1.1 Consent text version, timestamp and method are recorded. FR1.2 Rules, rubric and the time ask are shown before submit. FR1.3 Consent covers anonymized use in M13. |
| M2 | As a founder, I sign up my startup and say what the role needs | FR2.1 Job-related criteria only. FR2.2 We review criteria for proxies such as "culture fit". |
| M3 | As a candidate, I know the brief, rules and rubric on day 1 | FR3.1 Everything is published at kickoff and recorded for anyone who misses it. |
| M4 | As a reviewer, I know exactly which code was submitted | FR4.1 The form requires the final SHA. FR4.2 We clone within 2 hours of the deadline and confirm the SHA. A mismatch is flagged for the defense, never auto-rejected. FR4.3 Nothing outside the repo is collected. |
| M5 | As a candidate, I get feedback mid-build | FR5.1 Feedback within 48 hours of day 8. FR5.2 Anyone with no commits by day 3 gets a ping. |
| M6 | As a candidate, I submit in one step and get a receipt | FR6.1 One form. FR6.2 The receipt states review dates. |
| M7 | As a reviewer, I score consistently | FR7.1 The founder not running operations reviews blind. FR7.2 Every score has an evidence note. FR7.3 Disagreements of more than one level are discussed. FR7.4 Every reject has a written reason. |
| M8 | As an interviewer, I run one structured defense | FR8.1 Script and rubric sent 48 hours ahead. FR8.2 ID logged, never copied. FR8.3 Scores filed before discussion. FR8.4 The sandbox is destroyed after. |
| M9 | As a company, I see only my shortlist and the evidence | FR9.1 One doc per company, shared with named people only. FR9.2 Six scores, no total. FR9.3 Shared only after candidate approval. FR9.4 On withdrawal we remove access the same day. |
| M10 | As a candidate who wasn't hired, I leave with something useful | FR10.1 Rubric feedback by day 26. |
| M11 | As a founder, I see the funnel and the hypothesis data | FR11.1 Funnel events logged the same day. FR11.2 H5, H6 and H11 fields captured per candidate. |
| M12 | As a founder, I test the process before real candidates see it | FR12.1 Timings and reviewer agreement. |
| M13 | As a founder, I can tell whether our cut beats chance | FR13.1 Companies rate anonymized artifacts without knowing which were shortlisted. |

## 9. Non-functional requirements

- **Privacy.** Collect the minimum ([verification.md](../research/verification.md) section 2.4). **The repo is public**, so candidate data never goes in it. It lives in the founders' Google Workspace. Each company's doc is separate.
- **Security.** Candidate code is untrusted and runs only in disposable sandboxes with no real secrets. Any AI that reads submissions treats them as untrusted input.
- **Retention (legal F4).** We keep a "hiring record" for 4 years: consent, scores, reasons, decisions. Everything else is deleted on request or 12 months after the cohort. Recordings are deleted within 90 days. A lawyer confirms this.
- **Human review (legal F3).** Named people make every advance or reject decision, with written reasons.
- **Accessibility.** Accommodations are offered at application. Forms and docs work with screen readers. The venue is accessible.
- **Recording consent (legal F2).** Opt-in, and everyone present consents.

## 10. Validation

Customer interviews test H1 to H4 and H7 to H10. The pilot tests H5, H6 and H11. Both founders sign off every threshold **before call 1**. At these sample sizes the counts are go/no-go triggers. They can't be quoted as rates.

| ID | Hypothesis | Pass | Middle zone | If it fails |
|---|---|---|---|---|
| H1 | Startups have a costly, recent engineering hiring failure | 8 of 12 | 6 or 7: run 6 more calls | Revisit the target before the pilot |
| H2 | AI has made their assessments less trustworthy | 6 of 12 | 4 or 5: more calls | Drop the AI framing in the pitch |
| H3 | Startups commit in writing to the full ask (review finalists, about 6 hours, $1,000 plus 5%) | 3 or more | 2: one-company pilot | Shrink the pilot to one company, defense only |
| H4 | Candidates already do unpaid builds | 6 of 10, median 10 hours or more | 4 or 5: more calls | Stipends for every finisher |
| H5 | Enough candidates finish two weeks | Pilot: 12 or more of 40 submit | 8 to 11: add stipends next cohort | Raise build length with the founders (only they can change a DECISION) |
| H6 | Our cut beats chance | Pilot: companies rate shortlisted artifacts above below-cut ones in M13, **and** 60% or more of finalists are rated "would advance" | 40 to 59%: rework the rubric, then rerun | Rework the rubric and artifact review before cohort 2 |
| H7 | Our timeline is no slower than theirs | Their median is 6 weeks or more (a tie counts as a pass) | 4 to 5 weeks: build the standing pool first | Build the standing pool before cohort 2 |
| H8 | Startups spend real money per hire today | Median $5,000 or more | | Our price looks high. Revisit with the founders. |
| H9 | Buyers hire 0 to 3 year engineers | 40% or more of startups contacted | 25 to 39%: more calls | Below 25%: change the target level, then the brief and pitch |
| H10 | Startups accept $1,000 at signing plus 5% | 2 or more of the H3 commitments | | Bring founders the option of charging the flat fee at shortlist delivery |
| H11 | The defense predicts company verdicts better than the artifact review alone | Pilot: among finalists, defense scores match company verdicts more often than artifact scores do (pre-registered, directional only at n of 8 or fewer) | Tie | Revisit defense length. Triplebyte found project talk didn't predict success ([competitors.md](../research/competitors.md)). |

**Gate rule (RECOMMENDATION):** if H1, H3 or H9 fails, don't run the pilot as written.

## 11. Pricing

**DECISION (founders, 2026-10-03):** companies pay $1,000 flat plus 5% of first-year salary per hire. The 1% model is retired.

**DECISION (founders, CEO review 2026-10-03):**
- The $1,000 is charged per company per cohort, at signing. It's flat, with no refund (founders: "it's all proportional. 1k is a flat fee").
- The number of finalists each company sees is proportional to the offers it expects to make (M2 intake).
- If a hire leaves within 90 days, we find the company a replacement for free.

OPEN QUESTIONS:
- **P2.** How long after an introduction does a hire still count as ours? Suggested starting point: 12 months.
- **P4.** How bonus and equity count toward first-year salary
- **P5.** How we learn a hire happened

## 12. Pitch demo (Must haves only)

Lead with evidence, then the process.
1. **The scoreboard:** calls completed against each threshold, plus any written A16 yeses, with exact counts. If it's zero, show zero.
2. **The brief and rubric** (M3, M7). Six dimensions, no total score.
3. **The defense script** (M8): 75 minutes, ending in a planted bug in the candidate's own code.
4. **The company packet** (M9) as it actually runs in cohort 1: a doc with a sample report, captioned "Sample. Not a real candidate."

Say: "We think how someone defends AI-built code shows whether they can engineer with AI. This pilot tests it." Never say "predicts", "validated", "bias-free" or "compliant", and don't show software the pilot won't use.

## 13. Open questions

| ID | Question | Blocks | Who answers |
|---|---|---|---|
| Q2 | City and venue | M8 | Founders |
| Q3 | Prize amounts and tool credits | M10, S1 | Founders |
| Q4 | Do candidate reports make us a consumer reporting agency (FCRA, California ICRAA)? | M9 | Lawyer |
| Q5 | Retention schedule and the license terms for submitted code | M1, M4 | Lawyer |
| Q6 | Build the evidence capture or company view software for cohort 2? Decide after cohort 1. | Later | Founders |
| Q7 | Lawyer: who, cost, timing. It blocks signup (Q4, Q5). | M1, M9 | Founders |
| P2, P4, P5 | Pricing details | M2 | Founders |
