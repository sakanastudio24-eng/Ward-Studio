import "server-only";
import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

/**
 * Returns a cached server Stripe client using STRIPE_SECRET_KEY.
 * This must only be used in server routes/actions.
 */
export function getStripeServer(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!cachedStripe) {
    cachedStripe = new Stripe(secretKey);
  }

  return cachedStripe;
}

