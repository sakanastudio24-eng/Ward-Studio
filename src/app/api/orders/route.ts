import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

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

const RESEND_ENDPOINT = "https://api.resend.com/emails";
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

async function sendTemplatedEmail(
  resendApiKey: string,
  from: string,
  to: string[],
  templateId: string,
  subject: string,
  variables: Record<string, string>,
) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      template: {
        id: templateId,
        variables,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || response.statusText);
  }
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.ORDERS_OWNER_EMAIL;
  const ownerTemplateId = process.env.RESEND_ORDER_OWNER_TEMPLATE_ID;
  const buyerTemplateId = process.env.RESEND_ORDER_BUYER_TEMPLATE_ID;
  const fromEmail = process.env.ORDERS_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendApiKey || !ownerEmail || !ownerTemplateId || !buyerTemplateId) {
    return NextResponse.json(
      {
        error:
          "Server order email config is missing. Set RESEND_API_KEY, ORDERS_OWNER_EMAIL, RESEND_ORDER_OWNER_TEMPLATE_ID, and RESEND_ORDER_BUYER_TEMPLATE_ID.",
      },
      { status: 500 },
    );
  }

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
  const packageId = getString(payload.packageId);
  const readinessPath = getString(payload.readinessPath);
  const depositType = getString(payload.depositType);
  const generatedConfigJson = getString(payload.generatedConfigJson);
  const secretsNotice = getString(payload.secretsNotice);
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
  const safeConfigJson = JSON.stringify(safeConfig, null, 2);
  const sensitiveWarning =
    strippedKeys.length > 0
      ? `Sensitive fields were removed from safe config: ${strippedKeys.join(", ")}.`
      : "";

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

  const readinessChecks = payload.readinessChecks || {};
  const readinessSummary = `identity=${Boolean(readinessChecks.identity)}, photos=${Boolean(
    readinessChecks.photos,
  )}, bookingMethod=${Boolean(readinessChecks.bookingMethod)}`;

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

  try {
    await sendTemplatedEmail(
      resendApiKey,
      fromEmail,
      [ownerEmail],
      ownerTemplateId,
      `New DetailFlow Order ${orderId}`,
      {
        ORDER_ID: orderId,
        CUSTOMER_NAME: customerName,
        CUSTOMER_EMAIL: customerEmail,
        PACKAGE_LABEL: packageLabel,
        PACKAGE_ID: packageId,
        DEPOSIT_TYPE: depositType,
        READINESS_PATH: readinessPath,
        READINESS_CHECKS: readinessSummary,
        ADD_ONS: addOnSummaryText,
        ASSET_LINKS: assetLinksText,
        GENERATED_CONFIG_JSON: generatedConfigJson,
        SAFE_CONFIG_JSON: safeConfigJson,
        HANDOFF_SUMMARY: handoffSummary,
        SAFE_CONFIG_WARNING: sensitiveWarning || "No sensitive fields detected.",
        SECRETS_NOTICE: secretsNotice || "Secrets not included.",
        SUBMITTED_AT: submittedAt,
      },
    );

    await sendTemplatedEmail(
      resendApiKey,
      fromEmail,
      [customerEmail],
      buyerTemplateId,
      `Your DetailFlow submission ${orderId}`,
      {
        ORDER_ID: orderId,
        CUSTOMER_NAME: customerName,
        PACKAGE_LABEL: packageLabel,
        DEPOSIT_TYPE: depositType,
        ADD_ONS: addOnSummaryText,
        GENERATED_CONFIG_JSON: generatedConfigJson,
        HANDOFF_SUMMARY: handoffSummary,
        SAFE_CONFIG_WARNING: sensitiveWarning || "No sensitive fields detected.",
        SECRETS_NOTICE: secretsNotice || "Secrets not included.",
        SUBMITTED_AT: submittedAt,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Email provider rejected order submission: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId,
    ...(sensitiveWarning ? { warning: sensitiveWarning } : {}),
  });
}
