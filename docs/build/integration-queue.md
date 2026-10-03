# Integration queue

Shared changes requested by builders, applied at integration (step 4).

| From | Change | Decision |
|---|---|---|
| 1 Discovery (`build/discovery` ab36d86) | none; add `app/hackathons/loading.tsx` skeleton | apply |
| 9 Interviews (`build/interviews` 96af309) | A: `interview.run` = assigned interviewer of any role (company panelists on joint and company-run interviews) | apply; brief lists company-run interviews |
| 9 Interviews | B: `Interview.timeZone String @default("America/Los_Angeles")` + migration, then pass it to `<Time>` in two pages and the create action | apply |
| 9 Interviews | C: `interviewScheduled` email takes `minutes` | apply |
| 9 Interviews | D: organizer console links to `/interviews/new?projectId=` | ask organizer branch / add at integration |
