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

type CreateCheckoutRequestBody = {
  productId?: string;
  tierId?: string;
  addonIds?: unknown;
  customerEmail?: string;
  orderId?: string;
};

type StripeCheckoutSessionResponse = Record<string, unknown>;

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
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function getAllowPlaceholderCheckout(): boolean {
  return (process.env.STRIPE_CHECKOUT_ALLOW_PLACEHOLDER || "").trim().toLowerCase() === "true";
}

const TIER_LABELS: Record<DetailflowTierId, string> = {
  starter: "Starter",
  growth: "Growth",
  pro_launch: "Pro Launch",
};

async function createStripeCheckoutSession(input: {
  origin: string;
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

  const successUrl = `${input.origin}/products/success?session_id={CHECKOUT_SESSION_ID}&celebrate=1`;
  const cancelUrl = `${input.origin}/products#detailflow-template`;
  const amountCents = toStripeAmountCents(input.depositAmountUsd);

  const form = new URLSearchParams();
  form.set("mode", "payment");
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
    return { ok: false, error: message };
  }

  const sessionId = getString(payload.id);
  const checkoutUrl = getString(payload.url);

  if (!sessionId || !checkoutUrl) {
    return { ok: false, error: "Stripe response missing checkout url or session id." };
  }

  return { ok: true, url: checkoutUrl, sessionId };
}

/**
 * Creates a server-side checkout session payload for DetailFlow.
 * Placeholder mode marks sessions as paid so drawer workflow can be validated end-to-end.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateCheckoutRequestBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const productId = (body.productId || "").trim();
  const tierId = (body.tierId || "").trim();
  const customerEmail = (body.customerEmail || "").trim();
  const providedOrderId = (body.orderId || "").trim();
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

  const requestUrl = new URL(request.url);
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredOrigin || requestUrl.origin;
  const orderId = providedOrderId || "";
  const stripeLiveEnabled = getStripeCheckoutEnabled();
  const allowPlaceholder = getAllowPlaceholderCheckout();

  if (!stripeLiveEnabled && !allowPlaceholder) {
    return NextResponse.json(
      {
        error:
          "Stripe live checkout is not configured. Add STRIPE_SECRET_KEY (and optional STRIPE_CHECKOUT_LIVE_MODE=true) to enable checkout.",
      },
      { status: 503 },
    );
  }

  if (stripeLiveEnabled && !orderId && !allowPlaceholder) {
    return NextResponse.json(
      { error: "orderId is required before creating a live Stripe checkout session." },
      { status: 400 },
    );
  }

  let liveCheckoutWarning = "";
  if (stripeLiveEnabled && orderId) {
    const depositAmountUsd = computeDepositToday(PRICING, tierId, typedAddonIds);
    const totalAmountUsd = computeTotal(PRICING, tierId, typedAddonIds);
    const remainingAmountUsd = computeRemainingBalance(PRICING, tierId, typedAddonIds);
    const stripeSession = await createStripeCheckoutSession({
      origin,
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
        await supabase.updateOrderByOrderId(orderId, {
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
      return NextResponse.json(
        {
          error: stripeSession.error || "Stripe live checkout session creation failed.",
        },
        { status: 502 },
      );
    }

    liveCheckoutWarning = stripeSession.error || "Stripe live checkout unavailable; using placeholder flow.";
  }

  if (!allowPlaceholder) {
    return NextResponse.json(
      {
        error: "Stripe live checkout is required. Placeholder flow is disabled.",
      },
      { status: 503 },
    );
  }

  const record = createCheckoutSessionRecord({
    origin,
    tierId,
    addonIds: typedAddonIds,
    customerEmail,
    orderId: orderId || undefined,
  });

  let persistenceWarning = "";
  if (orderId) {
    try {
      const supabase = getSupabaseServerClient();
      await supabase.updateOrderByOrderId(orderId, {
        stripe_session_id: record.sessionId,
        customer_email: customerEmail || null,
        status: "paid",
      });
    } catch (error) {
      persistenceWarning = error instanceof Error ? error.message : "Supabase order sync failed.";
    }
  }

  return NextResponse.json({
    url: record.checkoutUrl,
    sessionId: record.sessionId,
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
