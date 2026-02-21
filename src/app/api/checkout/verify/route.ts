import { NextResponse } from "next/server";
import {
  getCheckoutSessionRecord,
  isDetailflowAddonId,
  isDetailflowTierId,
} from "../../../../lib/checkout/session-store";
import { sendOrderConfirmedBundle } from "../../../../lib/email";
import { CAL_LINKS } from "../../../../config/cal";
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
  hasStripeSecretKey,
  isStripeSessionId,
  retrieveStripeCheckoutSession,
} from "../../../../lib/stripe/session";

const STRATEGY_CALL_URL =
  process.env.NEXT_PUBLIC_STRATEGY_CALL_URL || CAL_LINKS.detailflowSetup;
const PAYMENT_CONFIRMATION_SOURCE = (
  process.env.STRIPE_PAYMENT_CONFIRMATION_SOURCE || "verify"
).trim().toLowerCase();

const TIER_LABELS: Record<string, string> = {
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
  id: string;
  order_id: string;
  status: string;
  tier_id: DetailflowTierId | "";
  addon_ids: DetailflowAddonId[];
  customer_email: string;
  stripe_session_id: string;
  email_sent_at: string;
};

type NormalizedVerification = {
  paid: boolean;
  status: string;
  sessionId: string;
  orderUuid: string;
  orderId: string;
  tierId: DetailflowTierId | "";
  addonIds: DetailflowAddonId[];
  amountTotal: number;
  currency: string;
  customerEmail: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseAddonIds(value: unknown): DetailflowAddonId[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => getString(item))
    .filter((item): item is DetailflowAddonId => isDetailflowAddonId(item));
}

function normalizeOrderRow(value: unknown): KnownOrderRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const tierCandidate = getString(source.tier_id);

  return {
    id: getString(source.id),
    order_id: getString(source.order_id),
    status: getString(source.status),
    tier_id: isDetailflowTierId(tierCandidate) ? tierCandidate : "",
    addon_ids: parseAddonIds(source.addon_ids),
    customer_email: getString(source.customer_email),
    stripe_session_id: getString(source.stripe_session_id),
    email_sent_at: getString(source.email_sent_at),
  };
}

function toStatus(isPaid: boolean, upstreamStatus: string): string {
  if (isPaid) return "paid";
  return upstreamStatus || "pending";
}

function tierLabelFor(tierId: DetailflowTierId | ""): string {
  if (!tierId) return "DetailFlow";
  return TIER_LABELS[tierId] || tierId;
}

function addonLabelsFor(addonIds: DetailflowAddonId[]): string[] {
  return addonIds.map((addonId) => ADDON_LABELS[addonId] || addonId);
}

/**
 * Verifies a checkout session and returns the server-trusted payment summary.
 *
 * Lookup order is intentionally layered for resilience:
 * 1) Stripe API (source of truth for live sessions, includes metadata order_uuid)
 * 2) In-memory fallback session store (dev placeholder path)
 * 3) Supabase lookup by stripe_session_id (durable fallback across instances)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = (url.searchParams.get("session_id") || "").trim();

  if (!sessionId) {
    return NextResponse.json(
      {
        paid: false,
        error: "Missing session_id",
      },
      { status: 400 },
    );
  }

  const localRecord = getCheckoutSessionRecord(sessionId);
  let verification: NormalizedVerification | null = null;
  let stripeLookupError = "";

  if (hasStripeSecretKey() && isStripeSessionId(sessionId)) {
    const stripeLookup = await retrieveStripeCheckoutSession(sessionId);
    if (stripeLookup.ok) {
      const stripeSession = stripeLookup.session;
      const stripePaid =
        stripeSession.paymentStatus === "paid" || stripeSession.status === "complete";

      verification = {
        paid: stripePaid,
        status: toStatus(stripePaid, stripeSession.status),
        sessionId: stripeSession.id,
        orderUuid: stripeSession.orderUuid || "",
        orderId: stripeSession.orderId || localRecord?.orderId || "",
        tierId: stripeSession.tierId || localRecord?.tierId || "",
        addonIds:
          stripeSession.addonIds.length > 0
            ? stripeSession.addonIds
            : localRecord?.addonIds || [],
        amountTotal:
          stripeSession.amountTotalCents > 0
            ? stripeSession.amountTotalCents / 100
            : localRecord?.total || 0,
        currency: stripeSession.currency || localRecord?.currency || "usd",
        customerEmail: stripeSession.customerEmail || localRecord?.customerEmail || "",
      };
    } else {
      stripeLookupError = stripeLookup.error;
    }
  }

  if (!verification && localRecord) {
    verification = {
      paid: localRecord.status === "paid",
      status: localRecord.status,
      sessionId: localRecord.sessionId,
      orderUuid: "",
      orderId: localRecord.orderId,
      tierId: localRecord.tierId,
      addonIds: localRecord.addonIds,
      amountTotal: localRecord.total,
      currency: localRecord.currency,
      customerEmail: localRecord.customerEmail,
    };
  }

  // Durable fallback for cases where the process-local session store is unavailable
  // (e.g. serverless cold starts or separate runtime instances).
  let prelookupSupabaseError = "";
  if (!verification) {
    try {
      const prelookupSupabase = getSupabaseServerClient();
      const prelookupOrder = normalizeOrderRow(
        await prelookupSupabase.findOrderBySessionId(sessionId),
      );

      if (prelookupOrder) {
        const prelookupTierId = isDetailflowTierId(prelookupOrder.tier_id)
          ? prelookupOrder.tier_id
          : "";
        const prelookupAmountTotal = prelookupTierId
          ? computeTotal(PRICING, prelookupTierId, prelookupOrder.addon_ids)
          : 0;

        verification = {
          paid: prelookupOrder.status === "paid",
          status: prelookupOrder.status || "pending",
          sessionId,
          orderUuid: prelookupOrder.id,
          orderId: prelookupOrder.order_id,
          tierId: prelookupTierId,
          addonIds: prelookupOrder.addon_ids,
          amountTotal: prelookupAmountTotal,
          currency: "usd",
          customerEmail: prelookupOrder.customer_email,
        };
      }
    } catch (error) {
      prelookupSupabaseError =
        error instanceof Error ? error.message : "Supabase lookup failed.";
    }
  }

  if (!verification) {
    const extraParts: string[] = [];
    if (stripeLookupError && hasStripeSecretKey()) {
      extraParts.push(`Stripe lookup: ${stripeLookupError}`);
    }
    if (prelookupSupabaseError) {
      extraParts.push(`Supabase lookup: ${prelookupSupabaseError}`);
    }
    const extra = extraParts.length > 0 ? ` ${extraParts.join(" ")}` : "";
    return NextResponse.json(
      {
        paid: false,
        status: "not_found",
        error: `Checkout session not found. Start checkout again.${extra}`,
      },
      { status: 404 },
    );
  }

  let supabase: ReturnType<typeof getSupabaseServerClient> | null = null;
  let orderRow: KnownOrderRow | null = null;
  let supabaseError = "";
  let canonicalOrderUuid = verification.orderUuid;
  let canonicalOrderId = verification.orderId;
  let canonicalTierId = verification.tierId;
  let canonicalAddonIds = verification.addonIds;
  let canonicalCustomerEmail = verification.customerEmail;
  let canonicalStatus = verification.status;

  try {
    supabase = getSupabaseServerClient();
    if (canonicalOrderUuid) {
      orderRow = normalizeOrderRow(await supabase.findOrderByUuid(canonicalOrderUuid));
    }
    if (!orderRow && canonicalOrderId) {
      orderRow = normalizeOrderRow(await supabase.findOrderByOrderId(canonicalOrderId));
    }
    if (!orderRow) {
      orderRow = normalizeOrderRow(await supabase.findOrderBySessionId(verification.sessionId));
    }

    if (!orderRow && canonicalOrderId) {
      const insertedRows = await supabase.insertOrder({
        order_id: canonicalOrderId,
        status: verification.paid ? "paid" : "created",
        product_id: "detailflow",
        tier_id: canonicalTierId || "starter",
        addon_ids: canonicalAddonIds,
        customer_email: canonicalCustomerEmail || null,
        stripe_session_id: verification.sessionId,
        email_sent_at: null,
      });
      orderRow = normalizeOrderRow(insertedRows[0]);
    }

    if (orderRow) {
      canonicalOrderUuid = orderRow.id || canonicalOrderUuid;
      canonicalOrderId = orderRow.order_id || canonicalOrderId;

      const patch: Record<string, unknown> = {};
      if (!orderRow.stripe_session_id || orderRow.stripe_session_id !== verification.sessionId) {
        patch.stripe_session_id = verification.sessionId;
      }
      if (verification.paid && orderRow.status !== "paid") {
        patch.status = "paid";
      }
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
        const updatedRows = canonicalOrderUuid
          ? await supabase.updateOrderByUuid(canonicalOrderUuid, patch)
          : await supabase.updateOrderByOrderId(canonicalOrderId, patch);
        orderRow = normalizeOrderRow(updatedRows[0]) || orderRow;
      }

      if (orderRow.tier_id) {
        canonicalTierId = orderRow.tier_id;
      }
      if (orderRow.addon_ids.length > 0) {
        canonicalAddonIds = orderRow.addon_ids;
      }
      if (orderRow.customer_email) {
        canonicalCustomerEmail = orderRow.customer_email;
      }
      if (orderRow.status) {
        canonicalStatus = orderRow.status;
      }
    }
  } catch (error) {
    supabaseError = error instanceof Error ? error.message : "Supabase sync failed.";
  }

  const pricedTierId = isDetailflowTierId(canonicalTierId) ? canonicalTierId : null;
  const amountTotal = pricedTierId
    ? computeTotal(PRICING, pricedTierId, canonicalAddonIds)
    : verification.amountTotal;
  const deposit = pricedTierId
    ? computeDepositToday(PRICING, pricedTierId, canonicalAddonIds)
    : verification.amountTotal;
  const remaining = pricedTierId
    ? computeRemainingBalance(PRICING, pricedTierId, canonicalAddonIds)
    : 0;

  let emailDispatched = false;
  let emailDeduped = false;
  let emailError = "";

  const webhookFirst = PAYMENT_CONFIRMATION_SOURCE === "webhook";
  if (verification.paid && canonicalCustomerEmail && !webhookFirst) {
    if (orderRow?.email_sent_at) {
      emailDeduped = true;
    } else {
      try {
        const emailResult = await sendOrderConfirmedBundle({
          orderId: canonicalOrderId || verification.sessionId,
          customerEmail: canonicalCustomerEmail,
          summary: {
            tierLabel: tierLabelFor(canonicalTierId),
            addOnLabels: addonLabelsFor(canonicalAddonIds),
            deposit,
            remaining,
          },
          bookingUrl: STRATEGY_CALL_URL,
          stripeSessionId: verification.sessionId,
        });
        emailDispatched = emailResult.sent.client || emailResult.sent.internal;
        emailDeduped = emailResult.deduped;

        if (emailDispatched && supabase && (canonicalOrderUuid || canonicalOrderId)) {
          if (canonicalOrderUuid) {
            await supabase.updateOrderByUuid(canonicalOrderUuid, {
              email_sent_at: new Date().toISOString(),
            });
          } else {
            await supabase.updateOrderByOrderId(canonicalOrderId, {
              email_sent_at: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Order confirmation email failed.";
      }
    }
  } else if (webhookFirst) {
    emailDeduped = Boolean(orderRow?.email_sent_at);
  }

  return NextResponse.json({
    paid: verification.paid,
    status: toStatus(verification.paid, canonicalStatus),
    sessionId: verification.sessionId,
    orderUuid: canonicalOrderUuid || undefined,
    orderId: canonicalOrderId || verification.orderId || verification.sessionId,
    tierId: canonicalTierId || undefined,
    addonIds: canonicalAddonIds,
    deposit,
    remaining,
    amountTotal,
    currency: verification.currency,
    customerEmail: canonicalCustomerEmail || undefined,
    emailDispatched,
    emailDeduped,
    ...(supabaseError ? { supabaseError } : {}),
    ...(stripeLookupError ? { stripeLookupError } : {}),
    ...(emailError ? { emailError } : {}),
    verifiedAt: new Date().toISOString(),
  });
}
