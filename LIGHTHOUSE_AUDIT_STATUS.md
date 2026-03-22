# Lighthouse Audit Status

Captured: **March 15, 2026, 11:17 PM PDT**  
URL: **https://www.zward.studio/**

## Executive Summary
- Current performance is strong on both device classes.
- Desktop is effectively in an excellent state.
- Mobile is also strong, with remaining gains mostly tied to image delivery and small bundle trims.

## Scores

### Desktop
- Performance: **96**
- Accessibility: **96**
- Best Practices: **100**
- SEO: **100**

Metrics:
- First Contentful Paint (FCP): **0.2s**
- Largest Contentful Paint (LCP): **0.5s**
- Total Blocking Time (TBT): **0ms**
- Cumulative Layout Shift (CLS): **0**
- Speed Index: **0.5s**

### Mobile (Moto G Power, Slow 4G)
- Performance: **95**
- Accessibility: **96**
- Best Practices: **100**
- SEO: **100**

Metrics:
- First Contentful Paint (FCP): **1.7s**
- Largest Contentful Paint (LCP): **2.4s**
- Total Blocking Time (TBT): **0ms**
- Cumulative Layout Shift (CLS): **0**
- Speed Index: **4.2s**

## Remaining Opportunities (From Audit)
- Improve image delivery (estimated savings ~2.27MB to ~2.33MB).
- Reduce unused JavaScript (estimated savings ~30KB).
- Reduce legacy JavaScript/polyfill overhead (estimated savings ~12KB).
- Minor render-blocking request savings (~80ms desktop, ~140ms mobile).
- One long main-thread task reported on desktop (low impact given TBT is 0ms).

## Accessibility Note
- Contrast warnings still exist for some foreground/background combinations.
- Manual contrast review and targeted token updates are recommended for full compliance.

## Best-Practice / Security Note
Lighthouse lists hardening checks to consider (not failing current score):
- CSP against XSS
- HSTS
- COOP
- XFO or CSP clickjacking protection
- Trusted Types for DOM-based XSS mitigation

## Recommended Next Optimization Pass
1. Convert/serve remaining large visual assets to optimized variants and right-size dimensions per viewport.
2. Continue route-level code splitting for non-critical client features.
3. Run a focused contrast pass on low-contrast text tokens.
4. Add or verify response security headers in production edge/server config.

