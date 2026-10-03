# Integration queue

Shared changes requested by builders, applied at integration (step 4).

| From | Change | Decision |
|---|---|---|
| 1 Discovery (`build/discovery` ab36d86) | none; add `app/hackathons/loading.tsx` skeleton | apply |
| 9 Interviews (`build/interviews` 96af309) | A: `interview.run` = assigned interviewer of any role (company panelists on joint and company-run interviews) | apply; brief lists company-run interviews |
| 9 Interviews | B: `Interview.timeZone String @default("America/Los_Angeles")` + migration, then pass it to `<Time>` in two pages and the create action | apply |
| 9 Interviews | C: `interviewScheduled` email takes `minutes` | apply |
| 9 Interviews | D: organizer console links to `/interviews/new?projectId=` | ask organizer branch / add at integration |
| 4 Profiles (`build/profiles` ec8cff5) | `lib/auth/config.ts`: `AUTH_SECRET ||` instead of `??` (empty string in .env.example breaks demo mode) | apply |
| 4 Profiles | First-time GitHub sign-ins with no CandidateProfile go to `/onboarding` | apply |
| 4 Profiles | Seed uses `CONSENT_VERSION` from `lib/profiles` | sent to Ops; verify at merge |
| 4 Profiles | Founder calls: retention promise isn't enforced automatically; hiring cohorts show on public profiles (signals job seeking); any builder can opt into the talent pool | list in status.md |
| all | Worktrees resolve `file:./dev.db` to the main checkout's DB through the symlink; told running builders to use an absolute DATABASE_URL. Main DB gets `demo:reset` at integration. | done |
| 2 Participation (`worktree-agent-a274bcff21e4b92bb` 29367cc) | `team.manage` gets an `isTeamMember` fact; then pass it in `authorizeTeam` | apply |
| 2 Participation | `loadFacts` sets `resultsPublished` when `cohortConfig.resultsAt <= now` | apply |
| 2 Participation | Registration consent check adds `consentVersion === CONSENT_VERSION` (TODO in lib/participation/actions.ts) after Profiles merges | apply |
| 2 Participation | Discovery overview links to register and check-ins | check at merge |
| 6 Companies (`build/companies` 338866d) | none required. Amounts render "$1,000"; brief examples say "$1,000.00": switch `formatCents` to 2 decimals | apply (matches brief) |
| 6 Companies | No admin handling of interview requests yet; Interviews marks matching requests SCHEDULED | note in status.md |
| 3 Projects (`build/projects` cb4f391) | optional `project.create` permission action | apply |
| 3 Projects | Hackathon tabs: current tab from pathname (Discovery says it already uses usePathname; verify) | check at merge |
| 3 Projects | `.gitignore` `/node_modules/` doesn't match a symlink; use `/node_modules` | apply |
| 7 Evaluation (`nd/evaluation` 64307ea) | Seed should write rubric from `RUBRIC_V0` in `lib/review/rubric.ts`; reconcile with Ops seed dimensions | check at merge |
| 7 Evaluation | Held feedback (future `resultsAt`) sends no `feedbackReady` email; needs a scheduled sender | note in status.md |
| 7 Evaluation | Transcript and check-in text is not masked before reveal | note in status.md |
