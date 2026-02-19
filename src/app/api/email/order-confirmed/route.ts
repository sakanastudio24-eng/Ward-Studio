import { NextResponse } from "next/server";
import { sendOrderConfirmedBundle, type OrderSummary } from "../../../../lib/email";

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
  const payload = (await request.json().catch(() => null)) as OrderConfirmedRequestBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
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
