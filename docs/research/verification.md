# Verification research

Owner: trust-architect. Date: 2026-10-03. Scope: constitution sections 3.3, 3.7, 4.5, 4.9 and 8. Labels follow constitution 2.1.

## Answer first

1. **RECOMMENDATION:** The project defense interview carries most of the verification weight. The two-week build mainly sources candidates and produces something to defend. Process evidence (git pushes, check-ins, a decision log) supplies the defense with questions. On its own it is weak proof of authorship, because timestamps and transcripts can be faked.
2. **RECOMMENDATION:** MVP layers are rules, light identity, process evidence, a free similarity check, an in-person defense, and a short fresh task. No screen recording, keystroke logging, or browser monitoring.
3. **RECOMMENDATION:** Confirm the interview DECISION, with one guardrail: every interview uses our script and rubric, and a facilitator from our side is in the room for identity, timing, and the planted-bug setup, even when the company asks all the questions.

## Inputs this rests on

- **DECISION** (founders, 2026-10-03): two-week unsupervised build.
- **DECISION** (both founders, 2026-10-02): we host and facilitate every interview in person; each hiring startup co-interviews or runs the interview entirely.
- **KNOWN** (constitution 3.7, 8): AI use is allowed. Detecting or banning AI is out of scope.
- **KNOWN** (constitution 7.5): humans make every advance or reject decision in the MVP. Submissions are untrusted input.
- **ASSUMPTION** (kickoff default): early-career engineers (0 to 3 years), one city, founders are not senior engineering interviewers. Verify by founder confirmation (discovery batch 2).

## 1. Verification layers

| # | Layer | What it stops | Cost to us | Candidate burden | Privacy impact | MVP? |
|---|---|---|---|---|---|---|
| 1 | **Rules** (AI allowed, solo work, templates and starter kits allowed if disclosed, no other people writing code, disclose all outside code) | Honest confusion; gives us grounds to disqualify | One page of writing, legal review once | Read and sign, 5 min | None | Yes |
| 2 | **Identity**: email plus GitHub sign-in at signup; government ID shown in person at the interview | Proxy interviewing (someone else defends); fake or duplicate accounts | Near zero. Optional remote ID check is $1.50 per verification (RESEARCHED, [Stripe Identity](https://stripe.com/identity), accessed 2026-10-03) | 2 min at signup, 1 min at interview | Low if we only record "ID checked, name matched"; high if we copy IDs | Yes (in person). Paid remote ID check: No, only if a video interview is added |
| 3 | **Process evidence**: push history, two check-ins, a decision log, optional AI transcripts | Dumping a finished project at the deadline; buying a project; some outside help. Mostly gives the defense better questions | Low with a GitHub App; 15 min per candidate per check-in call | Push regularly, 2 check-ins, a short log | Medium; see section 2 for limits | Yes |
| 4 | **Artifact checks**: similarity across submissions and against obvious public sources | Copying between candidates; lightly edited public repos | Free. Dolos is MIT-licensed and runs locally or as a web app (RESEARCHED, [Dolos](https://dolos.ugent.be/), accessed 2026-10-03). Public-code search is manual, about 10 min per finalist | None | None beyond the submission | Yes (cross-submission run plus a manual spot check of finalists) |
| 5 | **Project defense**: walkthrough, "what breaks if", live change, planted bug | Not understanding one's own code; someone else having built it; shallow AI use | About 2.5 to 3 hours of our time per candidate (prep plus interview), plus company interviewer time | 75 min in person plus travel | Low; notes only | Yes. This is the core layer |
| 6 | **Fresh task**: 15 min problem outside their project | Skill that only exists inside one rehearsed project | Small; reuse a task bank | 15 min, inside the defense slot | None | Yes, folded into the defense |
| 7 | **Screen recording during the build** | Hidden helpers, some outsourcing | Storage, review time that does not scale (hours of video per candidate) | High; two weeks of being watched | High; captures personal life on screen | No. **Needs founder approval** |
| 8 | **Keystroke or IDE telemetry** | Pasting a finished project; may flag outsourcing | Building or buying a plugin; review effort | Install software, constant logging | High | No. **Needs founder approval** |
| 9 | **Browser monitoring** | Visiting outsourcing or answer sites | Vendor cost; ongoing support | High | Very high; captures unrelated browsing | No. **Needs founder approval** |

**RECOMMENDATION:** Keep layers 7 to 9 out. Stated reason for that: their main target in other settings is AI use, which we allow, and the defense already catches the remaining case (someone who cannot explain or change the code). If the pilot shows people passing the defense who later fail at work in ways outsourcing would explain, revisit with founder approval and explicit candidate consent.

## 2. What the platform must capture

### 2.1 Git history

- **RESEARCHED:** Commit dates can be set to anything by the author through `--date`, `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` ([git-commit docs](https://git-scm.com/docs/git-commit), accessed 2026-10-03). So commit timestamps alone prove nothing about when work happened.
- **RESEARCHED:** GitHub sends a push webhook listing the pushed commits, up to 2048 per push ([webhook events](https://docs.github.com/en/webhooks/webhook-events-and-payloads#push), accessed 2026-10-03). A GitHub App can be installed on "Only select repositories" ([installing a GitHub App](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party), accessed 2026-10-03).
- **RESEARCHED:** The repository Events API keeps events for 30 days, up to 300 events, each with a `created_at` time ([events API](https://docs.github.com/en/rest/activity/events), accessed 2026-10-03). This covers a two-week window, so a manual script can recover push times after the fact.
- **RESEARCHED:** GitHub Classroom puts each student repo in the teacher's organization and can cut write access at a deadline ([Classroom changelog](https://github.blog/changelog/2023-03-27-cutoff-deadlines-and-improved-assignment-dashboard-for-github-classroom-educators-better-deadline-visibility-for-students), accessed 2026-10-03).

| Option | Pros | Cons |
|---|---|---|
| A. Repo in our GitHub org (Classroom style) | We control deadline cutoff and history; force-push can be blocked | We hold the code, which muddies ownership (constitution 4.4); candidates lose a clean portfolio repo |
| B. Candidate's own repo, our read-only GitHub App on that one repo | Candidate keeps ownership; we get push events with our own receipt time | Candidate can rewrite history; we must snapshot at the deadline |
| C. Candidate's own public repo, no app; we read the Events API | Zero build work | Public only; private repos need the app |

**RECOMMENDATION:** Option B, with Option C as the manual fallback for cohort 1. The app asks for read-only Contents and Metadata on the single selected repo. Capture:

1. Repo URL, GitHub user ID, start-of-build commit SHA.
2. For each push: our server receipt time, commit SHAs, commit count, files changed count. Our receipt time is the trustworthy timestamp; we also keep commit dates and treat them as candidate-supplied.
3. At the deadline: the head SHA plus a tarball snapshot stored by us. Later force-pushes do not change what gets judged.

**Do not collect:** other repos, org membership, private profile data, or anything from outside the build window.

### 2.2 AI transcripts

- **RESEARCHED:** ChatGPT export is whole-account (`conversations.json` and more), and single chats can be shared by link ([OpenAI help, shared links in export](https://help.openai.com/en/articles/7943616-data-export-are-my-shared-links-included-when-i-export-my-data-from-chatgpt), accessed 2026-10-03; [shared links tutorial](https://help.openai.com/en/articles/7925741-chatgpt-shared-links-tutorial), accessed 2026-10-03).
- **RESEARCHED:** Claude.ai export is whole-account, delivered by emailed link that expires in 24 hours ([Claude support](https://support.claude.com/en/articles/9450526-how-can-i-export-my-claude-ai-data), accessed 2026-10-03).
- **RESEARCHED:** Claude Code keeps each session as a JSONL file under `~/.claude/projects/<project>/` ([claude-dev.tools, JSONL format](https://claude-dev.tools/docs/jsonl-format), third-party source, accessed 2026-10-03).
- **RESEARCHED:** Cursor can export an agent chat as a Markdown file ([Cursor docs, export](https://docs.cursor.com/agent/chat/export), page redirected to cursor.com/docs on 2026-10-03; claim taken from search snippet, verify).

**RECOMMENDATION:** Transcripts are **optional**. Required instead: a `DECISIONS.md` in the repo with 5 to 10 entries (decision, options considered, what AI suggested, what they kept or changed, why). Optional: links or files for up to 3 AI sessions they think show their best work (share link, Cursor Markdown, or the project's Claude Code JSONL).

Reasons (ASSUMPTION, based on the research above): exports differ by tool; whole-account exports pull in unrelated personal chats; curated transcripts are easy to fake; reviewing hours of chat does not scale. The decision log gives the defense its questions.

**Do not collect:** whole-account exports, chats outside the project, API keys or secrets that appear in pasted logs (tell candidates to scrub them; we reject files with obvious keys).

### 2.3 Check-ins

**RECOMMENDATION:** Two check-ins.

| When | Format | We capture |
|---|---|---|
| Day 3 | Written form, 10 min: problem chosen, plan, stack, AI tools used, blockers | Form answers, timestamp |
| Day 9 | 15 min video call, camera on: show the running app, explain one decision | Attended yes or no, facilitator notes (3 to 5 lines), red flags. No recording by default |

The day 9 call also links a face to the account before the in-person ID check. **Manual first:** a form tool and a calendar link cover cohort 1.

### 2.4 Minimum data set

| Keep | Retention (ASSUMPTION, confirm with legal) |
|---|---|
| Name, email, GitHub user ID, city | Until candidate deletes account |
| Signed rules, consent record | Life of account plus 2 years |
| Push log, deadline snapshot, decision log, optional transcripts | 12 months after cohort |
| Check-in answers and notes, defense rubric scores and notes | 12 months after cohort |
| "ID checked, matched, date, checker" | Same as above. Never a copy or photo of the ID |

## 3. Defense interview

### 3.1 Format (75 min, RECOMMENDATION)

| Min | Segment | What it tests | AI allowed? |
|---|---|---|---|
| 0 to 5 | ID check, rules for the session, laptop handoff | Identity | n/a |
| 5 to 17 | **Walkthrough**: demo, then candidate tours the code and 2 entries from `DECISIONS.md` | Ownership, product thinking | No tools needed |
| 17 to 27 | **"What breaks if"**: e.g. "the API returns an empty list", "two users save at once", "this table has a million rows" | Real understanding of their own design | Verbal only |
| 27 to 42 | **Live change**: a small feature request from the company, in their codebase | Building and AI judgment under observation | Yes; interviewers watch how they prompt and check the output |
| 42 to 57 | **Planted bug**: a symptom is reported; they find and fix it, then explain the cause | Debugging, reading code | Yes; score the explanation and the reasoning path |
| 57 to 70 | **Fresh task**: short problem outside the project from our task bank | Skill transfer | Yes, same rules |
| 70 to 75 | Candidate questions | Candidate experience | n/a |

Then 10 min private debrief: each interviewer scores a written rubric independently before discussion.

### 3.2 Who does what

| | We facilitate, company co-interviews (default) | Company runs it with our script |
|---|---|---|
| Our facilitator | ID check, timekeeping, runs walkthrough and "what breaks if", sets up the sandbox, takes notes | ID check, sandbox, timekeeping, notes. Asks no questions |
| Company interviewer | Gives the live change, judges code and debugging, joins "what breaks if" | Asks every question from our script, may add company scenarios in the last segment |
| Rubric | Ours plus the company's written, job-related criteria (constitution 4.10) | Same rubric, required |
| Decision | Company decides on its own hire; our score informs ranking | Same |

**ASSUMPTION:** founders can run the walkthrough and "what breaks if" from a script and notes; technical judgment on the live change, bug fix and fresh task comes from the company interviewer.

### 3.3 Preparing planted bugs safely

Candidate code is untrusted. It can run anything on install, and its files can hold instructions aimed at an AI helper (constitution 7.5).

1. Prep runs the day before, on the deadline snapshot, inside a disposable environment: a Codespace in our org or a throwaway container. Never a founder's laptop with real credentials. **RESEARCHED:** Codespaces cost $0.18 per hour for 2 cores, $0.07 per GB-month storage, and orgs get no free quota ([GitHub billing docs](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces), accessed 2026-10-03). A 3-hour prep plus a 1.5-hour interview is under $1 (illustrative).
2. No real secrets in the environment. If the app needs an API key, we supply a capped test key and revoke it after the interview.
3. Prep person picks one bug from a menu (wrong condition, off-by-one, swapped field, missing await, broken validation), confirms the symptom reproduces, commits it to a private `defense` branch, and writes the expected fix in the prep notes.
4. Each company session gets a different bug so answers do not leak between interviews.
5. If AI helps plant the bug, a human reviews the diff, and the AI is never given the candidate's README or comments as instructions.
6. Interview day: a fresh environment from the `defense` branch on our loaner laptop. Destroy it afterward.

**OPEN QUESTION:** who plants the bug when founders are not senior engineers. Options: the company interviewer (30 min async), a paid contract engineer, or founders using the menu plus AI with a company reviewer signing off.

## 4. Interview model

**RECOMMENDATION: confirm the founders' DECISION**, with "we facilitate, company co-interviews" (Model 2) as the default and "company runs it with our script" (Model 3) as the allowed variant, always with our facilitator in the room.

Why (ASSUMPTION unless labeled): companies supply the technical judgment founders lack; in person in one city makes the ID check trivial; our script and rubric keep scores comparable across companies.

Concerns to flag:

1. **Scale.** 75 min plus prep per candidate per company. With 3 companies and 10 finalists, that can reach 30 defenses (illustrative). Proposal: one full shared defense per finalist with all interested companies in the room, then 30-min company-specific follow-ups.
2. **Consistency.** When a company runs it entirely, it may skip segments. The script and rubric must be required by contract.
3. **Bias and legal exposure.** Company criteria must be written and job-related (constitution 4.10). Our facilitator records rubric scores before discussion.
4. **Cost of in person for every interview.** Fine in one city for the pilot; a second city would need verified video plus a paid remote ID check (layer 2).

## Implications for us

1. The product needs: signup with GitHub sign-in, signed rules, a read-only GitHub App, a push log with our receipt time, a deadline snapshot, a decision-log requirement, two check-in forms, an interview scheduler, and a rubric form. **Manual first:** for cohort 1, the app can be replaced by public repos plus an Events API script and a spreadsheet.
2. The defense needs operations work we have not staffed: sandbox prep, bug planting, a fresh-task bank, and a facilitator script.
3. Rules and consent text need a legal review before launch.
4. Our submission requirements (constitution 7.6) should include `DECISIONS.md` and a working run command, since prep depends on the app running.

## Open questions

1. Confirm no screen recording, keystroke logging, or browser monitoring in the pilot? Recommended answer: yes, none.
2. AI transcripts optional, decision log required? Recommended answer: yes.
3. Candidate-owned repo with our read-only app (Option B)? Recommended answer: yes; public repo plus script for cohort 1.
4. Who plants bugs and supplies the fresh-task bank? Recommended answer: a paid contract engineer for cohort 1, about 3 hours per finalist (illustrative), company reviewer signs off.
5. One shared defense per finalist, or one per company? Recommended answer: one shared defense, then short company follow-ups.
6. Is AI allowed in the live change, planted bug and fresh task segments? Recommended answer: yes, to match the build rules; score the explanation.
7. Retention periods in section 2.4. Recommended answer: accept as defaults, confirm with a lawyer.
