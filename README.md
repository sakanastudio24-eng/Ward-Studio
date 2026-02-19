# Ward Studio

This project was exported from Figma Make and implemented as a Next.js app.

Original design file:
https://www.figma.com/design/21pSCd2N9TKtVwZv4mwp2n/Ward-Studio-Positioning-Update

## Local development

1. Install dependencies:
   `npm install`
2. Start dev server:
   `npm run dev`
3. Build production bundle:
   `npm run build`
4. Run production server:
   `npm run start`

## Contact Form Email Setup

The contact form now posts to `/api/contact` and sends inquiry details to the owner email using a Resend template.

Set these environment variables in `.env.local`:

- `RESEND_API_KEY=...`
- `CONTACT_OWNER_EMAIL=owner@yourdomain.com`
- `CONTACT_FROM_EMAIL=hello@yourdomain.com` (optional, defaults to `onboarding@resend.dev`)
- `RESEND_CONTACT_TEMPLATE_ID=...` (template id from Resend)
- `RESEND_TEMPLATE_NAME=wardstudio-contact-inquiry` (optional, used by template script)

### Resend template workflow

This project includes a template manager:

`npm run resend:templates -- <command> [--id=...]`

Commands:

- `create`
- `get --id=<template-id>`
- `update --id=<template-id>`
- `publish --id=<template-id>`
- `duplicate --id=<template-id>`
- `delete --id=<template-id>`
- `list --limit=10 --after=<template-id>`

Example:

1. Create:
   `npm run resend:templates -- create`
2. Publish:
   `npm run resend:templates -- publish --id=<template-id>`
3. Set `RESEND_CONTACT_TEMPLATE_ID=<template-id>` in `.env.local`

## Product Purchase Drawer Flow

DetailFlow and InkBot purchase flows live under:
- `src/app/components/products/ProductPurchaseDrawer.tsx`
- `src/app/components/products/CheckoutDrawer.tsx` (DetailFlow staged flow)
- `src/app/components/products/PlanAndAddons.tsx`
- `src/app/components/products/PriceSummary.tsx`

DetailFlow flow behavior:
1. Bottom drawer flow: `package -> readiness -> payment`
2. Post-purchase right drawer for confirmation, booking CTA, and onboarding checklist
3. Strategy call return section appears after focus returns from booking tab

Pricing/rules are centralized in:
- `src/lib/pricing.ts`
- `src/lib/rules.ts`

## Success Page Verification + Confetti

Success route:
- `src/app/products/success/page.tsx`
- `src/app/products/success/SuccessClient.tsx`

Verification endpoint:
- `src/app/api/stripe/session/route.ts`

Behavior:
- Success page starts with `Confirming payment...`
- Calls `/api/stripe/session?session_id=...`
- On verified paid state and `celebrate=1`, launches confetti once per browser session using:
  - `sessionStorage` key: `ward_welcome_confetti_shown`

## Product Flow Environment Variables

Set these in `.env.local` as needed:

- `STRIPE_LINK_CONSULTATION=...`
- `STRIPE_LINK_BUILD_DEPOSIT=...`
- `STRIPE_LINK_HOLD_SPOT=...`
- `NEXT_PUBLIC_STRATEGY_CALL_URL=...`
- `NEXT_PUBLIC_SECURE_UPLOAD_URL=...`

## Git remote

`origin` is configured to:

`https://github.com/sakanastudio24-eng/Ward-Studio.git`
  
