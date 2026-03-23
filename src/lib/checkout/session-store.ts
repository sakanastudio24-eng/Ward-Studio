import {
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
