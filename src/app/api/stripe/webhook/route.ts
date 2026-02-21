import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendOrderConfirmedBundle } from "../../../../lib/email";
import { CAL_LINKS } from "../../../../config/cal";
import {
  PRICING,
  computeDepositToday,
  computeRemainingBalance,
  type DetailflowAddonId,
  type DetailflowTierId,
} from "../../../../lib/pricing";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";
import { isDetailflowAddonId, isDetailflowTierId } from "../../../../lib/checkout/session-store";
import { getStripeServer } from "../../../../lib/stripe/server";

export const runtime = "nodejs";

const processedEvents = new Set<string>();

const TIER_LABELS: Record<DetailflowTierId, string> = {
  starter: "Starter",
  growth: "Growth",
  pro_launch: "Pro Launch",
};

const ADDON_LABELS: Record<string, string> = {
  advanced_email_styling: "Advanced Email Styling",
  hosting_help: "Hosting Help",
  analytics_deep_setup: "Analytics Deep Setup",
  content_structuring: "Content Structuring",
  brand_polish: "Brand Polish",
  booking_setup_assistance: "Booking Setup Assistance",
  photo_optimization: "Photo Optimization",
  strategy_call: "Free 20-Min Strategy Call",
};

type KnownOrderRow = {
  order_id: string;
  status: string;
  tier_id: DetailflowTierId | "";
  addon_ids: DetailflowAddonId[];
  customer_email: string;
  stripe_session_id: string;
  email_sent_at: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseAddonIds(raw: string): DetailflowAddonId[] {
  if (!raw) return [];
  const maybeJson = raw.trim();
  if (maybeJson.startsWith("[") && maybeJson.endsWith("]")) {
    try {
      const parsed = JSON.parse(maybeJson) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => getString(item))
          .filter((id): id is DetailflowAddonId => isDetailflowAddonId(id));
      }
    } catch {
      // fallback CSV parse below
    }
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((id): id is DetailflowAddonId => isDetailflowAddonId(id));
}

function normalizeOrderRow(value: unknown): KnownOrderRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const tierCandidate = getString(source.tier_id);
  const addonIds = Array.isArray(source.addon_ids)
    ? source.addon_ids
        .map((item) => getString(item))
        .filter((id): id is DetailflowAddonId => isDetailflowAddonId(id))
    : [];

  return {
    order_id: getString(source.order_id),
    status: getString(source.status),
    tier_id: isDetailflowTierId(tierCandidate) ? tierCandidate : "",
    addon_ids: addonIds,
    customer_email: getString(source.customer_email),
    stripe_session_id: getString(source.stripe_session_id),
    email_sent_at: getString(source.email_sent_at),
  };
}

function tierLabelFor(tierId: DetailflowTierId | ""): string {
  if (!tierId) return "DetailFlow";
  return TIER_LABELS[tierId] || tierId;
}

function addonLabelsFor(addonIds: DetailflowAddonId[]): string[] {
  return addonIds.map((addonId) => ADDON_LABELS[addonId] || addonId);
}

function getOrderIdFromSession(session: Stripe.Checkout.Session): string {
  return (
    getString(session.metadata?.orderId) ||
    getString(session.metadata?.order_id) ||
    getString(session.client_reference_id)
  );
}

function getTierIdFromSession(session: Stripe.Checkout.Session): DetailflowTierId | "" {
  const tierRaw = getString(session.metadata?.tierId) || getString(session.metadata?.tier_id);
  if (isDetailflowTierId(tierRaw)) return tierRaw;
  return "";
}

function getAddonIdsFromSession(session: Stripe.Checkout.Session): DetailflowAddonId[] {
  const raw = getString(session.metadata?.addonIds) || getString(session.metadata?.addon_ids);
  return parseAddonIds(raw);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = getString(session.id);
  const orderId = getOrderIdFromSession(session);
  const tierIdFromSession = getTierIdFromSession(session);
  const addonIdsFromSession = getAddonIdsFromSession(session);
  const customerEmail =
    getString(session.customer_details?.email) || getString(session.customer_email);

  console.log("Stripe webhook checkout.session.completed", {
    session_id: sessionId,
    order_id: orderId,
  });

  const supabase = getSupabaseServerClient();
  let orderRow: KnownOrderRow | null = null;

  try {
    if (orderId) {
      orderRow = normalizeOrderRow(await supabase.findOrderByOrderId(orderId));
    }
    if (!orderRow && sessionId) {
      orderRow = normalizeOrderRow(await supabase.findOrderBySessionId(sessionId));
    }

    if (!orderRow && orderId) {
      const insertedRows = await supabase.insertOrder({
        order_id: orderId,
        status: "paid",
        product_id: "detailflow",
        tier_id: tierIdFromSession || "starter",
        addon_ids: addonIdsFromSession,
        customer_email: customerEmail || null,
        stripe_session_id: sessionId,
        email_sent_at: null,
      });
      orderRow = normalizeOrderRow(insertedRows[0]);
    }

    if (!orderRow) {
      console.error("Stripe webhook could not resolve order for session", {
        session_id: sessionId,
        order_id: orderId,
      });
      return;
    }

    const canonicalTierId = orderRow.tier_id || tierIdFromSession;
    const canonicalAddonIds =
      orderRow.addon_ids.length > 0 ? orderRow.addon_ids : addonIdsFromSession;
    const canonicalCustomerEmail = orderRow.customer_email || customerEmail;

    const patch: Record<string, unknown> = {
      status: "paid",
      stripe_session_id: sessionId,
    };
    if (!orderRow.customer_email && canonicalCustomerEmail) {
      patch.customer_email = canonicalCustomerEmail;
    }
    if (!orderRow.tier_id && canonicalTierId) {
      patch.tier_id = canonicalTierId;
    }
    if (orderRow.addon_ids.length === 0 && canonicalAddonIds.length > 0) {
      patch.addon_ids = canonicalAddonIds;
    }

    if (Object.keys(patch).length > 0) {
      const updatedRows = await supabase.updateOrderByOrderId(orderRow.order_id, patch);
      orderRow = normalizeOrderRow(updatedRows[0]) || orderRow;
    }

    if (orderRow.email_sent_at || !canonicalCustomerEmail) {
      return;
    }

    const pricedTierId = isDetailflowTierId(canonicalTierId) ? canonicalTierId : null;
    const deposit = pricedTierId
      ? computeDepositToday(PRICING, pricedTierId, canonicalAddonIds)
      : (session.amount_total || 0) / 100;
    const remaining = pricedTierId
      ? computeRemainingBalance(PRICING, pricedTierId, canonicalAddonIds)
      : 0;

    const emailResult = await sendOrderConfirmedBundle({
      orderId: orderRow.order_id,
      customerEmail: canonicalCustomerEmail,
      summary: {
        tierLabel: tierLabelFor(canonicalTierId),
        addOnLabels: addonLabelsFor(canonicalAddonIds),
        deposit,
        remaining,
      },
      bookingUrl: process.env.NEXT_PUBLIC_STRATEGY_CALL_URL || CAL_LINKS.detailflowSetup,
      stripeSessionId: sessionId,
    });

    if (emailResult.sent.client || emailResult.sent.internal) {
      await supabase.updateOrderByOrderId(orderRow.order_id, {
        email_sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Stripe webhook handler error", {
      message: error instanceof Error ? error.message : "Unknown error",
      order_id: orderId,
      session_id: sessionId,
    });
    throw error;
  }
}

/**
 * Stripe webhook receiver with signature verification.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature") || "";
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, deduped: true });
  }
  processedEvents.add(event.id);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      event_id: event.id,
      type: event.type,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
