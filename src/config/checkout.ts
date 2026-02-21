import { SITE_URL } from "./site";

/**
 * Normalizes an origin-like value to protocol + host only.
 * Example:
 * - "checkout.zward.studio" -> "https://checkout.zward.studio"
 * - "https://checkout.zward.studio/path" -> "https://checkout.zward.studio"
 */
function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  return `${parsed.protocol}//${parsed.host}`;
}

/**
 * Resolves the canonical origin used for checkout redirects.
 * Priority:
 * 1) CHECKOUT_SITE_URL
 * 2) NEXT_PUBLIC_CHECKOUT_URL
 * 3) request origin in development
 * 4) SITE_URL
 *
 * For subdomain checkout deployments set:
 * - CHECKOUT_SITE_URL=https://checkout.your-domain.com
 */
export function resolveCheckoutOrigin(requestOrigin: string): string {
  const explicit =
    process.env.CHECKOUT_SITE_URL?.trim() || process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || "";

  if (explicit) {
    return normalizeUrl(explicit);
  }

  if (process.env.NODE_ENV !== "production") {
    return normalizeUrl(requestOrigin);
  }

  return SITE_URL;
}

export function getStripeSuccessUrl(origin: string): string {
  // Supports full override for Stripe dashboard compatibility.
  const explicit = process.env.STRIPE_SUCCESS_URL?.trim();
  if (explicit) return explicit;
  return `${origin}/products/success?session_id={CHECKOUT_SESSION_ID}&celebrate=1`;
}

export function getStripeCancelUrl(origin: string): string {
  // Supports full override for Stripe dashboard compatibility.
  const explicit = process.env.STRIPE_CANCEL_URL?.trim();
  if (explicit) return explicit;
  return `${origin}/products#detailflow-template`;
}
