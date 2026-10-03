# 0001: Platform stack

**Status:** DECISION (build brief section 5, approved by both founders, 2026-10-03)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router, Server Components, Server Actions | 16.3.8 | `proxy.ts` replaces middleware; params and cookies are async. Docs ship in `node_modules/next/dist/docs/`. |
| Language | TypeScript, strict | 5 | `npm run typecheck` runs `next typegen` first so `PageProps` and `LayoutProps` exist. |
| Package manager | npm | | |
| Styling | Tailwind CSS with the Launchology tokens | 4 | Tokens live in `app/globals.css`; utilities resolve to tokens only. `npm run lint:design` enforces it. |
| Components | Radix UI primitives, lucide-react icons at stroke 1.5 | | No stock theme. Shared set in `components/ui`. |
| Fonts | Satoshi and Array self-hosted in `public/fonts`; Space Mono via `@fontsource/space-mono` | | No font CDN at runtime. |
| Database | Prisma with SQLite for local and demo | 6.19.3 | Enums are strings validated in `lib/db/enums.ts`; JSON is stored as strings. Both choices keep the schema Postgres-compatible. |
| Auth | Auth.js v5 (next-auth) | 5.0.0-beta.32 | GitHub when `GITHUB_ID` and `GITHUB_SECRET` are set; demo sign-in when `DEMO_MODE=true`. JWT sessions; the role is read from the database on every request. |
| Validation | Zod | 4 | Every server action and route handler input. |
| Markdown | react-markdown, remark-gfm, rehype-sanitize | 10 | `components/ui/markdown.tsx`. AI transcripts render as plain text. |
| Charts | Recharts | 3 | Styled with tokens. No dataviz skill is installed. |
| GitHub | @octokit/rest | 22 | Public repos; `GITHUB_TOKEN` optional; seeded data is the fallback. |
| AI summary | @anthropic-ai/sdk | 0.131 | Only when `ANTHROPIC_API_KEY` is set. Model from `ANTHROPIC_MODEL`. No tools; untrusted text wrapped in delimited tags. |
| Uploads | Local `./storage` through `lib/storage`, served by `app/api/files/[id]` | | Images 5 MB, transcripts 2 MB (.md or .txt). |
| Tests | Vitest and Testing Library (unit), Playwright (end to end) | 5, 1.63 | E2E runs against `next start` on port 3100, so build first. |

## Consequences

- Moving to Postgres later means changing the datasource and running a fresh migration; no code changes for enums or JSON.
- Tech debt T-01: tokens are authored in CSS, while manual 14.1 wants a JSON source that generates CSS. Add the JSON pipeline if a second platform (email templates, native) needs the tokens.
- Tech debt T-02: next-auth v5 is still a beta. Pin it and re-test sign-in on each upgrade.
