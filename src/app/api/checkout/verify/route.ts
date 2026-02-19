import { NextResponse } from "next/server";
import { getCheckoutSessionRecord } from "../../../../../lib/checkout/session-store";

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
    verifiedAt: new Date().toISOString(),
  });
}
