# Evaluation research v0

Owner: evaluation-scientist subagent. Drafted 2026-10-03. Covers constitution sections 7.1, 7.3, 7.4, 7.6, plus a rubric v0. Labels follow constitution 2.1.

## Bottom line

1. **RECOMMENDATION:** Treat the in-person project defense as the assessment and the two-week build as sourcing plus raw material for that defense. The submission can show "builds with AI". Only the defense reliably shows "uses AI as an engineering tool".
2. **RECOMMENDATION:** Run the pilot solo, on one fixed synthetic brief with room for product choices inside it, with a suggested budget of about 20 hours total and two light check-ins.
3. **RECOMMENDATION:** Score six dimensions on anchored 1 to 4 scales. Weight output quality lowest. Never collapse the six into one number for companies.
4. **RECOMMENDATION:** Every defense uses a script we write: the same question bank, one planted bug, one live change, one prediction question. Companies co-interview inside that script.
5. **HYPOTHESIS (H-eval-1):** Defense scores will rank candidates differently from artifact scores. Test: compare the two rankings across the pilot cohort. Pass: at least 3 candidates whose rank moves by a quarter of the cohort or more. If the rankings match closely, the defense adds little and the cheap artifact screen is enough.

## Context this rests on

| Input | Label |
|---|---|
| Build window is two weeks | DECISION (founders, 2026-10-03) |
| We host and facilitate every interview in person; each startup co-interviews or runs it | DECISION (founders, 2026-10-02) |
| Target is early-career engineers, 0 to 3 years | ASSUMPTION |
| Humans make every advance or reject decision | KNOWN (constitution 7.5) |
| Founders may not be senior engineering interviewers; companies supply technical judgment | ASSUMPTION |
| Zero customer calls so far | KNOWN |

## 1. Evidence map (constitution 7.3)

Confidence = how much the signal tells us about the attribute, given the faking risk. All rows are RECOMMENDATION or ASSUMPTION until tested in the pilot.

| Attribute | Observable signal | Source | How it could be faked | Cost to collect | Confidence | In MVP? |
|---|---|---|---|---|---|---|
| Understands own code | Explains a file they did not write by hand; answers "what breaks if this line goes" | Defense | Hard to fake live; memorizing a walkthrough covers only rehearsed parts | 15 min of defense | High | Yes |
| Predicts behavior | States what a change will do before running it, then checks | Defense | Very hard live | 5 min of defense | High | Yes |
| Debugs | Finds and fixes a bug we planted in their repo | Defense | Very hard live; can be gamed if the bug type leaks | 10 min defense plus 30 min our prep per candidate | High | Yes |
| Makes a live change | Adds a small requested feature to their own repo, with AI allowed | Defense | Hard; a helper cannot sit in the room | 15 min of defense | High | Yes |
| Catches AI errors | Transcript shows a rejected or corrected AI suggestion with a reason; decision log names one | AI transcript, decision log, commits | Transcripts can be curated or staged after the fact | Reviewer reading time, about 10 min | Low to medium | Yes, as a prompt for defense questions |
| Quality of instructions to AI | Prompts state constraints, give context, ask for tests | AI transcript | Easy to curate | About 10 min | Low | Yes, light weight |
| Sound technical decisions | Decision log states options, choice, reason, and a known downside | Decision log, defense follow-up | Log can be written by someone else or by AI; defense checks it | 10 min read plus defense questions | Medium (log), high (after defense) | Yes |
| Tests and verifies | Tests exist and target risky logic; commits show test-then-fix loops | Repo, commits | Tests can be AI-generated and shallow | 10 min | Medium | Yes |
| Scopes under ambiguity | Day-3 plan names users, cuts, and what "done" means; final scope matches or the change is explained | Check-in 1, README | Plan can be written by a helper | 5 min | Medium | Yes |
| Product judgment | Connects features to the user named in the brief; can say what they would build next and why | README, demo video, defense | Rehearsable | 5 min video plus defense | Medium | Yes |
| Working output | App runs from README instructions and meets the brief | Repo, demo video | Easy with outside help or heavy AI use | 15 min to run | High for output, low for skill | Yes, as a gate |
| Pace | Commit timeline relative to self-reported hours | Commits, hours log | Commits can be squashed or backdated | Near zero | Low | Record only |
| Skill transfers outside own project | Short fresh task in the defense | Live task | Hard | 15 to 20 min | High | Should have; add if defense time allows |
| Identity | ID check at the in-person defense | Defense | Low risk in person | 1 min | High | Yes |

**ASSUMPTION:** Planted-bug prep needs someone who can read the candidate's code. If the founders cannot, a design-partner engineer or a paid contract engineer prepares bugs. That is a real cost and an open question (Q-eval-3).

## 2. Signals that separate the two abilities (constitution 7.1)

"Builds with AI" shows in the output. "Uses AI as an engineering tool" shows in what the candidate does when the AI is wrong, absent, or needs direction. A reviewer looks for these, in order of strength:

| Strength | What the reviewer looks at | What separates the two |
|---|---|---|
| Strongest | Planted bug in the candidate's own repo, solved live with AI allowed | Builders paste the error into the AI and accept the first fix. Engineers form a guess first, read the relevant code, confirm the cause, then use AI to speed up the fix. Watch whether they can say why the fix works. |
| Strongest | Prediction question: "If I change X, what happens?" answered before running | Engineers reason from the code. Builders guess or need to run it. |
| Strong | Line walkthrough of a file they say the AI wrote | Engineers explain intent, edge cases, and what they changed. Builders paraphrase syntax. |
| Strong | Live change request | Engineers break it down, give the AI a scoped instruction, and review the diff before accepting. Builders accept the whole diff and test by clicking. |
| Medium | Decision log entry about an AI suggestion they rejected | A specific, checkable reason ("it used a global lock; two requests would block") counts. A vague one ("it was wrong") does not. Verify in the defense by asking them to show the spot. |
| Medium | Commit history shape | Small commits with fix-after-test patterns suggest verification. One giant commit near the deadline says little either way. |
| Weak alone | Polish, feature count, demo quality | Both groups can produce these. Treat as a gate, never as a ranking signal. |

**RECOMMENDATION:** Reviewers write down the evidence (a quote, a commit link, a timestamp in the defense) next to every score. A score with no evidence note does not count.

**RESEARCHED:** Developers can misjudge how much AI helps them. In a randomized trial with 16 experienced open-source developers, tasks with AI allowed took 19% longer, while the developers believed AI had made them about 20% faster ([METR, arXiv 2507.09089](https://arxiv.org/pdf/2507.09089), accessed 2026-10-03). Implication for us (ASSUMPTION): candidate self-reports about AI use and speed are weak evidence; observed behavior is better.

## 3. Rubric v0

Six dimensions, each scored 1 to 4. Scores come with an evidence note. **RECOMMENDATION:** Show companies the six scores and evidence side by side, with no total. Dimensions A to D carry the thesis; E and F matter but can be produced with outside help.

Level meanings shared by all dimensions: 1 = absent or wrong, 2 = partial or needs heavy prompting, 3 = solid for an early-career hire, 4 = would stand out among early-career hires.

### A. Comprehension and ownership
Sources: defense walkthrough, prediction questions.

| Level | Anchor example |
|---|---|
| 1 | Cannot say what the main request handler does; reads code aloud without explaining it. |
| 2 | Explains the happy path; stalls on "what if the input is empty" and says "the AI handled that". |
| 3 | Explains the main flow and two edge cases; correctly predicts one of two change outcomes. |
| 4 | Explains flow, edge cases and why the AI's first version was changed; predicts both outcomes and names a side effect we did not ask about. |

### B. Verification and handling AI errors
Sources: AI transcript, decision log, tests, commits, defense follow-up.

| Level | Anchor example |
|---|---|
| 1 | No tests; accepts every AI suggestion; cannot name any time the AI was wrong. |
| 2 | Some AI-generated tests that only check happy paths; names an AI error only in general terms. |
| 3 | Tests cover the riskiest logic; decision log names one AI error with a specific reason, and they can show it in the code. |
| 4 | Shows a habit: asks the AI for tests first or checks output against a spec; names several caught errors, including a subtle one (wrong time zone handling, a race, a security gap). |

### C. Debugging
Source: planted bug in the defense (AI allowed).

| Level | Anchor example |
|---|---|
| 1 | Does not find the bug in 10 minutes even with a hint. |
| 2 | Finds it by pasting errors into the AI repeatedly; cannot explain the cause after the fix. |
| 3 | Reproduces the bug, narrows it to the right file, fixes it, and explains the cause. |
| 4 | Forms a guess before touching the AI, confirms it, fixes it, and adds a test or names how to stop it from coming back. |

### D. Technical decisions and tradeoffs
Sources: decision log, defense questions.

| Level | Anchor example |
|---|---|
| 1 | Cannot say why they chose the stack or data model beyond "the AI picked it". |
| 2 | Gives a reason for one choice; cannot name a downside or an alternative. |
| 3 | For two decisions, names the alternative, the reason, and a downside they accepted. |
| 4 | As level 3, plus says what would make them reverse a decision (for example "if we passed 10,000 users I would move off SQLite because..."). |

### E. Problem framing and product judgment
Sources: day-3 plan, README, demo video, defense.

| Level | Anchor example |
|---|---|
| 1 | Builds features with no link to the user in the brief; cannot say who it is for. |
| 2 | Names the user; scope is a feature list with no cuts. |
| 3 | Names the user and their main problem; cut at least one feature on purpose and can say why. |
| 4 | As level 3, plus changed direction mid-build based on something learned and can say what they would measure next. |

### F. Working output
Sources: repo, README, demo video. **RECOMMENDATION:** Use as a gate (must be 2 or higher to reach the defense) and weight lowest.

| Level | Anchor example |
|---|---|
| 1 | Does not run from the README. |
| 2 | Runs; core flow works with visible bugs. |
| 3 | Core flow works; brief requirements met. |
| 4 | Works, handles bad input, and a reviewer could extend it without asking questions. |

**OPEN QUESTION (Q-eval-1):** Should companies add one company-specific dimension? Recommended default: no for the pilot; they record company notes separately so our six stay comparable across companies. Any company criterion must be written down and job-related (constitution 4.10).

## 4. Hackathon design for the two-week window (constitution 7.6)

### 4.1 Recommended setup

| Choice | Recommendation | Why |
|---|---|---|
| Solo or team | Solo | Teams blur who did what, and the defense is per person. (RECOMMENDATION) |
| Prompt style | One fixed synthetic brief per cohort with an open product choice inside it. Example shape: a fixed user and dataset, the candidate picks which problem to solve and how. | Same brief makes reviews comparable; the open choice tests product judgment; synthetic avoids unpaid work for a company and IP questions (constitution 4.4). (RECOMMENDATION) |
| Expected hours | Suggest about 20 hours total, about 10 per week. Size the brief so a level-3 result fits in that. State openly that extra hours earn no credit. | Limits the advantage of people with free time. (RECOMMENDATION; the 20-hour figure is ASSUMPTION, adjust after the first cohort's hours logs) |
| Hard cap | No enforced cap. Ask for a weekly self-reported hours log. | A cap cannot be enforced in an unsupervised window; a log gives us data to check the time effect. (RECOMMENDATION) |
| AI tools | Any tools allowed. Offer a standard tool credit to anyone who asks. | Reduces the paid-tool advantage (constitution 4.13). (RECOMMENDATION; cost is OPEN QUESTION Q-eval-4) |
| Outside help | Humans may not write code or make design decisions for them. Docs, forums, AI allowed. Disclose templates or starter kits. | Clear rules come first (constitution 8, layer 1). (RECOMMENDATION) |

### 4.2 Timeline

1. **Day 0:** Brief, rules, rubric, and judging steps published to candidates. They see the six dimensions and know the defense is coming.
2. **Day 3, check-in 1 (written, 10 min):** One-page plan: user, problem chosen, what "done" means, what they will cut. Feeds dimension E.
3. **Day 8, check-in 2 (async, 5 min):** Short recorded screen walkthrough of progress plus one decision and why. Gives a timestamped process record; flags drop-outs early.
4. **Day 14, submission.**
5. **Days 15 to 19, artifact review:** Two reviewers score E and F, and draft B and D, from artifacts. Names and school details hidden where possible. Reviewers pick defense questions and prepare one planted bug per candidate.
6. **Days 15 to 19, human decision 1:** Founders decide who advances to the defense. Every reject gets a short written reason.
7. **Days 20 to 28, in-person defense (60 to 75 min):** Our scripted structure, company co-interviews. Order: walkthrough (15), prediction questions (5), planted bug (15), live change (15), decisions and product questions (10), optional fresh task (15). All six dimensions finalized here.
8. **Within 2 days of each defense, human decision 2:** The company decides whether to move to an offer process, using the six scores and evidence notes.

### 4.3 Required submission contents

1. Git repo with full, unsquashed history.
2. README: how to run it, who it is for, what was cut.
3. Decision log, one page: three to five decisions, each with options, choice, reason, downside. At least one entry about an AI suggestion they changed or rejected.
4. AI transcript excerpts: two to three exchanges they think show how they work, plus the full export if they are willing. **RECOMMENDATION:** Make the full export optional for the pilot; it is new personal data and needs founder approval (constitution 12).
5. Demo video, 3 to 5 minutes.
6. Weekly hours log.

### 4.4 What two weeks costs, and how this design limits the damage

The two-week window is fixed (DECISION). These are its costs:

| Cost | Label | Mitigation in this design |
|---|---|---|
| Rewards free time. People with jobs, caregiving, or exams produce less, and output quality tracks hours. | ASSUMPTION | Suggested 20-hour budget; brief sized to it; output weighted lowest; ranking driven by defense dimensions A to D, which do not grow with hours. Hours log lets us check whether scores track hours. |
| More unsupervised time means more room for outside help. | ASSUMPTION | Artifacts only gate. All decisive scores come from the in-person defense, where helpers are absent. |
| Paid-tool advantage grows over a longer build. | ASSUMPTION | Offer a standard tool credit. |
| Drop-out over two weeks shrinks an already small pilot. | ASSUMPTION | Day-3 and day-8 check-ins catch drop-outs early; light time ask. |
| Slower time to hire (about four weeks from start to company decision). | ASSUMPTION | Tight review and defense windows above; constitution 4.3 covers the wider issue. |

## 5. Rigor notes (constitution 7.4)

**Validity evidence for our ingredients**

- **RESEARCHED:** After correcting older meta-analyses for overcorrection of range restriction, structured interviews rank as the strongest single predictor of job performance (mean operational validity about .42), with job knowledge tests about .40, work samples about .33, and cognitive ability about .31 ([SIOP TIP summary of Sackett, Zhang, Berry and Lievens 2022, Journal of Applied Psychology](https://www.siop.org/tip-article/is-cognitive-ability-the-best-predictor-of-job-performance), accessed 2026-10-03). The same summary notes structured interview validities vary a lot across studies.
- **RESEARCHED:** Work sample validity was meta-analyzed by Roth, Bobko and McFarland, Personnel Psychology 58, 2005 ([outline of the paper](https://web.pdx.edu/~mccunee/quant_621/Outlines/Roth%20et%20al%202005.doc), accessed 2026-10-03).
- **ASSUMPTION:** These numbers come from conventional jobs and conventional tests. None of them tested an AI-allowed, two-week, self-directed build. Our format borrows credibility from these findings; it has not earned it.

**Reliability**

- **RESEARCHED:** Interrater reliability of interviews rises with structure and with panels. Huffcutt, Culbertson and Weyhrauch (2013) report about .40 (separate interviewers) and .55 (panel) for low structure, and about .61 and .78 for high structure ([summary via Redalyc](https://www.redalyc.org/pdf/2313/231353576003.pdf); [publication record](https://business.oregonstate.edu/faculty-and-research/research/publications-list/employment-interview-reliability-new-meta-analytic), both accessed 2026-10-03). This supports our design: same script, company and our facilitator in the room together, scores recorded separately before discussion.
- **RESEARCHED:** Structure components (same questions, anchored rating scales, multiple raters, rating each answer) are reviewed in Levashina, Hartwell, Morgeson and Campion 2014 ([record](https://digitalcommons.usu.edu/manage_facpub/423/), accessed 2026-10-03).
- **RESEARCHED:** For measuring agreement, an intraclass correlation (ICC) below .50 is poor, .50 to .75 moderate, .75 to .90 good; report the confidence interval alongside the point estimate ([Koo and Li 2016](https://pmc.ncbi.nlm.nih.gov/articles/4913118), accessed 2026-10-03).
- **RECOMMENDATION:** Calibrate before the cohort: all raters score the same 3 sample submissions and 1 recorded mock defense, discuss gaps, revise anchors. During the cohort, double-score every artifact review and have both defense interviewers score independently.

**Fairness**

- **RESEARCHED:** In a randomized study of 48 computer science students, solving a problem while watched by an interviewer cut performance by more than half compared with solving it privately, and raised stress ([Behroozi et al., ESEC/FSE 2020](https://2020.esec-fse.org/details/fse-2020-papers/140/Does-Stress-Impact-Technical-Interview-Performance-), accessed 2026-10-03). **RECOMMENDATION:** In the planted-bug and live-change segments, give the candidate a few minutes alone first, then ask them to talk through what they did. Offer accommodations (extra time, written questions) on request.
- **ASSUMPTION:** Git author names, email addresses and school mentions in READMEs reveal identity. Full blinding is impractical; we can hide names in the review sheet and ask reviewers not to look up candidates.
- **RECOMMENDATION:** Company co-interviewers score inside our anchors. "Culture fit" or unwritten criteria do not enter the six scores.

**What a small pilot can and cannot show** (illustrative cohort: 20 to 40 finishers, under 10 defenses per company)

| Can show | Cannot show |
|---|---|
| Whether candidates finish and how many hours they report | Whether our scores predict job performance (needs many hires and months) |
| Whether two raters agree, roughly (ICC with a wide interval) | A precise reliability number |
| Whether defense rankings differ from artifact rankings (H-eval-1) | Whether the defense ranking is the right one |
| Whether companies agree with our shortlist and want to interview | Whether we beat a company's own process |
| Whether scores track self-reported hours (fairness check) | Group-level adverse impact; numbers are too small |

## Implications for us

1. **RECOMMENDATION:** The defense script is the product's core. Write it, rehearse it, and calibrate on it before recruiting candidates.
2. **ASSUMPTION:** We need someone who can read candidate code to plant bugs and anchor scoring. If neither founder can, budget a contract engineer or ask a design partner, before the pilot starts.
3. **RECOMMENDATION:** Keep the artifact review fast and cheap; it only gates. Spend review time on choosing defense questions.
4. **RECOMMENDATION:** Skip HackerRank for the pilot. Its puzzle tests measure a narrow, AI-restricted skill the defense already covers better, and its proctoring stance clashes with our AI-allowed rule (constitution 3.7, 4.7). Revisit if a company insists.
5. **RECOMMENDATION:** No AI scoring. AI may summarize transcripts for reviewers, treating submissions as untrusted input (constitution 7.5).
6. **RECOMMENDATION:** Log, from day one: hours logs, both raters' scores, artifact rank vs defense rank, company decisions, and 90-day outcomes for any hire.

## Open questions

| ID | Question | Recommended default | Who answers |
|---|---|---|---|
| Q-eval-1 | Allow a company-specific seventh dimension? | No for the pilot | Founders |
| Q-eval-2 | Is the full AI transcript export required or optional? | Optional; excerpts required | Founders (new personal data) |
| Q-eval-3 | Who prepares planted bugs and anchors technical scoring if founders cannot? | A design-partner engineer, or a paid contractor | Founders |
| Q-eval-4 | Do we fund an AI tool credit, and how much? | Yes, one month of a standard plan for anyone who asks | Founders (spending) |
| Q-eval-5 | Is a suggested 20-hour budget right for a level-3 result on our brief? | Test with 2 to 3 friendly engineers before launch | Us, via a dry run |
| Q-eval-6 | Will company engineers accept scoring inside our script? | Ask in the first startup discovery calls | Startup interviews |
| Q-eval-7 | Is the 60 to 75 minute defense acceptable to companies and candidates? | Yes; test in the dry run | Dry run plus discovery calls |
