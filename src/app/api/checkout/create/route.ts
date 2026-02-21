import { NextResponse } from "next/server";
import { PRODUCTS } from "../../../../config/products";
import {
  createCheckoutSessionRecord,
  isDetailflowAddonId,
  isDetailflowTierId,
} from "../../../../lib/checkout/session-store";
import {
  PRICING,
  computeDepositToday,
  computeRemainingBalance,
  computeTotal,
  type DetailflowAddonId,
  type DetailflowTierId,
} from "../../../../lib/pricing";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";
import {
  getStripeCancelUrl,
  getStripeSuccessUrl,
  resolveCheckoutOrigin,
} from "../../../../config/checkout";
import { getStripeDiagnostics } from "../../../../lib/stripe/diagnostics";
import { getAddonAvailability } from "../../../../lib/rules";
import { enforceRateLimit, rateLimitedResponse } from "../../../../lib/rate-limit/server";

type CreateCheckoutRequestBody = {
  productId?: string;
  tierId?: string;
  addonIds?: unknown;
  customerEmail?: string;
  orderId?: string;
  orderUuid?: string;
};

type StripeCheckoutSessionResponse = Record<string, unknown>;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toStripeAmountCents(amountUsd: number): number {
  return Math.max(0, Math.round(amountUsd * 100));
}

function getStripeCheckoutEnabled(): boolean {
  const liveMode = (process.env.STRIPE_CHECKOUT_LIVE_MODE || "").trim().toLowerCase();
  if (liveMode === "false") return false;
  // Default behavior: if a Stripe secret exists, assume live checkout should be used.
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function getAllowPlaceholderCheckout(): boolean {
  // Escape hatch for dev/staging when Stripe is intentionally unavailable.
  return (process.env.STRIPE_CHECKOUT_ALLOW_PLACEHOLDER || "").trim().toLowerCase() === "true";
}

const TIER_LABELS: Record<DetailflowTierId, string> = {
  starter: "Starter",
  growth: "Growth",
  pro_launch: "Pro Launch",
};

async function createStripeCheckoutSession(input: {
  checkoutOrigin: string;
  orderUuid: string;
  orderId: string;
  tierId: DetailflowTierId;
  addonIds: DetailflowAddonId[];
  customerEmail: string;
  depositAmountUsd: number;
  totalAmountUsd: number;
  remainingAmountUsd: number;
}): Promise<
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error: string }
> {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!secretKey) {
    return { ok: false, error: "STRIPE_SECRET_KEY is missing." };
  }

  const successUrl = getStripeSuccessUrl(input.checkoutOrigin);
  const cancelUrl = getStripeCancelUrl(input.checkoutOrigin);
  const amountCents = toStripeAmountCents(input.depositAmountUsd);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("allow_promotion_codes", "true");
  form.set("success_url", successUrl);
  form.set("cancel_url", cancelUrl);
  form.set("client_reference_id", input.orderId);
  if (input.customerEmail) {
    form.set("customer_email", input.customerEmail);
  }

  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(amountCents));
  form.set(
    "line_items[0][price_data][product_data][name]",
    `DetailFlow ${TIER_LABELS[input.tierId]} Deposit`,
  );
  form.set(
    "line_items[0][price_data][product_data][description]",
    `Order ${input.orderId}: ${input.addonIds.length > 0 ? `${input.addonIds.length} add-ons selected, ` : ""}deposit ${toStripeAmountCents(input.depositAmountUsd) / 100} USD now, ${input.remainingAmountUsd} USD remaining of ${input.totalAmountUsd} USD`,
  );

  form.set("metadata[order_uuid]", input.orderUuid);
  form.set("metadata[order_id]", input.orderId);
  form.set("metadata[orderId]", input.orderId);
  form.set("metadata[tierId]", input.tierId);
  form.set("metadata[addonIds]", input.addonIds.join(","));

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const payload = (await response.json().catch(() => ({}))) as StripeCheckoutSessionResponse;

  if (!response.ok) {
    let message = "Stripe checkout session creation failed.";
    const maybeError = payload.error;
    if (maybeError && typeof maybeError === "object" && !Array.isArray(maybeError)) {
      const errorMessage = (maybeError as Record<string, unknown>).message;
      if (typeof errorMessage === "string" && errorMessage.trim()) {
        message = errorMessage.trim();
      }
    }
    console.error("Stripe error:", message);
    return { ok: false, error: message };
  }

  const sessionId = getString(payload.id);
  const checkoutUrl = getString(payload.url);

  if (!sessionId || !checkoutUrl) {
    console.error("Stripe error:", "Stripe response missing checkout url or session id.");
    return { ok: false, error: "Stripe response missing checkout url or session id." };
  }

  return { ok: true, url: checkoutUrl, sessionId };
}

/**
 * Creates a server-side checkout session payload for DetailFlow.
 * Flow:
 * 1) Validate payload and product/tier/add-on ids
 * 2) Try live Stripe checkout session when enabled
 * 3) Persist stripe_session_id on existing order row
 * 4) Optionally fall back to placeholder checkout when explicitly allowed
 */
export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "checkout-create",
    limit: 25,
    windowMs: 60_000,
  });
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as CreateCheckoutRequestBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const productId = (body.productId || "").trim();
  const tierId = (body.tierId || "").trim();
  const customerEmail = (body.customerEmail || "").trim();
  const providedOrderId = (body.orderId || "").trim();
  const providedOrderUuid = (body.orderUuid || "").trim();
  const rawAddonIds = toStringArray(body.addonIds);
  const addonIds = Array.from(new Set(rawAddonIds));

  if (productId !== PRODUCTS.detailflow.product_id) {
    return NextResponse.json({ error: "Only detailflow checkout is supported in this route." }, { status: 400 });
  }

  if (!isDetailflowTierId(tierId)) {
    return NextResponse.json({ error: "Invalid or missing tierId." }, { status: 400 });
  }

  const invalidAddon = addonIds.find((id) => !isDetailflowAddonId(id));
  if (invalidAddon) {
    return NextResponse.json({ error: `Invalid add-on id: ${invalidAddon}` }, { status: 400 });
  }
  const typedAddonIds = addonIds.filter((id): id is DetailflowAddonId => isDetailflowAddonId(id));
  const unavailableAddon = typedAddonIds.find((addonId) => !getAddonAvailability(tierId, addonId).enabled);
  if (unavailableAddon) {
    return NextResponse.json(
      { error: `Add-on ${unavailableAddon} is not available for tier ${tierId}.` },
      { status: 400 },
    );
  }

  if (!customerEmail) {
    return NextResponse.json({ error: "customerEmail is required." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(customerEmail)) {
    return NextResponse.json({ error: "customerEmail must be a valid email address." }, { status: 400 });
  }

  const requestUrl = new URL(request.url);
  const checkoutOrigin = resolveCheckoutOrigin(requestUrl.origin);
  const orderId = providedOrderId || "";
  const orderUuid = providedOrderUuid || "";
  const stripeLiveEnabled = getStripeCheckoutEnabled();
  const allowPlaceholder = getAllowPlaceholderCheckout();

  if (!stripeLiveEnabled && !allowPlaceholder) {
    const diagnostics = getStripeDiagnostics();
    return NextResponse.json(
      {
        error:
          "Stripe live checkout is not configured. Add STRIPE_SECRET_KEY (and optional STRIPE_CHECKOUT_LIVE_MODE=true) to enable checkout.",
        diagnostics,
      },
      { status: 503 },
    );
  }

  if (stripeLiveEnabled && (!orderId || !orderUuid) && !allowPlaceholder) {
    return NextResponse.json(
      {
        error:
          "orderId and orderUuid are required before creating a live Stripe checkout session.",
      },
      { status: 400 },
    );
  }

  let liveCheckoutWarning = "";
  if (stripeLiveEnabled && orderId && orderUuid) {
    const depositAmountUsd = computeDepositToday(PRICING, tierId, typedAddonIds);
    const totalAmountUsd = computeTotal(PRICING, tierId, typedAddonIds);
    const remainingAmountUsd = computeRemainingBalance(PRICING, tierId, typedAddonIds);
    const stripeSession = await createStripeCheckoutSession({
      checkoutOrigin,
      orderUuid,
      orderId,
      tierId,
      addonIds: typedAddonIds,
      customerEmail,
      depositAmountUsd,
      totalAmountUsd,
      remainingAmountUsd,
    });

    if (stripeSession.ok) {
      let persistenceWarning = "";
      try {
        const supabase = getSupabaseServerClient();
        await supabase.updateOrderByUuid(orderUuid, {
          stripe_session_id: stripeSession.sessionId,
          customer_email: customerEmail || null,
          status: "created",
        });
      } catch (error) {
        persistenceWarning = error instanceof Error ? error.message : "Supabase order sync failed.";
      }

      return NextResponse.json({
        url: stripeSession.url,
        sessionId: stripeSession.sessionId,
        orderUuid,
        orderId,
        tierId,
        addonIds: typedAddonIds,
        deposit: depositAmountUsd,
        remaining: remainingAmountUsd,
        amountTotal: totalAmountUsd,
        currency: "usd",
        liveCheckout: true,
        ...(persistenceWarning ? { persistenceWarning } : {}),
      });
    }

    if (!allowPlaceholder) {
      console.error("Stripe error:", stripeSession.error || "Stripe live checkout session creation failed.");
      const diagnostics = getStripeDiagnostics();
      // In strict mode we fail hard so users do not continue without Stripe confirmation.
      return NextResponse.json(
        {
          error: stripeSession.error || "Stripe live checkout session creation failed.",
          diagnostics,
        },
        { status: 502 },
      );
    }

    liveCheckoutWarning = stripeSession.error || "Stripe live checkout unavailable; using placeholder flow.";
  }

  if (!allowPlaceholder) {
    const diagnostics = getStripeDiagnostics();
    // Guard against accidental "silent fallback" in production.
    return NextResponse.json(
      {
        error: "Stripe live checkout is required. Placeholder flow is disabled.",
        diagnostics,
      },
      { status: 503 },
    );
  }

  const record = createCheckoutSessionRecord({
    origin: checkoutOrigin,
    tierId,
    addonIds: typedAddonIds,
    customerEmail,
    orderId: orderId || undefined,
  });

  let persistenceWarning = "";
  if (orderUuid || orderId) {
    try {
      const supabase = getSupabaseServerClient();
      const patch = {
        stripe_session_id: record.sessionId,
        customer_email: customerEmail || null,
        status: "paid",
      };
      if (orderUuid) {
        await supabase.updateOrderByUuid(orderUuid, patch);
      } else if (orderId) {
        await supabase.updateOrderByOrderId(orderId, patch);
      }
    } catch (error) {
      console.error(
        "Checkout persistence error:",
        error instanceof Error ? error.message : "Supabase order sync failed.",
      );
      persistenceWarning = error instanceof Error ? error.message : "Supabase order sync failed.";
    }
  }

  return NextResponse.json({
    url: record.checkoutUrl,
    sessionId: record.sessionId,
    orderUuid: orderUuid || undefined,
    orderId: record.orderId,
    tierId: record.tierId,
    addonIds: record.addonIds,
    deposit: record.deposit,
    remaining: record.remaining,
    amountTotal: record.total,
    currency: record.currency,
    liveCheckout: false,
    ...(liveCheckoutWarning ? { liveCheckoutWarning } : {}),
    ...(persistenceWarning ? { persistenceWarning } : {}),
  });
}
