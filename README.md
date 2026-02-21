# Ward Studio Website

This repository powers the public Ward Studio website at `zward.studio`.

It is a production site with portfolio presentation, product sales flow, legal pages, and contact/intake operations.

## Site Overview

The site is structured around four public areas:

- Home (`/`): hero, engineering work, case studies, contact, and footer navigation.
- Products (`/products`): product sales experience with staged drawers.
- Projects (`/projects`): full work catalog.
- Legal (`/terms`, `/privacy`): terms and refund context.

Other public behavior:

- Custom not found page: `/not-found` handler via `src/app/not-found.tsx`
- Success route for purchase return state: `/products/success`
- SEO endpoints: `/sitemap.xml` and `/robots.txt`

## Legal Pages

The legal pages are active and client-facing:

- `/terms` includes payments, deposits, refunds, licensing, liability, and client responsibilities.
- `/privacy` includes data collection/use, third-party processors, retention, and security notes.

Current legal contact:

- `hello@zward.studio`

## Product State

- DetailFlow is the active product flow.
- InkBot is shown as in development with request-access CTA.

DetailFlow purchase experience:

1. Select plan and add-ons
2. Complete readiness gate
3. Review pricing and pay deposit
4. Complete post-purchase setup form on `/products/success`

Implementation reference: `flow.md`
Stripe payment reference: `stripe-flow.md`

## Technical Architecture

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind + custom theme CSS
- Analytics: Vercel Analytics
- Email: Resend (server-side only)
- Persistence: Supabase (service-role server client)

Key app areas:

- Pages/routes: `src/app`
- Shared UI: `src/app/components`
- Product flows: `src/app/components/products`
- Business rules and pricing: `src/lib`
- Config constants: `src/config`

## API Surface (Current)

Core routes used by the live product wrapper:

- `POST /api/orders/create`: create order record before checkout.
- `POST /api/checkout/create`: create checkout session state.
- `GET /api/checkout/verify`: verify paid status and return summary (Stripe-backed when `STRIPE_SECRET_KEY` is set).
- `POST /api/onboarding/submit`: store safe onboarding config and asset links.

Supporting routes:

- `POST /api/contact`
- `POST /api/email/order-confirmed`
- `POST /api/cal/webhook`
- `POST /api/orders` (legacy-compatible config submission path)
- `GET /api/health/endpoints` (API/webhook responsiveness + boolean false checks)
- `GET /api/health/endpoints?format=human` (plain-text readable report)

Readable dashboard:

- `/health`

## Endpoint Test Points

Use:

- `GET /api/health/endpoints`

This route probes critical APIs and reports:

- `state: "ok"` when endpoint responds within timeout and does not fail boolean checks.
- `state: "false"` when a boolean signal (`ok` or `paid`) returns `false`.
- `state: "error"` when endpoint responds with failure status.
- `state: "not_responding"` when the endpoint times out or does not respond.

Response includes `summary` counters plus per-endpoint `checks[]` for fast diagnosis.

## Cal.com Booking Routing

Current Cal links are centralized in:

- `src/config/cal.ts`

Current routing:

- DetailFlow purchase success primary CTA: Template setup/configuration call
- DetailFlow prep-call secondary CTA: Free strategy fit call
- InkBot product CTA: Automation bot planning session
- Contact section CTA: Custom project consultation

Webhook subscriber URL:

- `https://www.zward.studio/api/cal/webhook`

## Operations and SEO

Canonical site URL is sourced from `NEXT_PUBLIC_SITE_URL` with fallback `https://www.zward.studio`.

Sitemap and robots are generated via App Router metadata routes:

- `src/app/sitemap.ts`
- `src/app/robots.ts`

Notes:

- `NEXT_PUBLIC_SITE_URL` may be set as either a full URL or bare domain.
- Site config normalizes bare domains (for example, `zward.studio` -> `https://zward.studio`).
- `/products/success` is intentionally excluded from sitemap indexing strategy.

## Home Route Performance

The home route includes an optimization pass focused on Lighthouse desktop metrics:

- Above-the-fold hero content renders without initial opacity/delay gating.
- Game overlays are code-split and loaded only when opened.
- Case-study card previews use optimized AVIF/WebP assets in `public/case-studies/previews`.
- Full-size PNG assets remain available for gallery/detail views.

Preview generation script:

- `npm run perf:optimize-previews`
- Source files: `public/case-studies/detailflow-1.png`, `public/case-studies/inkbot-1.png`
- Outputs:
  - `public/case-studies/previews/detailflow-1-home.avif`
  - `public/case-studies/previews/detailflow-1-home.webp`
  - `public/case-studies/previews/inkbot-1-home.avif`
  - `public/case-studies/previews/inkbot-1-home.webp`

## Local Development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Production build: `npm run build`
4. Production run: `npm run start`

## Stripe Preparation (No Webhook Yet)

Current payment verification mode is server-read only.

- Add `STRIPE_SECRET_KEY` in environment variables.
- Use a restricted key with:
  - `Checkout Sessions: Read` (required)
  - `Customers: Read` (optional)
  - `Payment Intents: Read` (optional)

When configured, the server can:

- Retrieve checkout sessions by `session_id`
- Confirm payment state
- Sync order payment/session state to Supabase
- Send client/internal confirmation emails server-side

## Post-Purchase UX + Email Notes

- Primary post-purchase experience is now the inline form page at `/products/success` (not a drawer shell).
- The form includes the same handoff fields previously used in post-purchase drawer mode.
- `POST /api/onboarding/submit` remains the setup submission endpoint.
- Resend delivery is server-side only via `src/lib/email.ts`.
- Sender behavior:
  - preferred sender from `EMAIL_FROM` or `ORDERS_FROM_EMAIL`
  - fallback sender `Ward Studio <onboarding@resend.dev>` when sender/domain is rejected
- Bundle behavior:
  - client + internal emails are attempted independently
  - one failure no longer blocks the other

## Notes

- Keep secrets server-only.
- Do not send API keys/passwords through customer-facing forms or emails.
