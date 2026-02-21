import "server-only";
import {
  isDetailflowAddonId,
  isDetailflowTierId,
} from "../checkout/session-store";
import type { DetailflowAddonId, DetailflowTierId } from "../pricing";
import { getStripeServer } from "./server";

type StripeSessionApiResponse = {
  id?: string;
  status?: string;
  payment_status?: string;
  currency?: string;
  amount_total?: number;
  customer_email?: string;
  customer_details?: {
    email?: string | null;
  } | null;
  customer?: string | null;
  payment_intent?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
  [key: string]: unknown;
};

export type StripeCheckoutSession = {
  id: string;
  status: string;
  paymentStatus: string;
  amountTotalCents: number;
  currency: string;
  customerEmail: string;
  customerId: string;
  paymentIntentId: string;
  orderUuid: string;
  orderId: string;
  tierId: DetailflowTierId | "";
  addonIds: DetailflowAddonId[];
  metadata: Record<string, string>;
};

export type StripeLookupResult =
  | {
      ok: true;
      session: StripeCheckoutSession;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, rawValue]) => [key, getString(rawValue)] as const)
    .filter(([, metadataValue]) => metadataValue.length > 0);

  return Object.fromEntries(entries);
}

function parseAddonIds(rawValue: string): DetailflowAddonId[] {
  if (!rawValue) return [];

  const maybeJson = rawValue.trim();
  if (maybeJson.startsWith("[") && maybeJson.endsWith("]")) {
    try {
      const parsed = JSON.parse(maybeJson) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => getString(item))
          .filter((item): item is DetailflowAddonId => isDetailflowAddonId(item));
      }
    } catch {
      // Fallback to CSV parsing below.
    }
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is DetailflowAddonId => isDetailflowAddonId(item));
}

function getTierFromMetadata(metadata: Record<string, string>): DetailflowTierId | "" {
  const candidates = [metadata.tierId, metadata.tier_id];
  for (const candidate of candidates) {
    if (candidate && isDetailflowTierId(candidate)) {
      return candidate;
    }
  }
  return "";
}

function getAddonIdsFromMetadata(metadata: Record<string, string>): DetailflowAddonId[] {
  const candidates = [metadata.addonIds, metadata.addon_ids];
  for (const candidate of candidates) {
    const parsed = parseAddonIds(candidate || "");
    if (parsed.length > 0) {
      return parsed;
    }
  }
  return [];
}

function getOrderIdFromMetadata(metadata: Record<string, string>, clientReferenceId: string): string {
  return metadata.orderId || metadata.order_id || clientReferenceId || "";
}

function getOrderUuidFromMetadata(metadata: Record<string, string>): string {
  return metadata.order_uuid || metadata.orderUuid || "";
}

export function isStripeSessionId(sessionId: string): boolean {
  return /^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId.trim());
}

export function hasStripeSecretKey(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/**
 * Retrieves and normalizes a Stripe Checkout Session for server-side verification.
 */
export async function retrieveStripeCheckoutSession(sessionId: string): Promise<StripeLookupResult> {
  if (!hasStripeSecretKey()) {
    return {
      ok: false,
      status: 503,
      error: "STRIPE_SECRET_KEY is not configured.",
    };
  }

  const targetSessionId = sessionId.trim();
  if (!targetSessionId) {
    return {
      ok: false,
      status: 400,
      error: "Missing session id.",
    };
  }

  try {
    const stripe = getStripeServer();
    const payload = (await stripe.checkout.sessions.retrieve(
      targetSessionId,
    )) as unknown as StripeSessionApiResponse;

    const metadata = toMetadata(payload.metadata);
    const clientReferenceId = getString(payload.client_reference_id);
    const customerEmail =
      getString(payload.customer_details?.email) || getString(payload.customer_email);

    return {
      ok: true,
      session: {
        id: getString(payload.id) || targetSessionId,
        status: getString(payload.status) || "unknown",
        paymentStatus: getString(payload.payment_status) || "unpaid",
        amountTotalCents: typeof payload.amount_total === "number" ? payload.amount_total : 0,
        currency: getString(payload.currency) || "usd",
        customerEmail,
        customerId: getString(payload.customer),
        paymentIntentId: getString(payload.payment_intent),
        orderUuid: getOrderUuidFromMetadata(metadata),
        orderId: getOrderIdFromMetadata(metadata, clientReferenceId),
        tierId: getTierFromMetadata(metadata),
        addonIds: getAddonIdsFromMetadata(metadata),
        metadata,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe session lookup failed.";
    const status =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 500;

    return {
      ok: false,
      status,
      error: message,
    };
  }
}
