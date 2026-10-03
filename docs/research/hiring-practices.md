> Carried over from the 2026-10-02 research pass (market-researcher). Sources accessed 2026-10-02. Fee figures here are context only; firefly pricing is a founder DECISION (PRD section 10).

# How startups hire engineers today

Written by market-researcher on 2026-10-02 for Phase 1. All sources accessed 2026-10-02. Labels follow constitution 2.1. Source numbers in [brackets] point to the list at the end.

Context from Batch 1: customer evidence is zero calls. Target (ASSUMPTION): early-career software engineers, 0 to 3 years, full-time, seed to Series A startups. The 1% fee is a placeholder. Build length is undecided (two weeks, or 15 to 20 hours plus a defense interview). Cities under consideration: Seattle and San Francisco.

## Bottom line

1. **The 15% to 25% agency fee assumption holds.** Contingency recruiters charge 15% to 25% of first-year base salary for software engineers, with a 60 to 90 day replacement guarantee. RESEARCHED [1]. Wellfound charges 20% for curated candidates. RESEARCHED [2]. Our 1% is one fifteenth to one twenty-fifth of the going rate.
2. **Hiring takes about six weeks today.** Across Gem customers, time to hire was 41 days in 2024, up from 33 in 2021. RESEARCHED [3]. A third-party summary of Ashby data puts technical roles at a 40-day median. ASSUMPTION [4]. A two-week build plus review and interviews lands in the same range, so speed gives us no edge. Signal quality has to carry the pitch.
3. **Companies are split on AI in interviews.** Canva requires it, Meta is piloting it, and the big assessment vendors all sell AI-assisted modes. RESEARCHED [8][9][10][11]. Amazon bans it, and Karat says almost two-thirds of companies still prohibit it. RESEARCHED [12][13].
4. **Early-career supply is high and startup demand for new grads is low.** Recent graduates face 5.6% unemployment and 42% underemployment (NY Fed, Q2 2026). RESEARCHED [14]. New grads were under 6% of startup hires in 2024, down more than 30% from 2019. RESEARCHED [15]. Candidates will come. Whether seed to Series A startups want to hire them is the open risk.

## 1. Channels

| Channel | What the data says | Label |
|---|---|---|
| Job boards and social sites | 49% of applications, 24.6% of hires (all roles, Gem customers, 2024) | RESEARCHED [3] |
| Outbound sourcing | A sourced candidate is about 5 times more likely to be hired than an inbound applicant | RESEARCHED [3] |
| Rediscovered candidates (already in the company's ATS or CRM) | 44% of sourced hires in 2024 | RESEARCHED [3] |
| Startup networks | YC Work at a Startup: free, one application seen by all YC companies, 150,000+ candidates searching at a time | RESEARCHED [16] |
| Startup job marketplaces | Wellfound: free postings, paid seats, Curated at $499 per seat per month plus 20% | RESEARCHED [2] |
| Recruiter marketplaces | Paraform connects startups with independent recruiters at about 20% to 25% (third-party figure) | ASSUMPTION [17] |
| Agencies | Contingency is the standard model for startup engineering roles. Retained search is mostly for executives | RESEARCHED [1] |
| Referrals | Widely believed to be the top channel for early startups. We found no verified number for seed to Series A | OPEN QUESTION |

The Gem numbers are across all roles and company sizes. Startup-specific and engineering-specific splits sit in the gated full report. OPEN QUESTION: download it (free with email) in Phase 2.

## 2. Agency fees: verifying the 15% to 25% assumption

| Source | Fee | Label |
|---|---|---|
| Recruiting from Scratch (technical recruiting firm), June 2026 | 15% to 25% of first-year base for software engineers. Below 15% signals corner-cutting. Guarantee 60 to 90 days | RESEARCHED [1] |
| Wellfound Curated | 20% of base salary, plus $499 per seat per month | RESEARCHED [2] |
| Hired (2013 to 2020) | Agencies "about 20%" upfront, per Hired's founder in 2013. Hired itself: 15% of first-year salary, or 1% per month for 24 months | RESEARCHED [18][19] |
| Devpost hiring (archived page, date unknown) | 15% of first-year salary, 90-day refund | RESEARCHED [20], low confidence |
| Paraform marketplace | 20% to 25% contingency | ASSUMPTION [17] |
| Third-party roundups | 15% to 30%, with AI/ML roles at 20% to 30% | ASSUMPTION (search snippets, not opened) |

**Verdict: the assumption is confirmed** for software engineers at 15% to 25%. Senior AI/ML roles can run higher.

Worked example (illustrative, inputs adjustable): salary $120,000. Agency at 20% = $24,000. Wellfound Curated at 20% = $24,000 plus seat fees. Our 1% = $1,200. Hired's 1% per month for 24 months = $28,800 if the hire stays two years.

## 3. Time to hire

| Measure | Value | Label |
|---|---|---|
| Time to hire, all roles, Gem customers | 41 days in 2024 vs 33 in 2021 | RESEARCHED [3] |
| Interviews per hire, all roles | 20 in 2024 vs 14 in 2021 | RESEARCHED [3] |
| Time to hire, technical roles, Ashby data through March 2026 | 40-day median. Technical hires take about 23 interview hours each | ASSUMPTION [4] (third-party summary. Ashby's own page did not show the figures) |
| Seed to Series A startups specifically | Likely faster than the median. The same summary says lean startups reach an offer in 2 to 4 weeks | ASSUMPTION [4] |
| Seattle or San Francisco startups | No source found | OPEN QUESTION |

What this means for our timeline (illustrative): two-week build + one week review + one to two weeks interviews and offer = four to five weeks. That roughly equals today's median. A company that arrives mid-cohort waits longer. A standing pool of already-vetted candidates is the way to beat the median.

## 4. Take-home and work-sample norms

- **Developers prefer practical tests.** 66% prefer practical coding challenges and 78% say current tests do not match the job (HackerRank, 13,732 respondents, early 2025). RESEARCHED [5]. Vendor survey, so some bias.
- **Project-based interviews are mainstream enough to be acquired.** Karat bought Byteboard's project-based interview in January 2025. RESEARCHED [21]. CoderPad sells take-home "projects". RESEARCHED [10].
- **Take-home length.** We found no credible survey. Blog and job-seeker sources say companies quote 2 to 8 hours while candidates report spending far longer, sometimes 12 to 20 hours. ASSUMPTION [22], low quality. A two-week unpaid build is far beyond any norm we found.
- **Paid take-homes.** No credible data on how common they are. OPEN QUESTION.

## 5. How AI has changed technical assessment

| Stance | Who | Date | Label |
|---|---|---|---|
| Requires AI in coding interviews. Grades how candidates guide and critique AI. Found that candidates with little AI experience lacked the judgment to steer it | Canva | 2025-06-11 | RESEARCHED [8] |
| Piloting AI-assisted coding interviews, saying it matches the real work setting and makes covert LLM cheating less useful | Meta | 2025-07-29 report | RESEARCHED [9] |
| Sells AI-assisted assessments with AI transcripts | CodeSignal (May 2025), HackerRank (July 2025), CoderPad (all plans), Karat NextGen (Dec 2025) | 2025 | RESEARCHED [6][7][10][13] |
| Bans GenAI in interviews unless permitted, may disqualify | Amazon | 2025-03-14 report | RESEARCHED [12] |
| Asks applicants not to use AI on applications. Still in force as of May 2025 | Anthropic | Feb to May 2025 | RESEARCHED [23] |
| "Almost two-thirds of companies still prohibit AI use in interviews" | Karat survey | 2025-12-10 | RESEARCHED [13] |

Supporting numbers: 97% of developers use at least one AI assistant, and 76% say AI makes it easier to game assessments. RESEARCHED [5].

Takeaway: the market is moving toward "AI allowed, watch how it is used", led by large companies and the assessment vendors. Seed to Series A practice is unknown. OPEN QUESTION.

## 6. Entry-level software engineering market, 2025 to 2026

- **Recent grads overall.** Unemployment about 5.6% and underemployment 42% in Q2 2026. RESEARCHED [14].
- **CS and computer engineering majors.** About 6.1% and 7.5% unemployment for recent grads, per NY Fed by-major data as reported by press. ASSUMPTION [24]: the NY Fed page did not show the by-major table in our fetch, and the data year is unclear.
- **New grad share of hires.** Big Tech: 7% of hires in 2024, down 25% from 2023 and over 50% from 2019. Startups: under 6% of hires, down 11% from 2023 and over 30% from 2019. RESEARCHED [15].
- **Experienced engineers.** SignalFire says hiring for mid and senior roles recovered in 2024 while new grad hiring fell. Companies often post junior roles and fill them with more senior people. RESEARCHED [15].
- **Overall tech hiring.** CoderPad reports US technical hiring activity up 90% versus mid-2023 (vendor survey, March 2026). RESEARCHED [25], treat with caution.

## Implications for us

- **RECOMMENDATION.** Keep 1% labeled a placeholder. The market anchor is 15% to 25%, and even startup-native Wellfound charges 20%. Model price points of 5%, 10% and 15%, plus a flat per-hire fee, in `business-model.md`.
- **HYPOTHESIS.** Seed to Series A startups will hire 0 to 3 year engineers if pre-vetted. The data cuts against it: new grads are under 6% of startup hires. Test: in 10 to 15 founder calls, at least 5 report hiring or planning to hire someone with under 3 years of experience in the next 6 months. Fail below 3.
- **RECOMMENDATION.** Favor the 15 to 20 hour build plus defense interview over two weeks. Two weeks is far above any take-home norm we found, and it adds a week or more to a hiring process that already takes about six weeks.
- **RECOMMENDATION.** Frame the pitch around signal quality, since we cannot beat the 40-day median on speed with cohorts. A standing vetted pool is the only way to be faster.
- **HYPOTHESIS.** Candidate supply will be easy to get given the weak entry-level market. Test: one posting in the chosen city gets 100 or more qualified signups within two weeks. Fail below 40.

## Open questions

1. What do seed to Series A startups in Seattle and San Francisco actually spend per engineering hire, in fees and engineer hours? Who answers: founder discovery calls.
2. What is their time to hire for early-career engineers? Who answers: founder calls, plus Gem's gated report.
3. Do these startups allow AI in their own interviews today? Who answers: founder calls.
4. How many hours will early-career candidates put into an unpaid build, and does a prize or stipend change that? Who answers: candidate discovery calls.
5. What are current NY Fed unemployment numbers for CS and computer engineering majors? Who answers: download the NY Fed by-major table directly.

## Sources (all accessed 2026-10-02)

1. Recruiting from Scratch, "How much does a technical recruiting firm cost", 2026-06-25: https://www.recruitingfromscratch.com/blog/how-much-does-a-technical-recruiting-firm-cost-a-startup-founder-s-guide-2026
2. Wellfound help, Curated cost: https://help.wellfound.com/article/721-curated-cost
3. Gem, 10 takeaways from the 2025 Recruiting Benchmarks report, 2025-01-16: https://vercel.gem.com/blog/10-takeaways-from-the-2025-recruiting-benchmarks-report
4. Noon.ai, time to hire benchmarks 2026 (third-party summary of Ashby data): https://www.noon.ai/blog/articles/181-time-to-hire-benchmarks-2026 and Metaview, time to hire by role: https://content.metaview.ai/time-to-hire-by-role/
5. HackerRank, 2025 Developer Skills Report: https://www.hackerrank.com/reports/developer-skills-report-2025
6. CodeSignal press release, 2025-05-28: https://codesignal.com/newsroom/press-releases/codesignal-launches-ai-assisted-coding-assessments-and-interviews-redefining-technical-hiring-in-the-ai-era/
7. HackerRank AI Day 2025 recap: https://www.hackerrank.com/blog/hackerranks-ai-day-2025-product-launch-recap/
8. Canva engineering blog, 2025-06-11: https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews
9. 404 Media, Meta AI coding interviews, 2025-07-29: https://www.404media.co/meta-is-going-to-let-job-candidates-use-ai-during-coding-tests/
10. CoderPad pricing page: https://coderpad.io/pricing/
11. See [6], [7], [10], [13].
12. ITPro, Amazon bans AI tools in interviews, 2025-03-14 (citing Business Insider): https://itpro.com/business/careers-and-training/amazon-bans-ai-tools-during-job-interviews
13. Karat, NextGen launch, 2025-12-10: https://karat.com/karat-launches-nextgen-interviews-the-first-human-led-ai-enabled-talent-evaluation-solution/
14. Federal Reserve Bank of New York, Labor Market for Recent College Graduates: https://www.newyorkfed.org/research/college-labor-market
15. SignalFire, State of Tech Talent Report 2025, 2025-05-20: https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025
16. YC Work at a Startup FAQ: https://www.workatastartup.com/faq
17. HeroHunt, Paraform pricing (third party): https://www.herohunt.ai/blog/paraform-pricing-alternatives-2026/
18. TechCrunch, Hired billing model, 2013-11-04: https://techcrunch.com/?p=909976
19. Vator, Hired $40M Series C, 2016-02-08: https://vator.tv/2016-02-08-hired-raises-40m-series-c-for-tech-talent-marketplace/
20. Archived Devpost hiring page (capture date unknown): https://web-archive.nli.org.il/National_Library/mp_/https://devpost.com/teams/hiring
21. GeekWire, Karat acquires Byteboard, 2025: https://www.geekwire.com/2025/technical-recruiting-startup-karat-makes-third-acquisition-swooping-up-byteboard/
22. Talentally, evaluating take-home assignments, 2026-08-20: https://talentally.com/resources/is-this-a-skills-test-or-free-work-how-to-evaluate-take-home-assignments
23. Fortune, Anthropic AI policy for applicants, 2025-05-19: https://fortune.com/2025/05/19/ai-company-anthropic-chatbots-banned-hiring-job-applicants-communication
24. Yahoo News, CS majors unemployment (reporting NY Fed data): https://www.yahoo.com/news/learn-code-backfires-spectacularly-comp-104547287.html
25. CoderPad, 2026 State of Tech Hiring: https://coderpad.io/blog/hiring-developers/new-research-the-2026-state-of-tech-hiring-what-ai-means-for-developers-and-hiring-teams/
