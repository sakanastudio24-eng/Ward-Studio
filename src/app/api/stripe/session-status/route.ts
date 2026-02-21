import { NextResponse } from "next/server";
import { getStripeServer } from "../../../../lib/stripe/server";
import { getStripeDiagnostics } from "../../../../lib/stripe/diagnostics";

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Returns the current Stripe checkout session status for embedded return handling.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = getString(url.searchParams.get("session_id"));

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail =
      getString(session.customer_details?.email) || getString(session.customer_email);

    return NextResponse.json({
      status: getString(session.status),
      payment_status: getString(session.payment_status),
      customer_email: customerEmail,
      session_id: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe session status lookup failed.";
    return NextResponse.json(
      { error: message, diagnostics: getStripeDiagnostics() },
      { status: 502 },
    );
  }
}
