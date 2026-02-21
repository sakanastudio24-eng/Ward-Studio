import { NextResponse } from "next/server";
import { PRODUCTS } from "../../../../config/products";
import { getStripeSuccessUrl, resolveCheckoutOrigin } from "../../../../config/checkout";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";
import { getStripeServer } from "../../../../lib/stripe/server";
import { getStripeDiagnostics } from "../../../../lib/stripe/diagnostics";
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
import { getAddonAvailability } from "../../../../lib/rules";
import { enforceRateLimit, rateLimitedResponse } from "../../../../lib/rate-limit/server";

type CreateEmbeddedCheckoutBody = {
  productId?: string;
  tierId?: string;
  addonIds?: unknown;
  customerEmail?: string;
  orderId?: string;
  orderUuid?: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toAddonIds(value: unknown): DetailflowAddonId[] {
  if (!Array.isArray(value)) return [];
  const raw = value.map((item) => getString(item)).filter(Boolean);
  const unique = Array.from(new Set(raw));
  const invalid = unique.find((item) => !isDetailflowAddonId(item));
  if (invalid) {
    throw new Error(`Invalid add-on id: ${invalid}`);
  }
  return unique as DetailflowAddonId[];
}

function toStripeAmountCents(amountUsd: number): number {
  return Math.max(0, Math.round(amountUsd * 100));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates an embedded Stripe Checkout session and returns clientSecret for mounting.
 */
export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "stripe-create-checkout-session",
    limit: 25,
    windowMs: 60_000,
  });
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as CreateEmbeddedCheckoutBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const productId = getString(body.productId);
  const tierId = getString(body.tierId);
  const orderId = getString(body.orderId);
  const orderUuid = getString(body.orderUuid);
  const customerEmail = getString(body.customerEmail);
  let addonIds: DetailflowAddonId[] = [];
  try {
    addonIds = toAddonIds(body.addonIds);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid add-on ids." },
      { status: 400 },
    );
  }

  if (productId !== PRODUCTS.detailflow.product_id) {
    return NextResponse.json(
      { error: "Only detailflow embedded checkout is supported." },
      { status: 400 },
    );
  }

  if (!isDetailflowTierId(tierId)) {
    return NextResponse.json({ error: "Invalid or missing tierId." }, { status: 400 });
  }
  const unavailableAddon = addonIds.find((addonId) => !getAddonAvailability(tierId, addonId).enabled);
  if (unavailableAddon) {
    return NextResponse.json(
      { error: `Add-on ${unavailableAddon} is not available for tier ${tierId}.` },
      { status: 400 },
    );
  }

  if (!orderId || !orderUuid) {
    return NextResponse.json({ error: "orderId and orderUuid are required." }, { status: 400 });
  }
  if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
    return NextResponse.json({ error: "customerEmail must be a valid email address." }, { status: 400 });
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
        order_uuid: orderUuid,
        order_id: orderId,
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
      await supabase.updateOrderByUuid(orderUuid, {
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
      orderUuid,
      orderId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe embedded checkout session failed.";
    console.error("Stripe error:", message);
    return NextResponse.json(
      { error: message, diagnostics: getStripeDiagnostics() },
      { status: 502 },
    );
  }
}
