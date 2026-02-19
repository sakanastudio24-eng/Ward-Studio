export type DetailflowTierId = "starter" | "growth" | "pro_launch";

export type DetailflowGeneralAddonId =
  | "advanced_email_styling"
  | "hosting_help"
  | "analytics_deep_setup";

export type DetailflowReadinessAddonId =
  | "content_structuring"
  | "brand_polish"
  | "booking_setup_assistance"
  | "photo_optimization"
  | "strategy_call";

export type DetailflowAddonId = DetailflowGeneralAddonId | DetailflowReadinessAddonId;

export type DetailflowTierPricing = {
  price: number;
  deposit: number;
  final: number;
  features: string[];
};

export type DetailflowPricingConfig = {
  tiers: Record<DetailflowTierId, DetailflowTierPricing>;
  addons: Record<DetailflowAddonId, number>;
  rules: {
    conflicts: {
      advanced_email_replaces_basic: boolean;
    };
  };
};

export const PRICING: DetailflowPricingConfig = {
  tiers: {
    starter: {
      price: 249,
      deposit: 125,
      final: 124,
      features: [
        "Template customization",
        "Color scheme",
        "Services + pricing config",
        "Contact form",
        "Basic email confirmation",
        "Self-managed hosting",
        "1 revision round",
      ],
    },
    growth: {
      price: 549,
      deposit: 275,
      final: 274,
      features: [
        "Everything in Starter",
        "Booking integration (Cal or form-based)",
        "Customer + owner emails",
        "Basic SEO setup",
        "2 revision rounds",
      ],
    },
    pro_launch: {
      price: 899,
      deposit: 450,
      final: 449,
      features: [
        "Everything in Growth",
        "Deposit collection setup (optional)",
        "Hosting guidance",
        "Domain connection help",
        "Analytics setup",
        "30-day launch support",
      ],
    },
  },
  addons: {
    advanced_email_styling: 120,
    hosting_help: 90,
    analytics_deep_setup: 100,
    content_structuring: 120,
    brand_polish: 150,
    booking_setup_assistance: 100,
    photo_optimization: 80,
    strategy_call: 0,
  },
  rules: {
    conflicts: {
      advanced_email_replaces_basic: true,
    },
  },
};

/**
 * Sums all selected add-ons for the active DetailFlow order.
 */
export function computeAddonSubtotal(
  pricing: DetailflowPricingConfig,
  selectedAddons: DetailflowAddonId[],
): number {
  return selectedAddons.reduce((sum, addonId) => sum + (pricing.addons[addonId] || 0), 0);
}

/**
 * Computes the full order total using tier base price plus selected add-ons.
 */
export function computeTotal(
  pricing: DetailflowPricingConfig,
  tierId: DetailflowTierId,
  selectedAddons: DetailflowAddonId[],
): number {
  return pricing.tiers[tierId].price + computeAddonSubtotal(pricing, selectedAddons);
}

/**
 * Calculates the amount due today using base tier deposit plus 50% of add-ons.
 */
export function computeDepositToday(
  pricing: DetailflowPricingConfig,
  tierId: DetailflowTierId,
  selectedAddons: DetailflowAddonId[],
): number {
  const addonSubtotal = computeAddonSubtotal(pricing, selectedAddons);
  return pricing.tiers[tierId].deposit + addonSubtotal * 0.5;
}

/**
 * Calculates the remaining balance after today's deposit is paid.
 */
export function computeRemainingBalance(
  pricing: DetailflowPricingConfig,
  tierId: DetailflowTierId,
  selectedAddons: DetailflowAddonId[],
): number {
  return computeTotal(pricing, tierId, selectedAddons) - computeDepositToday(pricing, tierId, selectedAddons);
}
