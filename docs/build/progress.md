# Build progress

| Step | Status | Notes |
|---|---|---|
| 1. Prepare | done | Attribution removed from commits and PR #31; settings set. |
| 2. Foundation | done | Schema and migration; services with 33 unit tests; Launchology tokens and component state CSS; `components/ui` (26 components); app shell (240px rail, 4 to 5 item bottom bar per role); 31 stub routes with guards; evidence stubs with final props; demo sign-in; seed skeleton; smoke e2e (3 tests); `contracts.md`, `feature-map.md`, `0001-stack.md`. Gate: install, typecheck, lint, lint:design, test, build, migrate, seed, e2e all pass. |
| 3. Builders | done | All ten reported. Requests queued in `integration-queue.md`. |
| 4. Integrate and review | done | Merged in order 10, 1, 4, 2, 3, 8, 7, 9, 6, 5 with no conflicts. Code review, /cso, /design-review and /qa as every role run; every high and medium fixed except two founder calls and seed media (decisions 21 to 30, status.md). Permission checks automated in `permissions.spec.ts`. Demo screenshots in `docs/build/screenshots/`. Final gate: typecheck, lint, lint:design, 272 unit tests, build, 15 e2e all pass. |
| 5. Ship draft PR | done | README, status.md, attribution check clean, `build/platform` pushed, draft PR "Firefly platform v1" against `nd/platform-v0`. |
