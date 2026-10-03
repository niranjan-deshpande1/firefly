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
