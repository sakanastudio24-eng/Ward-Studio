import { NextResponse } from "next/server";
import { PRODUCTS } from "../../../../config/products";
import { getStripeSuccessUrl, resolveCheckoutOrigin } from "../../../../config/checkout";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";
import { getStripeServer } from "../../../../lib/stripe/server";
import {
  PRICING,
  computeDepositToday,
  computeRemainingBalance,
  computeTotal,
  type DetailflowAddonId,
  type DetailflowTierId,
} from "../../../../lib/pricing";
import {
  isDetailflowAddonId,
  isDetailflowTierId,
} from "../../../../lib/checkout/session-store";

type CreateEmbeddedCheckoutBody = {
  productId?: string;
  tierId?: string;
  addonIds?: unknown;
  customerEmail?: string;
  orderId?: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toAddonIds(value: unknown): DetailflowAddonId[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => getString(item)).filter(isDetailflowAddonId)));
}

function toStripeAmountCents(amountUsd: number): number {
  return Math.max(0, Math.round(amountUsd * 100));
}

/**
 * Creates an embedded Stripe Checkout session and returns clientSecret for mounting.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateEmbeddedCheckoutBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const productId = getString(body.productId);
  const tierId = getString(body.tierId);
  const orderId = getString(body.orderId);
  const customerEmail = getString(body.customerEmail);
  const addonIds = toAddonIds(body.addonIds);

  if (productId !== PRODUCTS.detailflow.product_id) {
    return NextResponse.json(
      { error: "Only detailflow embedded checkout is supported." },
      { status: 400 },
    );
  }

  if (!isDetailflowTierId(tierId)) {
    return NextResponse.json({ error: "Invalid or missing tierId." }, { status: 400 });
  }

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  const requestUrl = new URL(request.url);
  const checkoutOrigin = resolveCheckoutOrigin(requestUrl.origin);
  const returnUrl = getStripeSuccessUrl(checkoutOrigin).replace(
    "/products/success",
    "/products/embedded-return",
  );

  const depositAmountUsd = computeDepositToday(PRICING, tierId, addonIds);
  const totalAmountUsd = computeTotal(PRICING, tierId, addonIds);
  const remainingAmountUsd = computeRemainingBalance(PRICING, tierId, addonIds);

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      return_url: returnUrl,
      customer_email: customerEmail || undefined,
      client_reference_id: orderId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: toStripeAmountCents(depositAmountUsd),
            product_data: {
              name: "DetailFlow Deposit",
              description: `Order ${orderId}: deposit ${depositAmountUsd} USD now, ${remainingAmountUsd} USD remaining of ${totalAmountUsd} USD`,
            },
          },
        },
      ],
      metadata: {
        orderId,
        tierId,
        addonIds: addonIds.join(","),
      },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe session did not return client_secret." },
        { status: 502 },
      );
    }

    try {
      const supabase = getSupabaseServerClient();
      await supabase.updateOrderByOrderId(orderId, {
        stripe_session_id: session.id,
        customer_email: customerEmail || null,
        status: "created",
      });
    } catch {
      // Non-blocking: payment UX should continue even if persistence is delayed.
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      orderId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe embedded checkout session failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
