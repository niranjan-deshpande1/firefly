# firefly

Firefly is a hackathon platform built for hiring. It runs open hackathons the way Devpost does (listings, registration, teams, project posting, galleries, judging, winners), and adds what a startup needs to hire from one: company role intake, two-week hiring cohorts, evidence of how each builder worked with AI, blind evidence-linked review, defense interviews, shortlists and candidate reports, and hire tracking with fees.

People make every advance, hold, don't-advance and hire decision. Nothing in the product scores, ranks, rejects or matches candidates on its own.

- Product scope: [`docs/build/brief.md`](docs/build/brief.md)
- What works and what doesn't: [`docs/build/status.md`](docs/build/status.md)
- Design system: [`DESIGN.md`](DESIGN.md), with the binding specs in [`docs/design/`](docs/design/)
- Stack: [`docs/decisions/0001-stack.md`](docs/decisions/0001-stack.md)

## Setup

Requires Node 20 or later and npm.

```bash
npm install            # also runs prisma generate
cp .env.example .env   # the defaults run the full demo with no accounts or keys
npm run demo:reset     # drop, migrate and seed the local SQLite database
npm run dev            # http://localhost:3000
```

`demo:reset` uses `prisma migrate reset`, which Prisma refuses to run from an AI agent without explicit consent. Run it yourself in a terminal. `npm run db:migrate` followed by `npm run db:seed` gives the same result, because the seed clears every table before filling it.

## Environment variables

Every variable has a working local fallback. They are mirrored in `.env.example`.

| Variable | Default | Without it |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Required. SQLite file under `prisma/`. The schema stays Postgres-compatible. |
| `DEMO_MODE` | `true` | `false` hides demo sign-in; GitHub sign-in must then be configured. Demo sign-in lets anyone act as any seeded person, admin included, so never leave it on in a public deploy. It switches off by itself when GitHub sign-in is configured. |
| `AUTH_SECRET` | empty | In demo mode a fixed demo secret is used. Set one (`npx auth secret`) for anything other than a local demo. |
| `GITHUB_ID`, `GITHUB_SECRET` | empty | GitHub sign-in is hidden; demo sign-in only. |
| `GITHUB_TOKEN` | empty | Repo reads use GitHub's unauthenticated rate limit; seeded commits show when GitHub can't be reached. |
| `ANTHROPIC_API_KEY` | empty | The seeded evidence summary shows and "prepare a new summary" is hidden. |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model for the evidence summary. |

Nothing sends real email (everything goes to the email log in admin), charges money (invoices are records with a "mark paid" action), or hosts video (interviews store a link).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build`, `npm run start` | Production build and server |
| `npm run typecheck` | Route type generation, then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run lint:design` | Design drift checks from the build manual (no literal colors, px, ms or z-index outside the token file; no gradients or blur) |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright: smoke, permission checks and the eight-step demo path. Run `npm run build` and reseed first; it serves on port 3100 |
| `npm run db:migrate`, `npm run db:seed`, `npm run demo:reset` | Database |

## The demo path

Sign in at `/signin` with "continue as" any seeded person. All people and companies are fictional. The click-by-click script is in [`docs/build/demo-script.md`](docs/build/demo-script.md).

1. **Visitor:** landing page, hackathon listing, the "Fall Builders Cohort" hiring cohort, then "Open Build Weekend" and its winners.
2. **Company (Jordan Reyes, Northwind Labs):** dashboard, the "Founding Engineer" role intake, enroll in "Winter Builders Cohort". A $1,000 non-refundable invoice is created.
3. **Builder (Maya Chen):** dashboard with cohort progress and check-ins, her project, then the evidence locker (commit timeline, AI transcript, decision log, summary).
4. **Reviewer (Priya Natarajan):** review queue, blind scoring with evidence links, post, reconcile the flagged calibration gap, advance with a written reason.
5. **Interviewer (Priya):** defense interview with the identity check, script and scorecard. The project becomes verified.
6. **Company again:** shortlist, then Maya's candidate report (the view is written to the audit log). Report a hire at $140,000; a $7,000 invoice is created.
7. **Admin (Alex Morgan):** funnel, the audit log showing the report view, the email log, invoices.
8. **Finisher who wasn't hired (Theo Grant):** written feedback and the talent pool opt-in.

Steps 4 to 6 change data. Reseed before running the demo again.

## Repo layout

```
app/                 routes
components/ui        shared design system
components/<area>    area components
lib/<area>           area queries and server actions
lib/{auth,db,permissions,audit,email,storage,billing,settings,format}   shared services
prisma/              schema, migrations, seed
tests/unit, tests/e2e
docs/build           brief, contracts, feature map, decisions log, status, demo script
```

Permissions are enforced on the server in every page, server action and route handler through `lib/permissions`. Candidate code is never run. Repo text and AI transcripts are treated as untrusted input.
