import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase-server";

type OnboardingSubmitBody = {
  order_id?: unknown;
  config_json?: unknown;
  asset_links?: unknown;
};

const SENSITIVE_KEY_REGEX = /(api[_-]?key|token|password|secret|webhook)/i;

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseAssetLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const links = value.map((item) => getString(item)).filter(Boolean);
  const invalid = links.find((link) => !isValidHttpUrl(link));
  if (invalid) {
    throw new Error(`Invalid asset link: ${invalid}`);
  }
  return links;
}

function sanitizeConfigNode(node: unknown): {
  value: unknown;
  strippedKeys: string[];
} {
  if (Array.isArray(node)) {
    const strippedKeys: string[] = [];
    const value = node.map((item) => {
      const next = sanitizeConfigNode(item);
      strippedKeys.push(...next.strippedKeys);
      return next.value;
    });
    return { value, strippedKeys };
  }

  if (isPlainObject(node)) {
    const strippedKeys: string[] = [];
    const sanitizedObject: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(node)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        strippedKeys.push(key);
        continue;
      }
      const sanitizedValue = sanitizeConfigNode(value);
      strippedKeys.push(...sanitizedValue.strippedKeys);
      sanitizedObject[key] = sanitizedValue.value;
    }

    return {
      value: sanitizedObject,
      strippedKeys,
    };
  }

  return { value: node, strippedKeys: [] };
}

/**
 * Stores a safe onboarding payload for an existing order.
 */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as OnboardingSubmitBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderId = getString(payload.order_id);
  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id." }, { status: 400 });
  }

  const configInput = payload.config_json ?? {};
  if (!isPlainObject(configInput)) {
    return NextResponse.json({ error: "config_json must be an object." }, { status: 400 });
  }

  let assetLinks: string[];
  try {
    assetLinks = parseAssetLinks(payload.asset_links);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid asset_links value." },
      { status: 400 },
    );
  }

  const { value: sanitizedConfig, strippedKeys } = sanitizeConfigNode(configInput);
  const safeConfig = isPlainObject(sanitizedConfig) ? sanitizedConfig : {};

  const supabase = getSupabaseServer();
  const { data: order, error: orderLookupError } = await supabase
    .from("orders")
    .select("order_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (orderLookupError) {
    return NextResponse.json(
      { error: `Unable to validate order: ${orderLookupError.message}` },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json({ error: "Unknown order_id." }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("onboarding_submissions").insert({
    order_id: orderId,
    config_json: safeConfig,
    asset_links: assetLinks,
  });

  if (insertError) {
    return NextResponse.json(
      { error: `Unable to submit onboarding details: ${insertError.message}` },
      { status: 500 },
    );
  }

  const warning =
    strippedKeys.length > 0
      ? `Sensitive keys removed from config_json: ${Array.from(new Set(strippedKeys)).join(", ")}.`
      : undefined;

  return NextResponse.json({ ok: true, ...(warning ? { warning } : {}) });
}
