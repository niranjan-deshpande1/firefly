# Legal flags that change product design

Written 2026-10-03 by the legal-risk-flagger subagent. All links accessed 2026-10-03.

**This is not legal advice.** Every item below is a question for a lawyer. None is solved.

Scope (founders, 2026-10-03): only issues that change what we build or how flows work. Inputs: constitution sections 3, 4.4, 4.10, 6.11, 7.5, 8 and `docs/discovery/batch-1-answers.md`.

## Summary

| # | Flag | When it matters |
|---|---|---|
| F1 | Candidate reports sent to companies may be consumer reports (FCRA, California ICRAA) | Blocks pilot |
| F2 | Consent screens, including recording consent for in-person interviews | Blocks pilot |
| F3 | Human review of every advance or reject decision (California ADS rules) | Blocks pilot if the city is in CA |
| F4 | Data retention: mandatory 4-year records versus deletion requests | Blocks pilot |
| F5 | Ownership of submitted code; synthetic versus company-supplied problems | Blocks pilot |
| F6 | Charging only employers (CA and WA employment agency rules) | Before signing company contracts |
| F7 | Out-of-state AI hiring laws (Illinois, NYC, Colorado) | Before accepting candidates or jobs outside the pilot state |

---

## F1. Candidate reports sent to companies (blocks pilot)

**Laws**
- Fair Credit Reporting Act, 15 U.S.C. 1681a(d) and (f): https://www.law.cornell.edu/uscode/text/15/1681a
- California Investigative Consumer Reporting Agencies Act (ICRAA), Civil Code 1786.2: https://california.public.law/codes/civil_code_section_1786.2
- Washington FCRA, RCW 19.182: https://app.leg.wa.gov/rcw/default.aspx?cite=19.182
- CFPB Circular 2024-06 on algorithmic hiring scores (withdrawn 2025-05-12): https://www.consumerfinance.gov/compliance/guidance/withdrawn-guidance/

**Why it might apply.** KNOWN: we send written candidate reports to companies, and companies pay us per hire. RESEARCHED: FCRA covers people who assemble or evaluate consumer information for a fee and furnish it to third parties for employment decisions. FCRA excludes a report "solely as to transactions or experiences between the consumer and the person making the report" (1681a(d)(2)(A)(i)). Our own hackathon and our own interview observations may fit that exclusion. Anything from another source may break it. RESEARCHED: ICRAA defines an investigative consumer report as information on "character, general reputation, personal characteristics, or mode of living ... obtained through any means," and the text of 1786.2 has no matching first-hand exclusion. Reports that comment on communication, judgment or "fit" could land there. RESEARCHED: the CFPB withdrew its 2024 guidance on this in May 2025, but the statutes are unchanged.

**Triggers.** Sharing one company's interview notes with another company. Adding outside data (LinkedIn, references, web searches, HackerRank scores from a vendor). Scores or rankings presented as a product. Character or personality comments.

**RECOMMENDATION (product requirements)**
1. A report contains only what we observed directly: the submitted repo, the decision log, our interview notes, and live-task results. No outside data, no reference checks, no web lookups.
2. A report never includes notes written by another company. Each company sees only its own interview notes plus our first-hand report.
3. A report uses job-related evidence with links (commit, transcript excerpt, interview note). No character, personality, culture-fit or lifestyle language. Reviewers write from a fixed template with those fields absent.
4. The candidate sees the full report before any company does, can flag factual errors, and must click "approve sending" per company. The approval is timestamped and stored with the report version.
5. The candidate can download every report sent about them.
6. Fees in company contracts attach to hires only, never to reports or report access.

**Questions for a lawyer**
- If we send companies reports built only from our own hackathon and our own interviews, and are paid only per hire, are we a consumer reporting agency under FCRA, or an investigative consumer reporting agency under ICRAA or Washington RCW 19.182?
- Does ICRAA's "obtained through any means" reach first-hand interview observations, given it lacks FCRA's first-hand exclusion?
- If candidate approval before sending is not enough to stay outside these laws, what disclosures, authorizations and adverse-action steps would we need?

---

## F2. Consent screens and recording consent (blocks pilot)

**Laws**
- California Penal Code 632 (all-party consent to record confidential communications, including in person): https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632
- Washington RCW 9.73.030 (all-party consent to record private conversations): https://app.leg.wa.gov/rcw/default.aspx?cite=9.73.030
- FCRA and ICRAA authorization rules, if F1 applies (links above).
- California CCPA ADMT regulations (pre-use notice for automated decisions; obligations phase in 2026 to 2027): https://www.akingump.com/en/insights/alerts/new-california-regulations-regarding-employer-use-of-automated-decision-making-technology-compliance-required-by-january-1-2027

**Why it might apply.** KNOWN: we host in-person defense interviews, often with company staff present, in one CA or WA city. RESEARCHED: both states require consent of all parties to record a private conversation, and both cover in-person talk. ASSUMPTION: we will want audio or video, or an AI note-taker, to support written reports and reviewer calibration. ASSUMPTION: we fall below CCPA revenue and volume thresholds today; verify, because the ADMT notice duties are product-shaping if we cross them.

**Triggers.** Any recording or transcription app running in the room. Collecting AI chat transcripts or git history. Sharing data with companies.

**RECOMMENDATION (product requirements)**
1. Signup consent screen, separate checkboxes, none pre-checked: (a) rules and terms, (b) what we collect (repo, commits, decision log, optional AI transcript export), (c) that reports go to named companies only after per-company approval (F1), (d) retention period (F4).
2. Interview booking screen states whether the interview will be recorded, who will be in the room, and who gets the recording. Recording is opt-in. Declining does not lower a candidate's chances, and the screen says so.
3. At the start of each interview, the facilitator reads a consent line on the recording, and every company interviewer also consents. A checklist item blocks starting a recording until all parties have said yes.
4. Store each consent as a record: who, what version of the text, timestamp, method. Re-ask when the text changes.
5. Company contracts bar company interviewers from making their own recordings.

**Questions for a lawyer**
- Is a hiring interview a "confidential communication" (CA) or "private conversation" (WA) such that all-party consent applies, and is a spoken consent captured on the recording enough?
- Can an AI note-taking vendor process interview audio under these consents, and what must the vendor contract say?
- Which consent texts must be separate from the general terms?

---

## F3. Human review of decisions (blocks pilot if the city is in California)

**Laws**
- California Civil Rights Council regulations on automated-decision systems under FEHA, effective 2025-10-01: https://www.paulhastings.com/insights/client-alerts/new-california-regulations-on-employers-use-of-ai-to-make-decisions-go-into-effect-oct-1-2025
- FEHA definition of "employment agency," Gov. Code 12926: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=12926
- California SB 7 "No Robo Bosses Act" was vetoed 2025-10-13: https://www.fisherphillips.com/en/news-insights/california-governor-vetoes-no-robo-bosses-act.html

**Why it might apply.** RESEARCHED: the CA rules cover AI, algorithms and statistics that facilitate human decisions on recruitment and hiring, reach employers' agents and employment agencies, and treat anti-bias testing as relevant evidence. ASSUMPTION: FEHA's employment agency definition (procuring employees for compensation) covers us because companies pay us per hire. KNOWN (constitution 7.5): humans make every advance or reject decision in the MVP, and AI may summarize evidence. RESEARCHED: an AI summary that shapes a human's choice can still count as "facilitating" a decision. Company-supplied "behavioral characteristics" (constitution 4.10) raise the same risk with no AI at all.

**Triggers.** AI summaries or rankings shown to reviewers. Any sort or filter of candidates. Company criteria that proxy for age, disability or other protected traits. Online assessments that could elicit disability information.

**RECOMMENDATION (product requirements)**
1. Every advance or reject decision has a named human reviewer and a written reason tied to the published rubric. The system stores it.
2. If AI touches review, the reviewer sees the underlying evidence beside every AI summary, and the decision record notes which AI tool was used and on what.
3. No automated ranking, sorting by score, or auto-reject in the pilot. Candidate lists display in a neutral order.
4. Company criteria go through an intake form with job-related fields only. We reject free-text "culture fit" or "traits" criteria and log the rejection.
5. An accommodations request field on signup and interview booking, routed to a human.

**Questions for a lawyer**
- Are we an "employment agency" or "agent" under FEHA and the 2025 ADS regulations when companies pay us per hire?
- Does an AI-written evidence summary shown to a human reviewer make our process an automated-decision system under those rules? What anti-bias testing would we be expected to have done?
- If the pilot city is Seattle, what does the Washington Law Against Discrimination require of us for the same flows?

---

## F4. Data retention and deletion (blocks pilot)

**Laws**
- California ADS regulations and Gov. Code 12946: four-year retention of employment records, including automated-decision data (sources in F3).
- CCPA right to delete, Civil Code 1798.105, if thresholds are met: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.105
- FCRA and ICRAA record and disclosure duties, if F1 applies.

**Why it might apply.** RESEARCHED: California requires covered entities to keep employment records and ADS data for at least four years. ASSUMPTION: candidates will ask us to delete their data. Those two pull against each other, so the product needs to tell apart what it can delete from what it must hold. KNOWN: the repo is public, so any candidate data committed there is published.

**Triggers.** Any candidate data stored. Any deletion request. Any report sent.

**RECOMMENDATION (product requirements)**
1. A data inventory with a retention period per field, shown to candidates at signup.
2. Two tiers: a "hiring record" kept for the legally required period in restricted storage (application, rubric scores, decision reasons, reports sent, consents), and everything else deleted on request or at cohort end plus a set window.
3. A self-serve deletion request that tells the candidate what we deleted and what we must keep and why.
4. Recordings deleted on a short fixed schedule unless a legal hold applies.
5. Companies agree by contract to delete reports on non-hired candidates within a set window and to confirm it.
6. No candidate data in the public repo, ever. Seed and test data are synthetic.

**Questions for a lawyer**
- Which of our records fall under the four-year rule, and does it apply if the pilot is in Washington or the hiring company is out of state?
- Do federal EEOC record rules for employment agencies apply to us, and for how long?
- How should we answer a deletion request for data we must legally retain?

---

## F5. Ownership of submitted code (blocks pilot)

**Laws**
- Copyright Act, 17 U.S.C. 201 (copyright vests in the author): https://www.law.cornell.edu/uscode/text/17/201
- FLSA "employ" includes to "suffer or permit to work," 29 U.S.C. 203(g): https://www.law.cornell.edu/uscode/text/29/203
- US Copyright Office reports on AI and copyrightability: https://www.copyright.gov/ai/

**Why it might apply.** KNOWN: candidates build for two weeks with AI allowed. RESEARCHED: without a written transfer, the author keeps copyright. We still need permission to store, review and show the work to companies. ASSUMPTION: if a company supplies a real problem and uses the output, candidates may look like unpaid workers for that company, which raises wage and fairness risk (constitution 4.4). RESEARCHED: the Copyright Office position is that purely AI-generated material is not protected, so who owns what in a heavily AI-written repo is unclear.

**Triggers.** Company-supplied problems. Companies cloning or reusing submissions. Our use of submissions in marketing or as rubric examples.

**RECOMMENDATION (product requirements)**
1. Terms state candidates keep ownership. They grant us a limited, non-exclusive license to store, review, and show the work to participating companies for hiring evaluation only, revocable on deletion request (subject to F4).
2. Companies get view-only access for evaluation, with a contract term barring use, copying or deployment without a separate deal with the candidate.
3. Pilot problems are synthetic, written by us. Company-supplied problems are out of the pilot.
4. Any marketing or example use requires a separate opt-in per submission.
5. Candidates choose whether their repo is public; we accept private repos with read access granted to us.
6. Rules require disclosure of starter kits and pre-existing code, so licenses of third-party code are visible.

**Questions for a lawyer**
- What license language lets us evaluate and share submissions with companies while candidates keep ownership?
- If a company supplies a real problem, at what point could candidates be treated as working for it, and would prizes or stipends change that?
- Do we need anything in terms about AI-generated portions or third-party code licenses?

---

## F6. Charging only employers (before company contracts)

**Laws**
- California Civil Code 1812.500 and following; employer-paid exemption: https://codes.findlaw.com/ca/civil-code/civ-sect-1812-502/
- Washington RCW 19.31 (employment agency defined by fees from applicants): https://codes.findlaw.com/wa/title-19-business-regulationsmiscellaneous/wa-rev-code-19-31-020/

**Why it might apply.** KNOWN: candidates are free; companies pay $1,000 plus 5% of first-year salary per hire. RESEARCHED: California's employment agency title does not apply to someone who charges fees exclusively to employers. RESEARCHED: Washington's chapter defines an employment agency by fees received from applicants. Both point the same way: any money from candidates changes our legal category.

**RECOMMENDATION (product requirements)**
1. No candidate payment flow of any kind: no entry fee, deposit, paid tier, paid feedback, or paid tool access.
2. Company contracts include a clause that the company may not pass our fee on to the candidate.
3. Any future candidate-paid feature needs lawyer review first.

**Questions for a lawyer**
- With employer-only fees, are we outside California's employment agency title and Washington RCW 19.31, including any bond or registration?
- Does the "employment counseling service" carve-out in California affect a free feedback product for candidates?

---

## F7. Out-of-state AI hiring laws (before going beyond the pilot state)

**Laws and current status**
- Illinois HB 3773 (Human Rights Act amendment), in force 2026-01-01; IDHR draft rules withdrawn 2026-06, notice duty still applies: https://www.workplaceprivacyreport.com/2025/12/articles/artificial-intelligence/illinois-draft-ai-notice-regulations-what-employers-need-to-know/
- NYC Local Law 144 (bias audit and notice for automated employment decision tools): https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page
- Colorado: SB 24-205 enforcement blocked by a federal court 2026-04-27; SB 26-189 signed 2026-05-14 replaces it with a notice-based law effective 2027-01-01: https://www.jdsupra.com/legalnews/colorado-ai-law-in-flux-comprehensive-2107294/

**Why it might apply.** ASSUMPTION: candidates may live in, or companies may hire for roles in, Illinois, New York City or Colorado even if the event is in CA or WA. RESEARCHED: these laws attach to where the candidate or job is, and NYC's applies to employment agencies.

**RECOMMENDATION (product requirements)**
1. Signup asks state of residence; company intake asks job location. Pilot accepts only the pilot state, or flags others for review.
2. Keep the F3 design (human decisions, no ranking) so most of these laws are not triggered.
3. Keep an AI-use notice text ready to show candidates if we expand.

**Questions for a lawyer**
- If a pilot candidate lives in Illinois or the role is in NYC or Colorado, which of these laws apply to us, to the company, or to both?
- Does a human-only decision process with AI summaries fall outside NYC's "substantially assist" test?

---

Not covered (outside the narrowed scope): prize and stipend tax and classification, biometric laws (none triggered while ID checks stay manual with no face matching), confidentiality terms, and EU expansion.
