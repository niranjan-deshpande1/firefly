# Feature map

Every item in brief sections 4.1 and 4.2, with its owner and priority. **P0** is on the demo path (brief section 8). **P1** is required for the definition of done. **P2** is the remainder of the area. Demo step numbers refer to brief section 8.

## 4.1 Devpost parity

| Feature | Owner | Priority | Demo step |
|---|---|---|---|
| Landing page for builders and companies | 1 Discovery | P0 | 1 |
| Hackathon listing: search, filters (type, status, theme, online or in person, dates), sort | 1 Discovery | P0 | 1 |
| Hackathon page tabs: overview, rules, prizes, schedule, judging criteria, resources, updates, participants | 1 Discovery | P0 | 1 |
| Hackathon tabs: project gallery and teams | 3 Projects, 2 Participation | P0 (gallery), P1 (teams) | 1 |
| Registration with eligibility confirmation and consent check | 2 Participation | P1 | |
| Participant dashboard | 2 Participation | P0 | 3, 8 |
| Teams: create, invite, join, looking-for-teammates board (open hackathons only) | 2 Participation | P1 | |
| Project posting: title, tagline, Markdown story, built-with, links, images, demo video, repo, team, draft or posted | 3 Projects | P1 | |
| Project page | 3 Projects | P0 | 3 |
| Gallery with built-with filters and winner labels (DESIGN.md D3) | 3 Projects | P0 | 1 |
| Likes (no visible counts, D5) and comments with moderation | 3 Projects | P1 | |
| Judging for open hackathons: assign judges, score against criteria | 5 Organizer (assign), 7 Evaluation (score) | P1 | |
| Winners per prize, shown on gallery and project pages | 5 Organizer (pick), 3 Projects (show) | P0 (seeded winners show) | 1 |
| User profiles: bio, skills, links, portfolio, hackathons joined, wins | 4 Profiles | P1 | |
| Organizer console: create and edit hackathons, prizes, schedule, criteria, resources, participants, judges, updates, winners | 5 Organizer | P1 | |
| Email notifications written to the email log | each sender; 10 Ops (viewer) | P0 (log viewer) | 7 |

## 4.2 Firefly additions

| Feature | Owner | Priority | Demo step |
|---|---|---|---|
| For-companies page with pricing | 1 Discovery | P1 | |
| Company profile and team members | 6 Companies | P1 | |
| Role intake with company-specific criteria | 6 Companies | P0 | 2 |
| Company dashboard | 6 Companies | P0 | 2 |
| Cohort enrollment creating the $1,000 non-refundable invoice | 6 Companies (via `lib/billing`) | P0 | 2 |
| Hiring cohort type and cohort config (kickoff, weekly check-ins, office hours, deadline, defense window, results) | 5 Organizer | P1 | |
| Weekly check-ins | 2 Participation | P0 (seeded, shown) | 3 |
| Evidence locker: repo connection and commit timeline (GitHub API or seed) | 8 Evidence | P0 | 3 |
| Evidence locker: AI transcript upload and viewer | 8 Evidence | P0 (viewer), P1 (upload) | 3 |
| Evidence locker: decision log editor | 8 Evidence | P0 (view), P1 (edit) | 3 |
| Evidence locker: check-in history | 8 Evidence | P0 | 3 |
| AI evidence summary (API key or seeded fallback; no scoring) | 8 Evidence | P0 (seeded) | 3 |
| Reviewer queue | 7 Evaluation | P0 | 4 |
| Blind scoring workspace: rubric plus role criteria, rationale and evidence link required | 7 Evaluation | P0 | 4 |
| Blind mode with audited reveals | 7 Evaluation | P0 | 4 |
| Calibration view: flag gaps of 2 or more, require reconciliation note | 7 Evaluation | P0 | 4 |
| Decisions: advance, hold, don't advance, with required reason | 7 Evaluation | P0 | 4 |
| Written feedback for finishers | 7 Evaluation (write), 2 Participation (show) | P0 | 8 |
| Defense interview scheduling: model, mode, time, link or location, interviewers | 9 Interviews | P1 | |
| Interview room: identity check, script, timers, scorecard per section | 9 Interviews | P0 | 5 |
| Passed interview marks the project verified | 9 Interviews | P0 | 5 |
| Shortlist per role | 6 Companies | P0 | 6 |
| Candidate report with snapshot; every view audited | 6 Companies | P0 | 6 |
| Interview requests from companies | 6 Companies | P1 | |
| Hire reporting creating the 5% hire invoice | 6 Companies (via `lib/billing`) | P0 | 6 |
| Talent pool of opted-in finishers (companies with an active enrollment) | 6 Companies (browse), 4 Profiles (opt-in) | P0 (opt-in prompt), P1 (browse) | 8 |
| Verified project badge on profiles | 4 Profiles | P1 | |
| Onboarding with role choice and consent screen (version and time stored) | 4 Profiles | P1 | |
| Privacy settings: visibility, talent pool opt-in | 4 Profiles | P0 (opt-in) | 8 |
| Data export (JSON download) and delete requests | 4 Profiles (request), 10 Ops (handle) | P1 | |
| Invoices with draft, sent, paid and "mark paid"; flat fee shows non-refundable | 10 Ops | P0 | 7 |
| Company billing page | 10 Ops | P1 | |
| Admin funnel dashboard with charts | 10 Ops | P0 | 7 |
| Audit log viewer with filters | 10 Ops | P0 | 7 |
| Email log viewer | 10 Ops | P0 | 7 |
| Data requests handling | 10 Ops | P1 | |
| Settings: fees, attribution window, retention | 10 Ops | P1 | |
| Full seed data (brief section 8) | 10 Ops | P0 | all |
| Demo script and `demo-path.spec.ts` | 10 Ops | P0 | all |

## Out of scope (brief 4.3)

Real payments, real email sending, built-in video calls (links only), running candidate code, the code similarity check, automated scoring, ranking, rejection or matching, browser or IDE monitoring, ATS integrations, native apps.
