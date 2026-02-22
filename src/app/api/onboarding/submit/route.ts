import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../../lib/supabase-server";
import { enforceRateLimit, rateLimitedResponse } from "../../../../lib/rate-limit/server";
import {
  sendBuyerConfigSubmissionAck,
  sendInternalConfigSubmission,
} from "../../../../lib/email";
import { buildConfigSummaryFromSubmittedConfig } from "../../../../lib/config-generator/detailflow";

type OnboardingSubmitBody = {
  order_id?: unknown;
  order_uuid?: unknown;
  config_json?: unknown;
  asset_links?: unknown;
  customer_email?: unknown;
  customer_name?: unknown;
  send_buyer_copy?: unknown;
  generated_config_summary?: unknown;
};

const SENSITIVE_KEY_REGEX = /(api[_-]?key|token|password|secret|webhook)/i;
const MAX_CONFIG_BYTES = 120_000;
const MAX_ASSET_LINKS = 20;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIER_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro_launch: "Pro Launch",
};

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return defaultValue;
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

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => getString(item)).filter(Boolean);
}

function parseAssetLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const links = value.map((item) => getString(item)).filter(Boolean);
  if (links.length > MAX_ASSET_LINKS) {
    throw new Error(`Too many asset links. Maximum allowed is ${MAX_ASSET_LINKS}.`);
  }
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
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "onboarding-submit",
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimit.limited) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = (await request.json().catch(() => null)) as OnboardingSubmitBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderIdInput = getString(payload.order_id);
  const orderUuidInput = getString(payload.order_uuid);
  if (!orderIdInput && !orderUuidInput) {
    return NextResponse.json({ error: "Missing order_id or order_uuid." }, { status: 400 });
  }

  const configInput = payload.config_json ?? {};
  if (!isPlainObject(configInput)) {
    return NextResponse.json({ error: "config_json must be an object." }, { status: 400 });
  }

  const configBytes = Buffer.byteLength(JSON.stringify(configInput), "utf8");
  if (configBytes > MAX_CONFIG_BYTES) {
    return NextResponse.json(
      { error: `config_json is too large. Maximum size is ${MAX_CONFIG_BYTES} bytes.` },
      { status: 400 },
    );
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
  const orderLookup = supabase.from("orders").select("order_id, customer_email").limit(1);
  const { data: order, error: orderLookupError } = orderIdInput
    ? await orderLookup.eq("order_id", orderIdInput).maybeSingle()
    : await orderLookup.eq("id", orderUuidInput).maybeSingle();

  if (orderLookupError) {
    return NextResponse.json(
      { error: `Unable to validate order: ${orderLookupError.message}` },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json({ error: "Unknown order_id/order_uuid." }, { status: 404 });
  }

  const resolvedOrderId = getString(order.order_id);
  if (!resolvedOrderId) {
    return NextResponse.json({ error: "Resolved order is missing order_id." }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("onboarding_submissions").insert({
    order_id: resolvedOrderId,
    config_json: safeConfig,
    asset_links: assetLinks,
  });

  if (insertError) {
    console.error("Onboarding submit error:", insertError.message);
    return NextResponse.json(
      { error: `Unable to submit onboarding details: ${insertError.message}` },
      { status: 500 },
    );
  }

  const warning =
    strippedKeys.length > 0
      ? `Sensitive keys removed from config_json: ${Array.from(new Set(strippedKeys)).join(", ")}.`
      : undefined;
  const warningParts: string[] = [];
  if (warning) warningParts.push(warning);

  const configBusiness =
    safeConfig.business && typeof safeConfig.business === "object"
      ? (safeConfig.business as Record<string, unknown>)
      : {};
  const configPackage =
    safeConfig.package && typeof safeConfig.package === "object"
      ? (safeConfig.package as Record<string, unknown>)
      : {};
  const configHandoff =
    safeConfig.handoff && typeof safeConfig.handoff === "object"
      ? (safeConfig.handoff as Record<string, unknown>)
      : {};

  const customerName =
    getString(payload.customer_name) ||
    getString(configBusiness.name) ||
    "DetailFlow Customer";
  const customerEmail =
    getString(payload.customer_email) ||
    getString(configBusiness.contact_email) ||
    getString(order.customer_email) ||
    "pending@example.com";
  const tierId = getString(configPackage.tier_id);
  const addonIds = toStringList(configPackage.addon_ids);
  const packageLabel = TIER_LABELS[tierId] || (tierId ? tierId : "DetailFlow");
  const addOnSummaryText = addonIds.length > 0 ? addonIds.join(", ") : "None";
  const handoffSummary = getString(configHandoff.rules_text) || "Handoff checklist captured in config.";
  const assetLinksText = assetLinks.length > 0 ? assetLinks.join("\n") : "None provided";
  const submittedAt = new Date().toISOString();
  const safeConfigWarning = warning || "No sensitive fields detected.";
  const secretsNotice = "Do not send passwords or API keys by email.";
  const generatedConfigJson = JSON.stringify(safeConfig, null, 2);
  const generatedConfigSummary =
    getString(payload.generated_config_summary) || buildConfigSummaryFromSubmittedConfig(safeConfig);
  const buyerCopyRequested = getBoolean(payload.send_buyer_copy, true);
  const shouldSendBuyerAck = buyerCopyRequested;
  let internalSent = false;
  let buyerAckSent = false;

  try {
    await sendInternalConfigSubmission({
      orderId: resolvedOrderId,
      customerName,
      customerEmail,
      packageLabel,
      addOnSummaryText,
      generatedConfigSummary,
      generatedConfigJson,
      handoffSummary,
      assetLinksText,
      safeConfigWarning,
      secretsNotice,
      submittedAt,
    });
    internalSent = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown internal email error";
    console.error("Onboarding internal setup email error:", message);
    warningParts.push(`Setup saved, but internal email send failed: ${message}`);
  }

  if (shouldSendBuyerAck) {
    if (!EMAIL_REGEX.test(customerEmail)) {
      warningParts.push("Buyer copy not sent: customer email is missing or invalid.");
    } else {
      try {
      await sendBuyerConfigSubmissionAck({
        orderId: resolvedOrderId,
        customerName,
        customerEmail,
        packageLabel,
        addOnSummaryText,
        generatedConfigSummary,
        generatedConfigJson,
        handoffSummary,
        assetLinksText,
        safeConfigWarning,
        secretsNotice,
        submittedAt,
      });
        buyerAckSent = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown buyer email error";
        console.error("Onboarding buyer copy email error:", message);
        warningParts.push(`Buyer copy not sent: ${message}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    internalSent,
    buyerAckSent,
    buyerCopyRequested,
    customerEmail,
    ...(warningParts.length > 0 ? { warning: warningParts.join(" ") } : {}),
  });
}
