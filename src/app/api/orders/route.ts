import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  sendBuyerConfigSubmissionAck,
  sendInternalConfigSubmission,
} from "../../../../lib/email";

interface OrderRequestBody {
  orderId?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  packageId?: string;
  packageLabel?: string;
  readinessPath?: string;
  readinessChecks?: {
    identity?: boolean;
    photos?: boolean;
    bookingMethod?: boolean;
  };
  depositType?: string;
  addOnSummary?: string[];
  generatedConfig?: unknown;
  generatedConfigJson?: string;
  assetLinks?: string[];
  secretsNotice?: string;
  safeConfig?: Record<string, unknown>;
  handoffChecklist?: {
    send_now?: string[];
    upload_files?: string[];
    during_call?: string[];
    call_required?: boolean;
    rules_text?: string;
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENSITIVE_KEY_REGEX = /(api[_-]?key|token|password|secret|webhook)/i;

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => getString(item))
    .filter(Boolean);
}

function sanitizeSafeConfig(input: unknown): {
  safeConfig: Record<string, unknown>;
  strippedKeys: string[];
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      safeConfig: {},
      strippedKeys: [],
    };
  }

  const strippedKeys: string[] = [];
  const safeConfig: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      strippedKeys.push(key);
      continue;
    }
    safeConfig[key] = value;
  }

  return {
    safeConfig,
    strippedKeys,
  };
}

/**
 * Receives post-purchase configuration submission and notifies internal owner inbox.
 * Buyer acknowledgement is optional and controlled by ORDERS_SEND_BUYER_ACK=true.
 */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as OrderRequestBody | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderId = getString(payload.orderId) || randomUUID();
  const { safeConfig, strippedKeys } = sanitizeSafeConfig(payload.safeConfig);
  const safeBusinessName = getString(safeConfig.business_name);
  const safeContactEmail = getString(safeConfig.contact_email);
  const customerName = getString(payload.customer?.name) || safeBusinessName || "DetailFlow Customer";
  const customerEmail = getString(payload.customer?.email) || safeContactEmail || "pending@example.com";
  const packageLabel = getString(payload.packageLabel);
  const generatedConfigJson = getString(payload.generatedConfigJson);
  const secretsNotice = getString(payload.secretsNotice) || "Secrets not included.";
  const addOnSummary = toStringList(payload.addOnSummary);
  const assetLinks = toStringList(payload.assetLinks);
  const handoffChecklist =
    payload.handoffChecklist && typeof payload.handoffChecklist === "object"
      ? payload.handoffChecklist
      : {};
  const handoffSendNow = toStringList(handoffChecklist.send_now);
  const handoffUpload = toStringList(handoffChecklist.upload_files);
  const handoffCall = toStringList(handoffChecklist.during_call);
  const handoffRulesText = getString(handoffChecklist.rules_text);
  const sensitiveWarning =
    strippedKeys.length > 0
      ? `Sensitive fields were removed from safe config: ${strippedKeys.join(", ")}.`
      : "No sensitive fields detected.";

  if (!customerName || !customerEmail || !packageLabel || !generatedConfigJson) {
    return NextResponse.json(
      {
        error: "Missing required order fields: customer name, customer email, package, config.",
      },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(customerEmail)) {
    return NextResponse.json({ error: "Please provide a valid customer email." }, { status: 400 });
  }

  const invalidAssetLink = assetLinks.find((link) => !isUrl(link));
  if (invalidAssetLink) {
    return NextResponse.json(
      {
        error: "Asset links must be valid URLs.",
      },
      { status: 400 },
    );
  }

  const addOnSummaryText = addOnSummary.length > 0 ? addOnSummary.join(", ") : "None";
  const assetLinksText = assetLinks.length > 0 ? assetLinks.join("\n") : "None provided";
  const handoffSummary = [
    `Send now: ${handoffSendNow.length > 0 ? handoffSendNow.join(", ") : "None"}`,
    `Upload: ${handoffUpload.length > 0 ? handoffUpload.join(", ") : "None"}`,
    `During call: ${handoffCall.length > 0 ? handoffCall.join(", ") : "None"}`,
    handoffRulesText ? `Rules: ${handoffRulesText}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const submittedAt = new Date().toISOString();
  const buyerAckEnabled = process.env.ORDERS_SEND_BUYER_ACK === "true";
  let buyerAckSent = false;

  try {
    await sendInternalConfigSubmission({
      orderId,
      customerName,
      customerEmail,
      packageLabel,
      addOnSummaryText,
      generatedConfigJson,
      handoffSummary,
      assetLinksText,
      safeConfigWarning: sensitiveWarning,
      secretsNotice,
      submittedAt,
    });

    if (buyerAckEnabled) {
      await sendBuyerConfigSubmissionAck({
        orderId,
        customerName,
        customerEmail,
        packageLabel,
        addOnSummaryText,
        generatedConfigJson,
        handoffSummary,
        assetLinksText,
        safeConfigWarning: sensitiveWarning,
        secretsNotice,
        submittedAt,
      });
      buyerAckSent = true;
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: `Email provider rejected config submission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId,
    buyerAckSent,
    warning: sensitiveWarning,
  });
}
