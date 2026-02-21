"use client";

import { useMemo } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

type EmbeddedCheckoutClientProps = {
  orderId: string;
  orderUuid: string;
  tierId: string;
  addonIds: string[];
  customerEmail: string;
};

function createStripePromise() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  if (!publishableKey) return null;
  return loadStripe(publishableKey);
}

/**
 * Mounts Stripe embedded Checkout by requesting a client secret from the server.
 */
export function EmbeddedCheckoutClient({
  orderId,
  orderUuid,
  tierId,
  addonIds,
  customerEmail,
}: EmbeddedCheckoutClientProps) {
  const stripePromise = useMemo(() => createStripePromise(), []);

  const fetchClientSecret = async () => {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: "detailflow",
        tierId,
        addonIds,
        customerEmail,
        orderId,
        orderUuid,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { clientSecret?: string; error?: string }
      | null;

    if (!response.ok || !payload?.clientSecret) {
      throw new Error(payload?.error || "Could not initialize embedded checkout.");
    }

    return payload.clientSecret;
  };

  if (!orderId || !orderUuid) {
    return (
      <p className="text-sm text-destructive">
        Missing order reference. Start checkout from the products page first.
      </p>
    );
  }

  if (!stripePromise) {
    return (
      <p className="text-sm text-destructive">
        Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Add it to run embedded checkout.
      </p>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
