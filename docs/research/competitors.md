# Competitor product research

Scope: product level only (what candidates and companies experience). Market sizing and pricing are out of scope by founder request. All sources accessed 2026-10-03.

Labels follow constitution 2.1. "RESEARCHED" claims cite a link. Some sources are vendor marketing or secondary review sites; those are flagged as such.

## Summary

1. **RESEARCHED:** The big assessment vendors (HackerRank, CodeSignal, Karat, CoderPad) have all moved to "AI allowed" formats in 2025 and 2026. Allowing AI is no longer a differentiator on its own. Sources in the sections below.
2. **RESEARCHED:** What they sell to companies is visibility into *how* the candidate worked with AI: chat transcripts, session replays, code evolution. Their sessions are short (about 20 to 60 minutes) and run inside their own IDE.
3. **ASSUMPTION:** Nobody we found combines a multi-week real project, an in-person defense, and a hiring marketplace for early-career engineers. The closest are one-off "recruitment hackathons" run by VCs or companies.
4. **RESEARCHED:** Triplebyte and Hired both died as standalone marketplaces (2023 and 2024). Their product lessons: candidates valued background-blind evaluation, feedback, and salary-up-front; trust broke when Triplebyte tried to make profiles public by default; Hired rejected 90 to 95% of applicants and ran out of qualified supply in hot segments.

## Assessment and interview platforms

### HackerRank
- **Candidates experience:** a timed browser test, optionally in Secure Mode (full screen enforced, copy/paste blocked, tab-switch alerts), Proctor Mode (webcam snapshots, AI screenshot analysis, photo ID before start), or a locked-down desktop app. RESEARCHED: [HackerRank Test Integrity](https://hackerrank-knowledge-base.help.usepylon.com/articles/1079706165).
- **AI policy:** HackerRank now offers an AI-assisted IDE where an AI assistant is enabled for candidates, plus an "AI Interviewer" product. RESEARCHED (HackerRank's own marketing): [HackerRank AI-assisted IDE prep](https://www.hackerrank.com/writing/how-to-prepare-hackerrank-ai-assisted-ide-technical-assessment-interview-2025). The same company also sells heavy anti-cheat for non-AI tests, so the policy is set per test by the employer.
- **Companies see:** a candidate report with score, pasted content, number and duration of window exits, webcam snapshots, and plagiarism flags based on code evolution and similarity. RESEARCHED: [Test Integrity](https://hackerrank-knowledge-base.help.usepylon.com/articles/1079706165). For AI-assisted tests, a summary of the candidate's AI interactions. RESEARCHED: same AI-assisted IDE page above.
- **Lesson:** the anti-cheat arms race is the core product here. Webcam and lockdown features signal distrust to candidates. ASSUMPTION.

### CodeSignal
- **Candidates experience:** coding challenges in CodeSignal's IDE with "Cosmo," a built-in AI assistant, in either Full Co-Pilot mode or a light Guided Support mode. RESEARCHED: [CodeSignal blog](https://codesignal.com/blog/introducing-ai-assisted-coding-assessments-interviews/).
- **Companies see:** full transcripts of candidate-AI chat and session replays of how the code developed. RESEARCHED: same source. CodeSignal also markets AI proctoring, identity checks, and leaked-question detection. RESEARCHED (vendor page): [CodeSignal for startups](https://codesignal.com/startups-and-smbs/).
- **Lesson:** "replay plus AI transcript" is becoming the standard evidence package. ASSUMPTION.

### Karat
- **Candidates experience:** a one-hour live interview with a Karat "Interview Engineer" (about 10 min discussion, 40 min coding), bookable 24/7. Any candidate can request a "redo" within 24 hours with new questions and a new interviewer; Karat recommends the client use the higher score. RESEARCHED: [Karat redo interviews](https://karat.com/1000-hires-cant-be-wrong-the-redo-interview-is-the-right-approach/), [Karat interview page](https://karat.com/karat-interview/).
- **AI policy:** Karat keeps a library of interviews that do and do not allow ChatGPT. RESEARCHED: [Karat interview page](https://karat.com/karat-interview/). In December 2025 it launched "NextGen" interviews: multi-file projects with an integrated AI assistant while a human interviewer probes reasoning and trade-offs live. RESEARCHED (secondary coverage of press release): [City AM](https://www.cityam.com/?p=2385600), [Business Wire listing](https://www.businesswire.com/news/home/20251210685922/en) (page blocked our fetch).
- **Companies see:** a structured scorecard and recommendation from the interviewer. RESEARCHED at a high level from the Karat interview page; report details OPEN QUESTION.
- **Lesson:** Karat's NextGen is the closest product to our "build with AI, then defend it to a human" idea, compressed into one session. The redo policy is a strong candidate-trust feature. ASSUMPTION.

### CoderPad
- **Candidates experience:** live pair-coding pads and take-homes. CoderPad's own hiring policy lets candidates use AI in all interviews if they are open about it, and says reading scripts, accepting AI output uncritically, or treating AI "as a teleprompter" will hurt them. RESEARCHED: [CoderPad: using AI in interviews](https://coderpad.io/careers/using-ai-in-interviews/).
- **Companies see:** AI-assisted scoring and summaries, with a stated rule that AI does not decide who advances. RESEARCHED: same page. CoderPad added a ChatGPT integration to its pads in May 2023. RESEARCHED: [Business Wire, 2023-05-16](https://www.businesswire.com/news/home/20230516005831/en/CoderPad-Launches-ChatGPT-Integration-to-Better-Assess-Technical-Candidates).
- **Lesson:** their written "what undermines you" list is a cheap, copyable way to set candidate expectations about AI. RECOMMENDATION.

### Byteboard
- **Candidates experience:** a small, time-boxed project that simulates a day of async engineering work, taken on the candidate's own schedule in their own editor or Byteboard's. RESEARCHED: [TechCrunch, 2022-01-26](https://techcrunch.com/2022/01/26/byteboard-nabs-5m-seed-to-change-the-way-engineers-get-hired). Started inside Google's Area 120 in 2019. RESEARCHED: [9to5Google, 2019-07-17](https://9to5google.com/2019/07/17/area-120-byteboard-interview/).
- **Companies see:** anonymized results scored against a defined skill set. RESEARCHED: TechCrunch above.
- **Status and AI policy in 2026:** OPEN QUESTION. Check byteboard.dev.
- **Lesson:** project-based assessment already exists; Byteboard keeps it to a few hours. Our two weeks is far larger. ASSUMPTION.

## Marketplaces and AI hiring

### Mercor
- **Candidates experience:** upload a resume, then a roughly 20-minute AI video interview tailored to the resume and role. Camera and microphone are required with face visible. Up to three attempts. The result carries over to other applications that need the same interview. Free practice interviews exist. RESEARCHED: [Mercor talent docs: AI interview](https://talent.docs.mercor.com/support/ai-interview.md).
- **AI policy:** candidates may use AI for grammar only; using LLMs to compose answers, evaluate code, or generate explanations is banned. RESEARCHED: same page.
- **Companies see:** a profile assembled from resume, GitHub, portfolio, and interview transcript. RESEARCHED (secondary): [InterviewQuery Mercor guide](https://www.interviewquery.com/guides/mercor-ai-engineer).
- **Lesson:** "interview once, reuse everywhere" is the main candidate benefit. Mercor's questioning focuses on drilling into the candidate's own past work, the same skill our defense interview targets. ASSUMPTION.

### Wellfound (formerly AngelList Talent)
- **Candidates experience:** one profile serves as the application to every role; jobs show salary and equity up front; candidates talk to in-house teams, and third-party recruiters are banned. RESEARCHED (secondary review, consistent with Wellfound's long-standing norms): [Jobright Wellfound review 2026](https://jobright.ai/blog/wellfound-review-2026-features-walkthrough-and-alternatives/), [Wellfound about](https://wellfound.com/about).
- **Lesson:** startup candidates expect comp transparency and direct founder contact. ASSUMPTION.

### Y Combinator Work at a Startup
- **Candidates experience:** one profile (experience, GitHub, preferences such as "hard technical problems" vs "product and business impact"), then direct contact from YC founders. RESEARCHED: [YC blog: Finding your next role through YC](https://www.ycombinator.com/blog/finding-your-next-role-through-y-combinator), [Announcing Work at a Startup](https://blog.ycombinator.com/announcing-ycs-work-at-a-startup/).
- **Lesson:** this is free to candidates and is where seed-stage founders already source. Our marketplace has to show something it cannot: verified work plus a defended interview. ASSUMPTION.

### Devpost
- **Candidates experience:** register, form teams, submit a project page with description, repo link, and a short demo video (often 2 to 5 minutes, set by the organizer). RESEARCHED (organizer guides built on Devpost): [ACM UTSA submission guide](https://acmutsa.notion.site/Submitting-Your-Project-to-Devpost-9e7014a39d5f481d8439f63f04a78300), [HackNC State judging](https://hackncstate2025.notion.site/Submission-Judging-143963046a38810d998acb9b9290863d).
- **Organizers experience:** registration, submissions, custom judging criteria, judge management, score aggregation, prizes. Developer portfolios are public. RESEARCHED (secondary): [Fitgap: Devpost for Teams](https://us.fitgap.com/products/devpost-for-teams).
- **Hiring:** we found no evidence of a built-in hiring pipeline. OPEN QUESTION.
- **Lesson:** Devpost proves the hackathon side is commodity software. Judges reportedly face 200+ projects and rely on the video and description, which rewards presentation over understanding. RESEARCHED: HackNC State page above. ASSUMPTION that this weakens hiring signal.

### Recruitment hackathons (closest direct analogs)
- Bessemer ran an "AI Devs Recruitment Hackathon" in India for portfolio companies with cash prizes and roles as the outcome. RESEARCHED: [Luma event page](https://luma.com/2433para).
- Deriv ran an "AI Talent Sprint" hackathon in Dubai with direct hiring pathways. RESEARCHED: [lablab.ai summary](https://lablab.ai/ai-articles/deriv-ai-talent-sprint-hackathon-summary).
- Typical promise to winners: skip the resume screen and get guaranteed interviews. RESEARCHED (secondary): [Reskilll blog](https://blogs.reskilll.com/5-hackathon-projects-got-participants-hired-real-stories-offers/).
- **Lesson:** the format is proven to attract participants when tied to named employers. These are one-off events, not a repeatable platform with a defense step. ASSUMPTION.

## Triplebyte and Hired: product lessons

### Triplebyte (founded 2015, assets sold to Karat March 2023)
| What | Effect | Source |
|---|---|---|
| Background-blind online quiz, then a 2-hour video technical interview | Self-taught and bootcamp candidates got a fair shot; a core reason candidates joined | RESEARCHED: [TechCrunch](https://techcrunch.com/?p=1185510), [Candor review](https://candor.co/articles/tool-reviews/will-triplebyre-land-you-your-dream-job) |
| Detailed feedback after the interview | Candidates repeatedly cite it as valuable | RESEARCHED (user reviews): Candor review above |
| Their finding: the quiz predicted success; talking about past projects did not | Directly relevant warning for our defense interview | RESEARCHED (secondary, reporting Triplebyte's own claim): Candor review above |
| Oct 2020: emailed users that profiles would become public unless they opted out within a week | Hacker News uproar; CEO's defensive replies made it worse; reversed days later with an apology | RESEARCHED: [Blind PSA thread](https://www.teamblind.com/post/psa-triplebyte-made-profiles-public-and-your-employer-may-have-seen-it-mf83gf0f), [Tell HN repost](https://www.theteams.kr/stack/news_view/Compass/843) |
| March 2023: Karat bought the assessment product; the Magnet talent network was shut down; candidates lost access to profiles and scores after March 31 | Candidates' earned credentials vanished | RESEARCHED: [TechCrunch, 2023-03-16](https://techcrunch.com/?p=2502886), [Karat TB candidates page](https://connect.karat.com/tb-candidates) |
| Raised just under $50M and ran out of runway | Assessment tech survived; the marketplace did not | RESEARCHED: TechCrunch 2023 above |

### Hired (reverse marketplace, folded into LHH June 2024)
| What | Effect | Source |
|---|---|---|
| Companies "applied" to candidates with salary up front; candidates often got several interview requests in their first week | Strong candidate pull; felt like being courted | RESEARCHED: [Flexiple review](https://flexiple.com/reviews/hired), [Marketing BS interview with former CMO, 2021-04-14](https://marketingbs.substack.com/p/interview-juney-ham-former-cmo-hiredcom) |
| Talent advocates helped with prep and negotiation | Human touch was part of the candidate value | RESEARCHED: Marketing BS above |
| Curated both sides; only 5 to 10% of candidates approved | High match quality; 90 to 95% of sign-ups were turned away, which the former CMO described as large unused capacity | RESEARCHED: Marketing BS above |
| Ran out of qualified supply in hot segments (e.g. Rails engineers in SF) and expanded into weaker categories | Growth got less efficient | RESEARCHED: Marketing BS above |
| Acquired by Adecco's Vettery (2020); standalone platform folded into LHH Recruitment Solutions on 2024-06-14 | Ended as a feature of a staffing firm | RESEARCHED: [Hired company update](https://hired.com/blog/employers/company-update-hired-lhh-recruitment-solutions/), [Staffing Industry Analysts](https://www.staffingindustry.com/Editorial/Daily-News/Adecco-incorporating-Hired-into-LHH-business-69249) |

## Features: copy, avoid, differentiate

| Feature | Seen at | Call | Why |
|---|---|---|---|
| AI chat transcript plus session replay for reviewers | CodeSignal, HackerRank | Copy (lightweight) | Now the expected evidence of "how they used AI". For two weeks, a repo history plus an AI-usage write-up may be enough at first (manual first, 2.4) |
| Written "how to use AI well here" guidance for candidates | CoderPad | Copy | Cheap and sets expectations |
| Redo or second chance | Karat, Mercor (3 attempts) | Copy in spirit | Builds candidate trust; e.g. one reschedule of the defense |
| Interview once, reuse result across companies | Mercor, Triplebyte | Copy | Main reason a candidate would spend two weeks with us |
| Background-blind first review | Triplebyte, Byteboard | Copy | Fits early-career and non-traditional candidates |
| Feedback to every finalist | Triplebyte | Copy | Most-praised candidate feature; counters "unpaid labor" feeling |
| Salary range up front, direct founder contact | Wellfound, Hired, YC WaaS | Copy | Startup candidates expect it |
| Webcam lockdown, tab tracking, copy/paste blocking | HackerRank, CodeSignal | Avoid | Our stance (3.7) is verification by understanding; the in-person defense covers identity |
| Opt-out public profiles, data that disappears if we shut down | Triplebyte | Avoid | Destroyed trust; make visibility opt-in and let candidates export their work |
| Rejecting most sign-ups at the door | Hired | Avoid | Burns supply; better to let anyone build and rank afterward |
| Judging mainly from a demo video | Devpost-style hackathons | Avoid | Rewards presentation over understanding |
| Multi-week real project plus in-person defense with the hiring startup present | Nobody found | Differentiate | Karat NextGen does a one-hour version remotely |
| Evidence of product judgment and decisions over time | Nobody found | Differentiate | Short tests can't show it |

## Implications for us

1. **RECOMMENDATION:** Position on depth and in-person verification, since "AI allowed" is now table stakes at every major vendor. Our pitch to startups is "two weeks of real building, defended face to face," which none of these products offer.
2. **HYPOTHESIS:** A defense interview grounded in the candidate's own project predicts job performance better than the project alone. Triplebyte reported the opposite for talking about past projects. Test: for the pilot cohort, compare company interviewers' ratings of project quality vs defense quality against offer decisions; pass if the defense changes the ranking for at least 20% of finalists (illustrative threshold, founders to set).
3. **RECOMMENDATION:** Ship candidate-trust features from cohort one: feedback for every finalist, opt-in visibility, an exportable portfolio, salary ranges shown before the hackathon starts. These cost little and are what candidates praised or punished at Triplebyte and Hired.
4. **RECOMMENDATION:** Skip proctoring software. Capture a light evidence trail instead (git history, a short AI-usage log the candidate writes) and let the defense do the verification. Revisit if companies ask for replays.
5. **HYPOTHESIS:** Early-career engineers will spend two weeks if named startups commit to interviewing top finishers. Recruitment hackathons by Bessemer and Deriv suggest yes. Test: sign-ups and completion rate in the first cohort; pass if at least 50% of registrants submit (illustrative).
6. **RECOMMENDATION:** Use existing hackathon tooling (or a form plus spreadsheet) for cohort one; Devpost shows that side is commodity and not where our value sits.

## Open questions

1. What exactly does a Karat NextGen report contain, and how long is the session? Answer by: requesting a Karat demo or reading the full press release.
2. Is Byteboard still operating in 2026, and does it allow AI? Answer by: checking byteboard.dev.
3. Does Devpost offer any recruiter or talent-search feature to sponsors today? Answer by: Devpost sales page or a call.
4. What did Bessemer's and Deriv's recruitment hackathons convert to in actual hires? Answer by: contacting organizers.
5. Do seed to Series A founders want AI transcripts and replays, or is the in-person defense enough? Answer by: founder interviews (we have zero recorded calls).
6. Will candidates accept a two-week commitment when Mercor asks 20 minutes and Karat asks one hour? Answer by: candidate interviews and pilot sign-up data.
