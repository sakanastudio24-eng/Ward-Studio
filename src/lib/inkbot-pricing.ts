export type InkbotTierId = "base";

export type InkbotAddonId =
  | "welcome_message"
  | "auto_role_assign"
  | "digest_schedule"
  | "anti_spam_cooldown"
  | "moderation_logging"
  | "ward-managed";

export type InkbotPricingConfig = {
  tier: {
    id: InkbotTierId;
    label: string;
    price: number;
  };
  addons: Record<InkbotAddonId, number>;
};

export const INKBOT_PRICING: InkbotPricingConfig = {
  tier: {
    id: "base",
    label: "InkBot Product",
    price: 300,
  },
  addons: {
    welcome_message: 25,
    auto_role_assign: 40,
    digest_schedule: 35,
    anti_spam_cooldown: 30,
    moderation_logging: 45,
    "ward-managed": 250,
  },
};

/**
 * Returns true when the supplied id is a supported InkBot add-on id.
 */
export function isInkbotAddonId(value: string): value is InkbotAddonId {
  return value in INKBOT_PRICING.addons;
}

/**
 * Returns true when the supplied id matches the current InkBot tier id.
 */
export function isInkbotTierId(value: string): value is InkbotTierId {
  return value === INKBOT_PRICING.tier.id;
}

/**
 * Computes total amount for InkBot order: base package + selected add-ons.
 */
export function computeInkbotTotal(addonIds: InkbotAddonId[]): number {
  return addonIds.reduce((sum, addonId) => sum + INKBOT_PRICING.addons[addonId], INKBOT_PRICING.tier.price);
}
