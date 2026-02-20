# Terms & Conditions

Effective date: February 15, 2026

This markdown file mirrors the website terms at `/terms`.

## 1. Scope of Services
Ward Studio provides design, engineering, and implementation services based on agreed project scope, timeline, and pricing.

## 2. Project Agreements
Signed proposals or statements of work control if there is any conflict with this document.

## 3. Payments
Fees and milestones are defined per project. Late payment can pause delivery.

## 4. Revisions and Change Requests
Revisions included in scope are handled per agreement. Out-of-scope requests may change budget and schedule.

## 5. Client Responsibilities
Clients provide timely feedback, required content, and system access needed for delivery.

## 6. Intellectual Property
Upon full payment, clients own final deliverables defined in the agreement. Ward Studio retains pre-existing methods and reusable components.

## 7. Third-Party Services
Third-party tools and platforms are governed by their own terms and policies.

## 8. Warranties and Liability
Services are provided with professional care. To the extent permitted by law, Ward Studio is not liable for indirect or consequential damages.

## 9. Termination
Either party may terminate according to the signed project agreement. Work completed up to termination remains billable.

## 10. Updates
Terms may be updated periodically. Continued use indicates acceptance of updated terms.

---

# Resend Template API Outline (Contact Inquiries)

## Goal
Use Resend Templates for all portfolio contact-form emails and keep the visual style aligned with the Ward Studio brand.

## Required environment variables
- `RESEND_API_KEY`
- `CONTACT_OWNER_EMAIL`
- `CONTACT_FROM_EMAIL`
- `RESEND_CONTACT_TEMPLATE_ID`

## Template operations in this repo
Use:
`npm run resend:templates -- <command>`

Commands:
- `create`
- `get --id=<template-id>`
- `update --id=<template-id>`
- `publish --id=<template-id>`
- `duplicate --id=<template-id>`
- `delete --id=<template-id>`
- `list --limit=10 --after=<template-id>`

## Variables used by the contact form
- `CONTACT_NAME`
- `CONTACT_COMPANY`
- `CONTACT_EMAIL`
- `CONTACT_BUDGET`
- `CONTACT_TIMELINE`
- `CONTACT_PROJECT_TYPE`
- `CONTACT_GOALS_HTML`
- `SUBMITTED_AT`

---

# Cal.com API Outline (Example)

## Goal
Use Cal.com scheduling in your project flow so users can book meetings after form submission.

## Integration Outline
1. Create a Cal.com event type and API key.
2. Store secrets on the server (`CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_USERNAME`).
3. Create a server route that validates contact form data.
4. Call Cal.com API to create booking metadata or generate scheduling links.
5. Return a booking URL to the client and show a "Book a Call" CTA.

## Minimal Example (Next.js Route Handler)
```ts
// src/app/api/calcom-booking/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email } = await req.json();

  const response = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
    },
    body: JSON.stringify({
      eventTypeId: Number(process.env.CALCOM_EVENT_TYPE_ID),
      attendee: {
        name,
        email,
        timeZone: "America/New_York",
      },
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ booking: data });
}
```

## Recommended Production Notes
- Validate all incoming fields server-side.
- Add anti-spam protection (honeypot, rate limits, CAPTCHA).
- Log booking and email outcomes for support visibility.
- Use a fallback path when Cal.com is temporarily unavailable.

---

# Product Drawer Review Notes (2026-02-18)

## Components
- `src/app/components/products/ProductPurchaseDrawer.tsx`
- `src/app/components/products/CheckoutDrawer.tsx`
- `src/app/components/products/PlanAndAddons.tsx`
- `src/app/components/products/PriceSummary.tsx`

## Summary
- DetailFlow uses a staged drawer flow with post-purchase onboarding in a right-side drawer.
- Success page now verifies payment and supports celebration gating via query param and session storage.

## Implementation reminders
- Set `NEXT_PUBLIC_STRATEGY_CALL_URL` to your real booking provider URL.
- Set `NEXT_PUBLIC_SECURE_UPLOAD_URL` to your real upload intake link.
- Keep `STRIPE_LINK_*` values configured for production checkout routing.
