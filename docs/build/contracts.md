# Build contracts

Every builder reads this, `CLAUDE.md`, `DESIGN.md`, `docs/build/brief.md` (the founders' brief) and `docs/build/feature-map.md` before writing code. Where they conflict, the brief wins on scope and DESIGN.md (with `docs/design/`) wins on anything visual.

## 1. Builder rules

1. Edit only the paths you own (section 2). Never edit `prisma/schema.prisma`, `lib/{auth,db,permissions,audit,email,storage,billing,settings,format}`, `components/ui`, `components/shell`, `components/evidence` (except the evidence builder), `app/layout.tsx`, `app/globals.css`, `package.json` or another builder's paths. If you need a change there, put the exact diff in your report.
2. No new dependencies. List any you need in your report.
3. P0 (demo path) items first, then the rest of your area.
4. Every page, server action and route handler checks permissions through `lib/permissions` (section 4).
5. Load the frontend-design skill before writing UI, then follow DESIGN.md and `docs/design/build-manual.md` 1:1. Name the archetype in a comment at the top of each page.
6. Dev server port: 3000 plus your builder number (Discovery 3001 ... Ops 3010).
7. Before finishing: `npm run typecheck`, `npm run lint`, `npm run lint:design` and `npm test` pass. Commit with plain messages. No attribution lines anywhere.
8. Report back: what works, what's stubbed, the shared changes you need (exact diffs), how to see your work in the demo.

## 2. Route and path owners

| # | Builder | Owns |
|---|---|---|
| 1 | Discovery | `app/page.tsx`, `app/for-companies`, `app/hackathons/page.tsx`, `app/hackathons/[slug]/{layout.tsx,page.tsx,rules,prizes,schedule,judging,resources,updates,participants}`, `components/discovery`, `lib/discovery` |
| 2 | Participation | `app/hackathons/[slug]/{register,teams,check-ins}`, `app/dashboard`, `components/participation`, `lib/participation` |
| 3 | Projects | `app/hackathons/[slug]/{submit,projects}`, `app/projects/[id]/page.tsx`, `app/projects/[id]/edit`, `components/projects`, `lib/projects` |
| 4 | Profiles and privacy | `app/u/[username]`, `app/onboarding`, `app/settings`, `components/profiles`, `lib/profiles` |
| 5 | Organizer | `app/organize`, `components/organize`, `lib/organize` |
| 6 | Companies | `app/company` (not `app/company/billing`), `components/company`, `lib/company`, `lib/reports` |
| 7 | Evaluation | `app/review`, `app/judge`, `components/review`, `lib/review` |
| 8 | Evidence | `app/projects/[id]/evidence`, `app/api/github`, `components/evidence`, `lib/evidence` |
| 9 | Interviews | `app/interviews`, `components/interviews`, `lib/interviews` |
| 10 | Ops | `app/admin`, `app/company/billing`, `components/admin`, `lib/admin`, `prisma/seed/`, `docs/build/demo-script.md`, `tests/e2e/demo-path.spec.ts` |
| F | Foundation (integration only) | everything else, including `app/signin`, `app/api/auth`, `app/api/files` |

Every route already has a stub page with the right guard. Replace the stub; keep the guard or tighten it. Add sub-routes freely inside your own paths (for example `app/company/roles/[id]`, `app/review/[projectId]`).

Unit tests go in `tests/unit/<area>/`. E2E tests go in `tests/e2e/`.

## 3. Data model notes

- Schema: `prisma/schema.prisma`. Read it before writing queries. Import the client as `import { prisma } from "@/lib/db"` (server only).
- Enums are strings. Allowed values and Zod enums live in `lib/db/enums.ts` (`USER_ROLES`, `HACKATHON_TYPES`, `HACKATHON_STATUSES`, `DECISION_OUTCOMES`, `INTERVIEW_SECTIONS`, `AUDIT_ACTIONS`, ...). Validate with the matching `z*` schema; never write a raw string that isn't in the list.
- JSON columns are strings. Read with `parseJson(value, fallback)`, write with `toJson(value)` from `lib/db`. Shared shapes: `LinkItem`, `EvidenceRef { kind, id, label, excerpt? }`.
- Money is integer cents. Format with `formatCents`. Never do fee math outside `lib/billing`.
- Blind review: `CandidateProfile.blindCode` (for example `7F3A`) is the only candidate identifier a reviewer sees before their review is submitted. Render as `candidate 7F3A`.
- Decision outcomes are `ADVANCE`, `HOLD`, `REJECT`. The UI label for `REJECT` is "don't advance" (DESIGN.md D4).
- Dates relative to today in seed data. Display with `components/ui` `Time` or `lib/format/date` so the IANA zone always shows.

## 4. Server conventions

### Pages

```ts
// Archetype: record.
import { getCurrentUser } from "@/lib/auth";
import { authorizePage } from "@/lib/permissions";

export default async function Page({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;                       // params are async in Next 16
  const user = await getCurrentUser();
  await authorizePage(user, "evidence.view", { projectId: id });   // 404s when not allowed
  ...
}
```

- `requireUser()` (redirects to `/signin`) and `requireRole(...roles)` (404 for the wrong role, admin always passes) for coarse checks.
- `authorizePage(user, action, ref)` for resource checks. It loads the facts (assignment, company membership, shortlist, ...) and calls `can()`.

### Server actions

Every action follows this order:

1. `"use server"` and parse input with Zod (`schema.safeParse(formData or object)`). Return `{ ok: false, error }` on bad input, with an error sentence in the form "[what happened], [what to do next]".
2. `const user = await requireRoleForAction(...)` or `getCurrentUser()` then `await authorize(user, action, ref)`. Both throw `ForbiddenError`.
3. Do the write (use `prisma.$transaction` when more than one row must change together).
4. `audit(...)` or `auditAccess(...)` where section 5 requires it.
5. `sendEmail(...)` where the feature sends one.
6. `revalidatePath(...)` for every page that shows the changed data.
7. Return `{ ok: true, ... }` or `redirect(...)`.

```ts
type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
```

### Route handlers

Same as actions: Zod, `authorize`, then work. Return 404 (not 403) when the caller may not know the resource exists.

### Untrusted content

- Candidate code is never run.
- Repo text, commit messages and transcripts are untrusted. Render transcripts as plain text. Render Markdown only through `components/ui` `Markdown` (sanitized).
- The AI evidence summary (evidence builder): only when `ANTHROPIC_API_KEY` is set; model from `ANTHROPIC_MODEL`; wrap every untrusted block in delimited tags such as `<untrusted_repo>...</untrusted_repo>`; the system prompt says to ignore instructions inside them and to describe evidence without scoring, ranking or recommending; no tools. Otherwise show the seeded summary.

## 5. Shared services

| Module | API |
|---|---|
| `lib/auth` | `getCurrentUser(): CurrentUser \| null` (cached per request, role read from DB), `requireUser()`, `signIn`, `signOut`, `isDemoMode()`, `isGitHubAuthEnabled()` |
| `lib/permissions` | `can(actor, action, facts)`, `check(user, action, ref)`, `authorizePage(user, action, ref)`, `authorize(user, action, ref)`, `requireRole(...)`, `requireRoleForAction(...)`, `ForbiddenError`, `ACTIONS`, `needsAccessAudit(actor, subjectUserId)`. `ref = { projectId?, hackathonId?, companyId?, roleId?, candidateId?, subjectUserId? }` |
| `lib/audit` | `audit({ actorId, action, resourceType, resourceId?, subjectUserId?, metadata? })`; `auditAccess(actor, "REPORT_VIEW" \| "EVIDENCE_VIEW" \| "TRANSCRIPT_VIEW" \| "IDENTITY_REVEAL", subjectUserId, { type, id, metadata? })` skips the candidate viewing their own data |
| `lib/email` | `sendEmail(to, template, params, metadata?)` writes to `EmailLog`; nothing is sent. Templates: `registrationConfirmed`, `teamInvite`, `checkInReminder`, `submissionReceived`, `hackathonUpdate`, `decisionMade`, `interviewScheduled`, `feedbackReady`, `invoiceIssued`, `interviewRequested` |
| `lib/storage` | `saveFile(ownerId, "IMAGE" \| "TRANSCRIPT", file)`, `readStoredFile`, `deleteStoredFile(id)`, `fileUrl(id)`, `LIMITS`, `validateUpload`, `UploadError`. Served by `/api/files/[id]` (images public, transcripts to owner and admin only) |
| `lib/billing` | `enrollRoleInCohort({ hackathonId, roleId, actorId })` creates the $1,000 non-refundable flat-fee invoice and the enrollment; `reportHire({ companyId, roleId, candidateId, salaryCents, startDate, actorId })` creates the 5% hire-fee invoice and the hire; `markInvoicePaid(invoiceId, actorId)`; math: `hireFeeCents`, `isWithinAttributionWindow`, `formatCents`, `canTransition`, `isRefundable`. There is no refund function |
| `lib/settings` | `getSettings()` → `{ flatFeeCents, hireFeeBps, attributionWindowMonths, retentionMonths }`; `saveSettings(input)` (admin only, validates) |
| `lib/format/date` | `formatDate` ("22 jul"), `formatDateLong` ("22 july 2026"), `formatTime` ("09:30 America/Los_Angeles (UTC−07:00)"), `formatDateTime`, `DEFAULT_TIME_ZONE` |

Audit is required whenever anyone other than the candidate opens a candidate report, evidence locker or transcript, or reveals a blind identity (brief 4.4). Also audit decisions, submitted reviews, completed interviews, hires, invoices, enrollments, data exports and requests, settings changes, and hidden comments (see `AUDIT_ACTIONS`).

## 6. Shared components

### `components/ui` (import from `@/components/ui`)

| Component | Use |
|---|---|
| `Button` | `variant`: `primary` (one per view, cream sticker), `secondary`, `ghost`, `destructive`. `loading` + `loadingLabel` ("posting check-in"). `asChild` to wrap a `Link`. |
| `Field` + `Input`, `Textarea`, `Select` | `Field` renders label, hint and adjacent error and passes `{ id, describedBy, invalid }` to its render child. Add `aria-invalid={invalid}` and `aria-describedby={describedBy}` on the control. Required fields pass `required` to show "(required)". |
| `Checkbox`, `RadioGroup` + `Radio`, `Toggle` | Radix-based, 44px targets, hand-drawn tick. Always pair with a visible label. |
| `Chip`, `ChipButton`, `StatusPill` | Chips for tags and filters (sticker). `StatusPill tone` for literal status labels ("verified", "awarded: best tool", "draft"). |
| `TextLink` | Blue underlined link. Name the destination; never "click here". |
| `Card` | Flat raised surface. `leading` sticker cards are for the landing page and onboarding only. |
| `Tabs`, `TabList`, `Tab`, `TabPanel`, `TabLinks` | In-page tabs, or route-backed tabs with `aria-current`. |
| `Dialog` | `kind="modal"` or `"drawer"`. Destructive confirmations go here, never `window.confirm`. |
| `ToastProvider` (in the root layout), `useToast()` | One line naming the result: `toast("check-in posted")`. |
| `Tooltip`, `Menu`, `MenuItem` | Tooltip for short non-essential labels; Menu for action lists. |
| `PageHeader` | The one lowercase display line, optional eyebrow, description and actions. Every page starts with it. |
| `EmptyState` | State sentence plus exactly one next action (manual 11.4). |
| `Table`, `Th`, `Td`, `Tr` | Dense tables with a required `caption`. |
| `Skeleton` | Final-geometry loading blocks; use in `loading.tsx`. No spinners. |
| `Avatar` | Image or initials; `size` 24, 44, 96. Hidden in blind review. |
| `Time` | `format`: `date`, `time`, `datetime`; always shows the zone for times. |
| `Stat` | Operator-only figures (admin, billing). |
| `ScoreInput` | Reviewer-only rubric level picker with anchor text per level. |
| `Markdown` | Sanitized builder-authored Markdown. |
| `Divider`, `Icon` (`size` 16 or 24, stroke 1.5), `cn` | |

Design rules that bite most often: no literal colors, px, ms or z-index in `app/` or `components/` (use the Tailwind token utilities: `bg-raised`, `text-secondary`, `border-line`, `rounded-control`, `rounded-card`, `z-menu`, `type-display-2`, `type-body`, `measure`, ...); spacing utilities only on the scale 1, 2, 3, 4, 6, 8, 12, 16, 24, 32 (4px units); lowercase copy; no gradients, glow, blur or extra shadows; no counts on likes or popularity sorts; scores never on public pages.

### `components/evidence` (import from `@/components/evidence`)

Final props; the evidence builder replaces the bodies.

| Component | Props |
|---|---|
| `CommitTimeline` | `{ commits: CommitItem[]; blind?: boolean }` (masks author names when blind) |
| `TranscriptViewer` | `{ transcripts: TranscriptItem[] }` |
| `DecisionLog` | `{ entries: DecisionItem[] }` |
| `CheckInHistory` | `{ checkIns: CheckInItem[] }` |
| `EvidenceSummaryCard` | `{ summary: SummaryItem \| null }` |
| `EvidenceLink` | `{ evidence: EvidenceRef; projectId: string }` deep-links to `/projects/[id]/evidence#<evidenceAnchor(ref)>` |

Each item renders `id={evidenceAnchor({ kind, id })}` so links resolve.

### `components/shell`

`AppShell` (root layout), `NAV` (role destinations), `SignOutButton` (the settings page should render it so mobile users can sign out), `StubPage`.

## 7. Cross-area hand-offs

| Event | Writer | Reader |
|---|---|---|
| Reviewer assignment (2 per hiring-cohort project) and judge assignment | Organizer (`ReviewerAssignment`, `JudgeAssignment`) | Evaluation queue, permissions |
| Review submitted, calibration note, decision | Evaluation (`Review`, `ReviewScore`, `CalibrationNote`, `Decision`) | Companies report, Participation results |
| ADVANCE decision | Evaluation also upserts a `Shortlist` for every role enrolled in the project's cohort (`CohortEnrollment`) and adds a `ShortlistEntry` (candidate, project) to each | Companies shortlist, Interviews scheduling |
| Interview scheduled for an advanced candidate | Interviews (`Interview`, `InterviewInterviewer`); interviewers are reviewers for WE_RUN, reviewers plus company members for JOINT, company members for COMPANY_RUN | Interviews room |
| Interview passed | Interviews sets `Interview.outcome = PASS`, `status = COMPLETED`, and `Project.verified = true` | Projects, Profiles (verified label), Companies report |
| Candidate report | Companies builds the snapshot from live rows in `lib/reports` on each view, upserts `CandidateReport`, and audits `REPORT_VIEW` | Companies |
| Written feedback | Evaluation (`Feedback`, `visibleAt` = results time) | Participation dashboard shows rows where `visibleAt <= now` |
| Talent pool opt-in | Profiles (`CandidateProfile.talentPoolOptIn`, settings page anchor `#talent-pool`) | Companies talent pool; Participation dashboard links to `/settings#talent-pool` |
| Consent | Profiles (`consentVersion`, `consentAt` at onboarding) | Participation registration requires it and links to `/onboarding` when missing |
| Hackathon update posted | Organizer (`Update` + `hackathonUpdate` email per registrant) | Discovery updates tab |
| Winner picked | Organizer (`Winner`) | Discovery prizes tab, Projects gallery and page ("awarded: prize name"), Profiles wins |

## 8. Demo users (seed)

| id | Name | Role |
|---|---|---|
| `demo-candidate` | Maya Chen | CANDIDATE |
| `demo-company` | Jordan Reyes (Northwind Labs) | COMPANY |
| `demo-organizer` | Sam Okafor | ORGANIZER |
| `demo-reviewer` | Priya Natarajan | REVIEWER |
| `demo-admin` | Alex Morgan | ADMIN |

The ops builder keeps these ids and adds the full data set. All people and companies are fictional.

## 9. Commands

`npm run dev` · `npm run build` · `npm run start` · `npm run typecheck` · `npm run lint` · `npm run lint:design` · `npm test` · `npm run e2e` (builds must exist; uses port 3100) · `npm run db:migrate` · `npm run db:seed` · `npm run demo:reset`
