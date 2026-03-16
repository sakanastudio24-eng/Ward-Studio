import { randomUUID } from "node:crypto";
import {
  PRICING,
  computeDepositToday,
  computeRemainingBalance,
  computeTotal,
  type DetailflowAddonId,
  type DetailflowTierId,
} from "../pricing";

const DETAILFLOW_TIER_IDS: DetailflowTierId[] = ["starter", "growth", "pro_launch"];
const DETAILFLOW_ADDON_IDS: DetailflowAddonId[] = [
  "advanced_email_styling",
  "hosting_help",
  "analytics_deep_setup",
  "content_structuring",
  "brand_polish",
  "booking_setup_assistance",
  "photo_optimization",
  "strategy_call",
];

type CheckoutStatus = "paid" | "pending";

export type CheckoutSessionRecord = {
  sessionId: string;
  orderId: string;
  productId: "detailflow";
  tierId: DetailflowTierId;
  addonIds: DetailflowAddonId[];
  total: number;
  deposit: number;
  remaining: number;
  currency: "usd";
  customerEmail: string;
  status: CheckoutStatus;
  checkoutUrl: string;
  createdAt: string;
};

const checkoutSessionStore = new Map<string, CheckoutSessionRecord>();

/**
 * Narrow string input to a known DetailFlow tier id.
 */
export function isDetailflowTierId(value: string): value is DetailflowTierId {
  return DETAILFLOW_TIER_IDS.includes(value as DetailflowTierId);
}

/**
 * Narrow string input to a known DetailFlow add-on id.
 */
export function isDetailflowAddonId(value: string): value is DetailflowAddonId {
  return DETAILFLOW_ADDON_IDS.includes(value as DetailflowAddonId);
}

function buildOrderId(): string {
  const year = new Date().getFullYear();
  const sequence = `${Math.floor(Math.random() * 9000) + 1000}`;
  return `DF-${year}-${sequence}`;
}

function buildSessionId(): string {
  return `cs_test_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
}

/**
 * Creates and stores a checkout session record used by create/verify routes.
 */
export function createCheckoutSessionRecord(input: {
  origin: string;
  tierId: DetailflowTierId;
  addonIds: DetailflowAddonId[];
  customerEmail?: string;
  orderId?: string;
}): CheckoutSessionRecord {
  const sessionId = buildSessionId();
  const orderId = input.orderId?.trim() || buildOrderId();
  const total = computeTotal(PRICING, input.tierId, input.addonIds);
  const deposit = computeDepositToday(PRICING, input.tierId, input.addonIds);
  const remaining = computeRemainingBalance(PRICING, input.tierId, input.addonIds);
  const checkoutUrl = `${input.origin}/products/success?session_id=${encodeURIComponent(sessionId)}&celebrate=1`;

  const record: CheckoutSessionRecord = {
    sessionId,
    orderId,
    productId: "detailflow",
    tierId: input.tierId,
    addonIds: input.addonIds,
    total,
    deposit,
    remaining,
    currency: "usd",
    customerEmail: input.customerEmail?.trim() || "",
    // Placeholder behavior until real Stripe webhook/status wiring is added.
    status: "paid",
    checkoutUrl,
    createdAt: new Date().toISOString(),
  };

  checkoutSessionStore.set(sessionId, record);
  return record;
}

/**
 * Returns a checkout session previously created by the checkout create route.
 */
export function getCheckoutSessionRecord(sessionId: string): CheckoutSessionRecord | null {
  return checkoutSessionStore.get(sessionId) || null;
}
