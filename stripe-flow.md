# Stripe Flow (Ward Studio)

This file documents the Stripe payment flow currently implemented in this repo.

## Modes

Two checkout UIs are supported:

1. Hosted Checkout (default)
- `POST /api/checkout/create` creates a Stripe Checkout Session and returns a Stripe-hosted `url`.
- Client redirects to Stripe.
- Stripe returns to `/products/success?session_id=...&celebrate=1`.

2. Embedded Checkout (optional)
- Enable with: `NEXT_PUBLIC_STRIPE_CHECKOUT_UI_MODE=embedded`
- Client routes to `/products/embedded`.
- `/products/embedded` mounts Embedded Checkout using:
  - `POST /api/stripe/create-checkout-session` -> returns `clientSecret`
- Stripe returns to `/products/embedded-return?session_id=...`.
- `/products/embedded-return` calls `GET /api/stripe/session-status?session_id=...`.
- If complete/paid, it forwards to `/products/success?session_id=...&celebrate=1`.

## Server Verification

Final payment verification happens in:
- `GET /api/checkout/verify?session_id=...`

Lookup order:
1. Stripe API lookup (live source of truth)
2. Local fallback session store (placeholder/dev flow)
3. Supabase lookup by `stripe_session_id` (durable fallback)

On verified paid state:
- order status is synced in Supabase
- order-confirmed emails are sent server-side (deduped)

## Key Endpoints

- `POST /api/orders/create`
  - creates order row before payment
- `POST /api/checkout/create`
  - hosted checkout session create
- `GET /api/checkout/verify`
  - payment verification + summary
- `POST /api/stripe/create-checkout-session`
  - embedded checkout session create (`clientSecret`)
- `GET /api/stripe/session-status`
  - embedded return status check

## Checkout Origin / Subdomain

Checkout redirect origin is resolved from:
1. `CHECKOUT_SITE_URL`
2. `NEXT_PUBLIC_CHECKOUT_URL`
3. request origin in development
4. `NEXT_PUBLIC_SITE_URL` fallback

For a dedicated subdomain:
- `CHECKOUT_SITE_URL=https://checkout.zward.studio`

Optional full URL overrides:
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

## Required Environment Variables

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ORDERS_OWNER_EMAIL`
- `ORDERS_FROM_EMAIL`

Optional:
- `STRIPE_CHECKOUT_LIVE_MODE=true|false`
- `STRIPE_CHECKOUT_ALLOW_PLACEHOLDER=true|false`
- `NEXT_PUBLIC_STRIPE_CHECKOUT_UI_MODE=embedded`
- `CHECKOUT_SITE_URL`
- `NEXT_PUBLIC_CHECKOUT_URL`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`

## Current Notes

- Webhook flow is not the primary trigger yet for payment confirmation.
- Verify route currently owns confirmation behavior in v1.
- Do not expose secret keys on client pages.
