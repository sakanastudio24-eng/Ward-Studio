import { NextResponse } from "next/server";
import { PRODUCTS } from "../../../../config/products";
import type { DetailflowAddonId, DetailflowTierId } from "../../../../lib/pricing";
import { PRICING } from "../../../../lib/pricing";
import { getSupabaseServer } from "../../../../lib/supabase-server";
import { getAddonAvailability } from "../../../../lib/rules";
import { enforceRateLimit, rateLimitedResponse } from "../../../../lib/rate-limit/server";

type CreateOrderBody = {
  product_id?: unknown;
  tier_id?: unknown;
  addon_ids?: unknown;
  customer_email?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_COLLISION_RETRIES = 3;
const VALID_TIER_IDS = new Set<DetailflowTierId>(Object.keys(PRICING.tiers) as DetailflowTierId[]);
const VALID_ADDON_IDS = new Set<DetailflowAddonId>(
  Object.keys(PRICING.addons) as DetailflowAddonId[],
);

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getAddonIds(value: unknown): DetailflowAddonId[] {
  if (!Array.isArray(value)) return [];
  const rawIds = value.map((item) => getString(item)).filter(Boolean);
  const uniqueIds = Array.from(new Set(rawIds));

  const invalid = uniqueIds.find((id) => !VALID_ADDON_IDS.has(id as DetailflowAddonId));
  if (invalid) {
    throw new Error(`Invalid add-on id: ${invalid}`);
  }

  return uniqueIds as DetailflowAddonId[];
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code || "") : "";
  const message = "message" in error ? String(error.message || "") : "";
  return code === "23505" || message.toLowerCase().includes("duplicate key");
}

function buildOrderId(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${year}-${mm}${dd}-${suffix}`;
}

/**
 * Creates a new DetailFlow order row in Supabase before checkout starts.
 */
export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "orders-create",
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = (await request.json().catch(() => null)) as CreateOrderBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const productId = getString(payload.product_id);
  const tierId = getString(payload.tier_id);
  const customerEmailRaw = getString(payload.customer_email).toLowerCase();

  if (productId !== PRODUCTS.detailflow.product_id) {
    return NextResponse.json(
      { error: "Only detailflow orders are supported in this endpoint." },
      { status: 400 },
    );
  }

  if (!VALID_TIER_IDS.has(tierId as DetailflowTierId)) {
    return NextResponse.json({ error: "Invalid or missing tier_id." }, { status: 400 });
  }

  let addonIds: DetailflowAddonId[];
  try {
    addonIds = getAddonIds(payload.addon_ids);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid add-on ids." },
      { status: 400 },
    );
  }

  const unavailable = addonIds.find((addonId) => !getAddonAvailability(tierId as DetailflowTierId, addonId).enabled);
  if (unavailable) {
    return NextResponse.json(
      { error: `Add-on ${unavailable} is not available for tier ${tierId}.` },
      { status: 400 },
    );
  }

  if (customerEmailRaw && !EMAIL_REGEX.test(customerEmailRaw)) {
    return NextResponse.json({ error: "customer_email must be a valid email address." }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt += 1) {
    const orderId = buildOrderId(PRODUCTS.detailflow.order_prefix);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        status: "created",
        product_id: productId,
        tier_id: tierId,
        addon_ids: addonIds,
        customer_email: customerEmailRaw || null,
        stripe_session_id: null,
        email_sent_at: null,
      })
      .select("id, order_id")
      .single();

    if (!error) {
      console.log("Order created:", getString(data?.order_id) || orderId);
      return NextResponse.json({
        order_uuid: getString(data?.id),
        order_id: getString(data?.order_id) || orderId,
      });
    }

    if (!isUniqueConstraintError(error)) {
      console.error("Order create error:", error.message);
      return NextResponse.json(
        { error: `Unable to create order: ${error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: "Could not generate a unique order id. Please retry." },
    { status: 500 },
  );
}
