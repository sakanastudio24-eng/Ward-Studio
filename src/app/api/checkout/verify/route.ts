import { NextResponse } from "next/server";
import { getCheckoutSessionRecord } from "../../../../lib/checkout/session-store";
import { sendOrderConfirmedBundle } from "../../../../lib/email";

const STRATEGY_CALL_URL = process.env.NEXT_PUBLIC_STRATEGY_CALL_URL || "https://cal.com/";

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

/**
 * Verifies a checkout session and returns the server-trusted payment summary.
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

  const record = getCheckoutSessionRecord(sessionId);
  if (!record) {
    return NextResponse.json(
      {
        paid: false,
        status: "not_found",
        error: "Checkout session not found. Start checkout again.",
      },
      { status: 404 },
    );
  }

  const paid = record.status === "paid";
  let emailDispatched = false;
  let emailDeduped = false;
  let emailError = "";

  if (paid && record.customerEmail) {
    try {
      const emailResult = await sendOrderConfirmedBundle({
        orderId: record.orderId,
        customerEmail: record.customerEmail,
        summary: {
          tierLabel: TIER_LABELS[record.tierId] || record.tierId,
          addOnLabels: record.addonIds.map((id) => ADDON_LABELS[id] || id),
          deposit: record.deposit,
          remaining: record.remaining,
        },
        bookingUrl: STRATEGY_CALL_URL,
        stripeSessionId: record.sessionId,
      });
      emailDispatched = emailResult.sent.client || emailResult.sent.internal;
      emailDeduped = emailResult.deduped;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Order confirmation email failed.";
    }
  }

  return NextResponse.json({
    paid,
    status: record.status,
    sessionId: record.sessionId,
    orderId: record.orderId,
    tierId: record.tierId,
    addonIds: record.addonIds,
    deposit: record.deposit,
    remaining: record.remaining,
    amountTotal: record.total,
    currency: record.currency,
    customerEmail: record.customerEmail,
    emailDispatched,
    emailDeduped,
    ...(emailError ? { emailError } : {}),
    verifiedAt: new Date().toISOString(),
  });
}
