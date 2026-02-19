import { NextResponse } from "next/server";
import {
  createCheckoutSessionRecord,
  isDetailflowAddonId,
  isDetailflowTierId,
} from "../../../../../lib/checkout/session-store";

type CreateCheckoutRequestBody = {
  productId?: string;
  tierId?: string;
  addonIds?: unknown;
  customerEmail?: string;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
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
  const rawAddonIds = toStringArray(body.addonIds);
  const addonIds = Array.from(new Set(rawAddonIds));

  if (productId !== "detailflow") {
    return NextResponse.json({ error: "Only detailflow checkout is supported in this route." }, { status: 400 });
  }

  if (!isDetailflowTierId(tierId)) {
    return NextResponse.json({ error: "Invalid or missing tierId." }, { status: 400 });
  }

  const invalidAddon = addonIds.find((id) => !isDetailflowAddonId(id));
  if (invalidAddon) {
    return NextResponse.json({ error: `Invalid add-on id: ${invalidAddon}` }, { status: 400 });
  }

  const requestUrl = new URL(request.url);
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredOrigin || requestUrl.origin;

  const record = createCheckoutSessionRecord({
    origin,
    tierId,
    addonIds,
    customerEmail,
  });

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
  });
}
