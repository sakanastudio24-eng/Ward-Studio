# Ward Studio Process and Code Notes

Date: 2026-02-15

Update: 2026-02-19

## In-File Function Notes + Flow Doc Pass

- Added concise JSDoc notes above core purchase-flow, pricing, validation, analytics, and supabase helper functions.
- Added `flow.md` at repository root documenting:
  - DetailFlow 3-step drawer flow
  - InkBot simple drawer flow
  - reducer states
  - pricing/rules/config/analytics integration points
- Updated `README.md` and `DOCUMENTATION.md` to point to `flow.md`.

## Work Completed Before Next.js Migration

### Repository setup
- Extracted `Ward Studio Positioning Update.zip` into this workspace.
- Initialized local git, connected remote:
  - `https://github.com/sakanastudio24-eng/Ward-Studio.git`
- Resolved remote history mismatch by merging remote `LICENSE` commit.

### Plain implementation pass
- Added repository hygiene:
  - `.gitignore`
  - `README.md` run instructions
  - package metadata cleanup
- Added function-purpose notes across app-level files.
- Applied responsive stability updates across sections:
  - Hero, Capabilities, Work, How I Work, Contact, Footer, DinoGame, FlappyBird
- Added global media-query guardrails in `src/styles/theme.css`.
- Hardened technical SEO:
  - `index.html`
  - `src/app/components/SEOHead.tsx`
  - `public/robots.txt`
  - `public/sitemap.xml`

### Section commit sequence that existed before reset
1. `chore(repo): baseline repo hygiene`
2. `docs(app-shell): add function notes and stabilize global behavior`
3. `feat(hero): function notes and responsive stability`
4. `feat(capabilities): function notes and responsive stability`
5. `feat(work): function notes and responsive stability`
6. `feat(how-i-work): function notes and responsive stability`
7. `feat(contact): function notes and responsive stability`
8. `feat(footer-games): function notes and responsive stability`
9. `feat(responsive): global media-query reinforcement`
10. `feat(seo): technical SEO baseline consistency`

## Current Migration Objective

Convert the project from Vite to Next.js and preserve existing section-based app behavior.

## Next.js Migration Changes

### Added
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `next.config.mjs`
- `tsconfig.json`
- `next-env.d.ts`

### Updated
- `package.json` scripts/dependencies from Vite to Next.js runtime.
- `postcss.config.mjs` to use `@tailwindcss/postcss`.
- `src/app/App.tsx` marked as client component (`"use client"`).
- `README.md` updated to Next.js workflow.
- `.gitignore` updated with Next build directories.

### Removed
- `index.html`
- `vite.config.ts`
- `src/main.tsx`

## App Section Structure Preserved
- Hero
- Capabilities
- Work
- How I Work
- Contact
- Footer
- Game overlays (DinoGame and FlappyBird)

## Product Purchase Updates (2026-02-18)

### Component refactor
- Extracted reusable purchase flow blocks:
  - `CheckoutDrawer`
  - `PlanAndAddons`
  - `PriceSummary`
- Moved shared pricing/rules to:
  - `src/lib/pricing.ts`
  - `src/lib/rules.ts`
- Preserved InkBot simple drawer path while isolating DetailFlow staged logic.

### Success verification flow
- Added payment verification API:
  - `src/app/api/stripe/session/route.ts`
- Added client success state machine:
  - checking -> paid -> failed in `src/app/products/success/SuccessClient.tsx`
- Added confetti launch helper in `src/lib/confetti.ts`
  - gated by `celebrate=1`
  - once per session via `sessionStorage`

### Current known review risks
- Booking confirmation in right drawer is currently inferred from window focus return, not a booking provider callback.
- Default strategy call URL fallback points to success route when `NEXT_PUBLIC_STRATEGY_CALL_URL` is unset.
