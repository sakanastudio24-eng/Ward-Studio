# Purchase Flow Documentation

This file explains the current purchase flow architecture for both product types.

## Entry Points

- `/src/app/products/page.tsx` renders server metadata and mounts client UI.
- `/src/app/products/ProductsClient.tsx` wires product cards to purchase drawers.
- `/src/app/components/products/ProductPurchaseDrawer.tsx` chooses variant:
  - `detailflow-pro` -> staged drawer flow (`CheckoutDrawer`)
  - `simple` -> one-step options flow (InkBot)

## DetailFlow Flow (`detailflow-pro`)

Main controller:
- `/src/app/components/products/CheckoutDrawer.tsx`

Step sequence:
1. `package`
   - Select tier (`starter`, `growth`, `pro_launch`)
   - Set booking mode + booking link/embed
   - Select **General Functional Add-Ons**
2. `readiness`
   - Review summary
   - Complete readiness checklist
   - Select **Readiness Add-Ons**
3. `payment`
   - View `Total`, `Deposit Today`, `Remaining`
   - Trigger simulated checkout transition
   - Open policy dialogs (`Terms`, `Refund`)

Post-purchase:
- Right drawer opens via `/src/app/components/products/SuccessDrawer.tsx`
- Shows payment status, booking CTA, order summary, onboarding inputs, and copyable config text.

State machine:
- `/src/app/components/products/flow.ts`
- Primary states:
  - `idle`
  - `selecting`
  - `checkout_started`
  - `redirecting_to_stripe`
  - `return_success_loading`
  - `payment_confirmed`
  - `payment_failed`
  - `verification_error`

## InkBot Flow (`simple`)

Controller:
- `/src/app/components/products/ProductPurchaseDrawer.tsx` (`ProductPurchaseDrawerSimple`)

Behavior:
1. Open bottom drawer
2. Select options + management mode
3. Click `Purchase`
4. Show post-purchase right drawer summary

No staged readiness logic is used in this variant.

## Pricing and Rules

Pricing:
- `/src/lib/pricing.ts`
- Defines tier prices, add-on prices, and helper math:
  - `computeAddonSubtotal`
  - `computeTotal`
  - `computeDepositToday`
  - `computeRemainingBalance`

Validation/rules:
- `/src/lib/rules.ts`
- Handles:
  - package-step booking field requirements
  - readiness gate checks
  - add-on availability by tier
  - add-on conflict validation
  - missing required item reporting

## Config Generation + Submission

Safe config generation:
- `/src/lib/config-generator/detailflow.ts`
- Produces:
  - config object/json
  - handoff checklist
  - copy-ready summary sentence

Submission endpoint currently used by success drawer:
- `POST /src/app/api/orders/route.ts`

## Analytics + Confetti

Analytics client:
- `/src/lib/analytics/client.ts`
- Sends non-blocking events to:
  - `POST /src/app/api/analytics/events/route.ts`

Confetti trigger:
- `/src/app/components/products/ConfettiTrigger.tsx`
- Uses session-scoped guard so celebration does not spam on repeat renders.

## Related Legal Pages

- Terms: `/src/app/terms/page.tsx`
- Success route: `/src/app/products/success/page.tsx`

