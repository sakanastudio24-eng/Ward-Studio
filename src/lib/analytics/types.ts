export const ANALYTICS_EVENT_NAMES = [
  "checkout_opened",
  "plan_selected",
  "addon_toggled",
  "checkout_clicked",
  "stripe_redirected",
  "success_viewed",
  "payment_confirmed",
  "booking_clicked",
  "booking_confirmed",
  "copy_config",
  "resend_email_clicked",
  "error_shown",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AnalyticsSharedProps = {
  product_id: "detailflow";
  tier_id?: "starter" | "growth" | "pro_launch";
  addon_ids?: string[];
  price_total?: number;
  deposit_amount?: number;
  order_id?: string;
  session_id?: string | null;
  anonymous_id: string;
};

export type AnalyticsPayload = {
  event: AnalyticsEventName;
  props: AnalyticsSharedProps & Record<string, unknown>;
  occurred_at?: string;
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return ANALYTICS_EVENT_NAMES.includes(value as AnalyticsEventName);
}
