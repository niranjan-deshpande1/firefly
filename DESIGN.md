# DESIGN.md: Firefly

**Binding visual authority (founders, 2026-10-03): follow these 1:1.**

1. [docs/design/build-manual.md](docs/design/build-manual.md): tokens, component state tables, archetypes, navigation, motion, copy, accessibility, drift checks. It wins on any visual detail.
2. [docs/design/visual-constitution.md](docs/design/visual-constitution.md): the principles, anti-identity list, cartoon system, decision framework.

Both were written for Launchology and are kept verbatim. This file only says how they map onto Firefly and records the conflicts with the build brief (`docs/build/decisions-log.md` has the same list). Where this file is silent, the two documents above decide. Read the build manual's sections 1 to 4, 7, 8, 11 and 13 before building any UI.

## Non-negotiables in one screen

- **Black ground, always.** No light mode, no theme toggle, no `prefers-color-scheme`. Surfaces step ground `#000000`, raised `#0E0E0E`, raised-2 `#1A1A1A`. Depth is surface step only.
- **No gradients, no glow, no blur-behind, no glass, no text-shadow, no drop-shadow.** `box-shadow` has two legal forms: the hard sticker offset (zero blur, blue-deep) and the overlay shadow `0 8px 32px rgba(0,0,0,0.6)` on menus, drawers, modals and toasts only.
- **Primary button:** cream `#FFFDF0` fill, `#0E0E0E` text and 2px outline, 4px hard offset in blue-deep `#1B4FD8`, radius 6, press translates into the offset (manual 5.2). One per view.
- **Blue `#4DA3FF`** is links, focus ring (2px at 2px offset, never removed), active and selected only. Blue-deep is never text, border or fill on a control.
- **Type:** Satoshi names things (headings, names, titles, lowercase). Space Mono says things (sentences, UI, labels, numbers), 400 and 700 only. Array only on the marketing landing hero, at most twice, never in the product. Scale = manual 3.2 exactly.
- **Lowercase product copy** except proper nouns and the eyebrow step. No em or en dashes, no exclamation marks. Builder-authored text is never case-transformed.
- **Space** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. **Radius** 0 (media), 6 (controls, chips), 12 (cards, panels, modals), pill (status, avatar, transport).
- **Touch targets 44px.** 375px is the design origin. Body copy capped at 55ch.
- **Icons:** lucide-react at `strokeWidth={1.5}`, 16px inline or 24px nav, always with a visible text label except transport and the collapsed rail.
- **Loading** is final-geometry skeletons, never spinners or shimmer. **Errors** sit next to their cause in one sentence, never a modal.
- **Every view** opens top-left with one lowercase display line, has one focal element, and ends with a next thing to do or a person to meet. No dead ends, no bare "nothing here".
- **Motion:** 100 / 160 / 220 / 280ms with the manual's easings, one axis, 8px max, nothing loops, counts never count up. Reduced motion stills, never removes meaning.
- **Times always carry an explicit IANA zone:** `09:30 America/Los_Angeles (UTC−07:00)`. Dates in-product as `22 jul`.

Tokens live in `app/globals.css` as CSS custom properties in primitive, semantic, component order (manual 14). Components reference component or semantic tokens only; no literal colors, px sizes or durations in `components/` or `app/` outside `app/globals.css`. Run `npm run lint:design` (the manual's drift checks adapted to Firefly) before committing UI.

## Archetypes for Firefly routes (manual 8)

| Archetype | Firefly routes |
|---|---|
| collection | `/hackathons`, project gallery, talent pool, review queue, admin lists |
| record | hackathon overview tabs, `/projects/[id]`, `/u/[username]`, candidate report, evidence locker |
| workspace | scoring workspace, calibration, interview room, team page, company dashboard, organizer console |
| stream | updates, check-in history, audit log, email log |
| passage | sign-in, onboarding and consent, registration, submission form, enrollment, report-a-hire |

## Cartoon system in Firefly

No cast artwork or device artwork exists, so none ships (manual OPEN-ILLUSTRATION-1: "no artwork may be shipped that does not exist"). The sticker construction (outline plus hard offset) is used where the manual allows it: primary buttons, chips, toasts, and leading cards on the landing page and onboarding only. Review, evidence, interviews, reports, billing, admin and every dense list are cartoon-free surfaces (manual 5.3). The reel does not ship (OPEN-REEL-1); the landing hero is static display type.

## Conflicts with the build brief and how they are resolved

The founders said this spec governs **visual design**. Product scope from the build brief stays; where a feature collides with the spec's anti-identity rules, it is kept and rendered in the quietest form the spec allows.

| # | Collision | Resolution |
|---|---|---|
| D1 | Brief asks for dark and light themes and a theme toggle | Spec wins: black only, no toggle. |
| D2 | Brief asks for a "warm glow accent" | Spec bans glow. The accent is flat blue; emphasis is the cream primary button. |
| D3 | Devpost parity needs prizes, winners and judging | Kept. Shown as plain text ("awarded: best tool") in a chip, no trophy, medal, podium, "featured" row or winners-first sort. The spec's podium grep is not a CI gate for Firefly because the data model has `Winner`; the other drift checks are. |
| D4 | Rubric scores and advance/hold/reject decisions | Kept (locked by the brief). Scores render only inside the reviewer workspace, calibration, and the company's own candidate report, never on public pages, never totalled, never sorted by. The reject action is labelled "don't advance" and its data value stays `REJECT`. |
| D5 | Likes on projects | Kept as an action ("like", "liked"). Like counts are not rendered and nothing sorts by likes. |
| D6 | Terminology lock (builder, project, sprint) | Candidate-facing copy says "builder" and "project"; company and reviewer copy says "candidate" where the hiring context needs it. "Hiring cohort" stays because the brief names it. Actions never say "submit": use "post project", "save draft", "post check-in". |
| D7 | Launchology navigation (home, directory, community, learn, you) | The pattern is kept exactly (5-item mobile bottom bar, 240px rail, no badges), with Firefly destinations chosen per role. |
| D8 | Satoshi and Array are Fontshare faces | Self-hosted under `public/fonts/` with their license files, as manual 3.1 requires. |
