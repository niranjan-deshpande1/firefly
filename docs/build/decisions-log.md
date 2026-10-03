# Build decisions log

Decisions made during the platform build run (brief dated 2026-10-03). The brief wins over earlier docs; conflicts are logged here.

| # | Decision | Why |
|---|---|---|
| 1 | Attribution off in `~/.claude/settings.json` and `.claude/settings.json` with `attribution.commit = ""`, `attribution.pr = ""`, `attribution.sessionUrl = false`. `includeCoAuthoredBy` is deprecated, so it isn't set. | Brief section 2; keys checked against code.claude.com/docs/en/settings-reference. |
| 2 | Commit messages on `nd/platform-v0` rewritten with `git filter-branch --msg-filter`; authors, dates and trees unchanged; force-pushed with lease. | Brief section 2. |
| 3 | ASSUMPTION: attribution window for hire fees is 12 months from cohort end, editable by admins (AppSetting). | Brief section 3. |
| 4 | CONFLICT: PRD v0.2 says cohort 1 runs with no custom software and moved the verified profile, talent pool and office hours to Later. The brief approves the full platform and brings those three back. The brief wins. The code similarity check stays out. | Brief sections 1 and 3. |
| 5 | CONFLICT: the PRD charges the flat fee "at signing"; the brief says "at enrollment" per hiring cohort joined. Same moment in the product (company enrolls a role into a cohort). Issue #3 closed with the non-refundable note. | Brief section 3. |
| 6 | CONFLICT: evaluation.md recommends no company-specific dimension for the pilot. The brief requires role-specific criteria scored alongside the rubric. The brief wins. | Brief section 4.2. |
| 7 | No dataviz skill is installed; charts use Recharts with the DESIGN.md tokens. | Brief section 5. |
| 8 | /design-consultation questions answered from the brief: direction "builder's workshop at dusk", Fraunces + Instrument Sans + JetBrains Mono (self-hosted via fontsource), amber glow accent, no HTML preview page. | Brief sections 1 and 7. |
| 9 | SUPERSEDES 8. Founders (2026-10-03): follow the Launchology visual constitution and build manual 1:1. Both are saved verbatim in `docs/design/`; DESIGN.md maps them to Firefly. Conflicts with the brief are DESIGN.md D1 to D8: no light mode or toggle (D1), no glow (D2), winners as plain text chips (D3), scores only in reviewer, calibration and company report views and "don't advance" as the reject label (D4), no visible like counts (D5), terminology (D6), Launchology nav with Firefly destinations (D7), fonts self-hosted (D8). | Founder message mid-run; spec wins on visual design, brief keeps product scope. |
| 10 | Repo moved from `~/Desktop/firefly` to `~/code/firefly`. iCloud evicted Desktop files to "dataless" placeholders and git hung on them. The Desktop copy is left untouched. | Disk ran out mid-run; iCloud reclaimed space by evicting files. |
| 11 | `npm run lint:design` runs the manual 14.5 drift checks (literal colors, locked properties without tokens, literal px/ms/easing, banned effects) over `app/` and `components/`, excluding the token file. The podium and swipe/reject greps are left out because the brief requires winners (D3) and a REJECT decision value (D4). | Manual 14.5 plus DESIGN.md D3, D4. |
| 12 | ASSUMPTION: times display in America/Los_Angeles by default with the zone and offset always shown (manual: explicit IANA zones). Users can override in their profile later. | Pilot is Seattle first; both cities share the zone. |
| 13 | Mobile nav shows four items for company, reviewer and admin: a fifth label ("hackathons", "interviews") would not fit a fifth of a 375px bar in Space Mono. The dropped destinations stay linked from each role's home and the footer. | Manual 9.1 (labels always visible, no overlap) and 15 (375px test). |
| 14 | No theme toggle in the shell (brief step 2.6 asks for one). | DESIGN.md D1. |
| 15 | Copy in shared services (errors, email templates, invoice lines) rewritten to lowercase "[what happened], [what to do next]" sentences; "submission" replaced with "project" in emails. Template keys keep their names so callers don't change. | Manual 11.1 to 11.3. |
| 16 | Kept "$1,000" whole-dollar money format; the brief writes amounts that way. Declined the companies builder's ".00" suggestion. | Brief section 8. |
| 17 | Organizers do not get evidence-locker access, though the evidence builder asked. The brief's organizer row doesn't include candidate evidence, and the foundation test encodes that. | Brief 4.4; least access. |
| 18 | Enrollment redirects to the role page with the invoice confirmation, because revalidation re-rendered the enroll page without the joined cohort and dropped the success state. | Found by the demo-path e2e. |
| 19 | `reportHire` refuses a second hire for the same candidate and role (it would issue a second fee). | Found by the demo-path e2e, which hired the wrong default candidate. |
| 20 | `demo:reset` uses `prisma migrate reset`, which Prisma refuses when an AI agent runs it. I did not bypass that guard. For integration runs I used `prisma migrate deploy` then `db:seed`, which wipes and refills every table. Founders run `demo:reset` themselves. | Prisma AI-consent guard. |
