import { NextResponse } from "next/server";
import { sendOrderConfirmedBundle, type OrderSummary } from "../../../../lib/email";
import { env } from "../../../../env";
import { enforceRateLimit, rateLimitedResponse } from "../../../../lib/rate-limit/server";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

type OrderConfirmedRequestBody = {
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
  summary?: {
    tierLabel?: string;
    addOnLabels?: unknown;
    deposit?: number;
    remaining?: number;
  };
  bookingUrl?: string;
  stripeSessionId?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getInternalRouteSecret(request: Request): string {
  return (request.headers.get("x-order-email-secret") || "").trim();
}

function getConfiguredRouteSecret(): string {
  return (env.ORDER_EMAIL_ROUTE_SECRET || "").trim();
}

function parseSummary(input: unknown): OrderSummary | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const source = input as {
    tierLabel?: unknown;
    addOnLabels?: unknown;
    deposit?: unknown;
    remaining?: unknown;
  };

  const tierLabel = getString(source.tierLabel);
  const addOnLabels = toStringList(source.addOnLabels);
  const deposit = source.deposit;
  const remaining = source.remaining;

  if (!tierLabel) return null;
  if (!isFiniteNumber(deposit) || deposit < 0) return null;
  if (!isFiniteNumber(remaining) || remaining < 0) return null;

  return {
    tierLabel,
    addOnLabels,
    deposit,
    remaining,
  };
}

/**
 * Sends payment-confirmed buyer and internal owner emails from a server-only route.
 */
export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "email-order-confirmed",
    limit: 12,
    windowMs: 60_000,
  });
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = (await request.json().catch(() => null)) as OrderConfirmedRequestBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const configuredRouteSecret = getConfiguredRouteSecret();
  if (!configuredRouteSecret) {
    return NextResponse.json(
      { error: "ORDER_EMAIL_ROUTE_SECRET is not configured for this route." },
      { status: 503 },
    );
  }

  const providedRouteSecret = getInternalRouteSecret(request);
  if (!providedRouteSecret || providedRouteSecret !== configuredRouteSecret) {
    return NextResponse.json(
      { error: "Forbidden. This route is restricted to trusted server callers." },
      { status: 403 },
    );
  }

  const orderId = getString(payload.orderId);
  const customerEmail = getString(payload.customerEmail);
  const customerName = getString(payload.customerName);
  const bookingUrl = getString(payload.bookingUrl);
  const stripeSessionId = getString(payload.stripeSessionId);
  const summary = parseSummary(payload.summary);

  if (!orderId || !customerEmail || !summary || !bookingUrl) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: orderId, customerEmail, summary(tierLabel/addOnLabels/deposit/remaining), bookingUrl.",
      },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(customerEmail)) {
    return NextResponse.json({ error: "Please provide a valid customerEmail." }, { status: 400 });
  }

  if (!isValidUrl(bookingUrl)) {
    return NextResponse.json({ error: "bookingUrl must be a valid http/https URL." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const order = await supabase.findOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.json({ error: "Unknown orderId." }, { status: 404 });
    }

    const orderStatus =
      typeof order.status === "string" ? order.status.trim().toLowerCase() : "";
    if (orderStatus !== "paid") {
      return NextResponse.json(
        { error: "Order is not paid. Confirmation emails can only be sent for paid orders." },
        { status: 409 },
      );
    }

    const storedEmail =
      typeof order.customer_email === "string" ? order.customer_email.trim() : "";
    if (storedEmail && storedEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "customerEmail does not match the paid order record." },
        { status: 409 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: `Unable to validate order before sending email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 },
    );
  }

  try {
    const result = await sendOrderConfirmedBundle({
      orderId,
      customerEmail,
      customerName,
      summary,
      bookingUrl,
      stripeSessionId: stripeSessionId || undefined,
    });

    return NextResponse.json({
      ok: true,
      deduped: result.deduped,
      sent: result.sent,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        error: `Email provider rejected order-confirmed send: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 502 },
    );
  }
}
