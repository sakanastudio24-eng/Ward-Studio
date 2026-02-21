import type { BookingMode } from "../rules";
import type { DetailflowTierId } from "../pricing";

export type SafeConfigInput = {
  business_name: string;
  contact_email: string;
  contact_phone?: string;
  city_service_area?: string;
  service_list_and_prices: string;
  hours?: string;
  social_links?: string[];
  theme_choice?: string;
  brand_colors_hex?: string[];
  booking_mode: BookingMode;
  booking_link?: string;
  booking_embed_url?: string;
  owner_notification_email?: string;
  legal_terms_url?: string;
  legal_privacy_url?: string;
};

export type CheckoutSelectionInput = {
  tier_id: DetailflowTierId;
  addon_ids: string[];
  price_total: number;
  deposit_amount: number;
  remaining_balance: number;
  order_id?: string;
};

export type HandoffChecklist = {
  send_now: string[];
  upload_files: string[];
  during_call: string[];
  call_required: boolean;
  rules_text: string;
};

export type ConfigGeneratorOutput = {
  configJson: string;
  configObject: Record<string, unknown>;
  handoffChecklist: HandoffChecklist;
  configSentence: string;
  projectEmail: string;
};

/**
 * Trims and removes empty values from list-like fields.
 */
function normalizeList(values?: string[]): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => value.trim()).filter(Boolean);
}

/**
 * Normalizes the safe onboarding payload before config generation.
 */
function cleanSafeInput(input: SafeConfigInput): SafeConfigInput {
  return {
    ...input,
    business_name: input.business_name.trim(),
    contact_email: input.contact_email.trim(),
    contact_phone: input.contact_phone?.trim() || "",
    city_service_area: input.city_service_area?.trim() || "",
    service_list_and_prices: input.service_list_and_prices.trim(),
    hours: input.hours?.trim() || "",
    social_links: normalizeList(input.social_links),
    theme_choice: input.theme_choice?.trim() || "",
    brand_colors_hex: normalizeList(input.brand_colors_hex),
    booking_link: input.booking_link?.trim() || "",
    booking_embed_url: input.booking_embed_url?.trim() || "",
    owner_notification_email: input.owner_notification_email?.trim() || "",
    legal_terms_url: input.legal_terms_url?.trim() || "",
    legal_privacy_url: input.legal_privacy_url?.trim() || "",
  };
}

/**
 * Generates a slug for deterministic ids and generated email aliases.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Flattens rich text input into a sentence-safe single line.
 */
function flattenForSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function formatUsd(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function toSentenceList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function toLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Builds the project alias email for internal handoff tracking.
 */
function buildProjectEmail(businessName: string, orderId?: string): string {
  const businessSlug = slugify(businessName) || "detailflow";
  const orderSlug = slugify(orderId || "pending-order");
  return `${businessSlug}.${orderSlug}@projects.wardstudio.com`;
}

function getTierLabel(tierId: DetailflowTierId): string {
  if (tierId === "starter") return "Starter";
  if (tierId === "growth") return "Growth";
  return "Pro Launch";
}

/**
 * Builds next-step checklist content based on selected tier and add-ons.
 */
function buildHandoffChecklist(
  safe: SafeConfigInput,
  selection: CheckoutSelectionInput,
): HandoffChecklist {
  const hasBookingSetup = selection.addon_ids.includes("booking_setup_assistance");
  const hasHostingHelp = selection.addon_ids.includes("hosting_help");

  const callRequired =
    selection.tier_id === "pro_launch" ||
    hasBookingSetup ||
    hasHostingHelp ||
    safe.booking_mode === "iframe";

  const sendNow = [
    "Copy + submit your config (safe)",
    "Business + service details",
    "Booking preference and URL",
    "Legal links and owner notification email",
  ];

  const uploadFiles = [
    "Logo file (PNG/SVG)",
    "6-12 photos",
    "Brand guide PDF (optional)",
  ];

  const duringCall: string[] = [];

  if (safe.booking_mode === "iframe" || hasBookingSetup) {
    duringCall.push("Invite Ward to Cal.com team (if booking setup)");
  }

  if (hasHostingHelp) {
    duringCall.push("Invite Ward to Vercel project (if managed/deployment setup)");
  }

  if (selection.tier_id === "pro_launch") {
    duringCall.push("Stripe connect and webhook setup (if payments)");
  }

  const rulesText = callRequired
    ? [
        "Send the config now, then we’ll handle secure setup during your call.",
        "Copy + submit your config (safe)",
        "Upload logo/photos",
        "During the call we’ll do collaborator invites (no passwords)",
        "Please don’t email API keys or passwords. We’ll never ask for them by email.",
      ].join("\n")
    : [
        "You can send everything now.",
        "Copy + submit your config",
        "Upload your logo/photos",
        "You're done.",
      ].join("\n");

  return {
    send_now: sendNow,
    upload_files: uploadFiles,
    during_call: callRequired ? duringCall : [],
    call_required: callRequired,
    rules_text: rulesText,
  };
}

/**
 * Produces the safe config JSON payload, checklist, and copy-ready summary sentence.
 */
export function generateDetailflowConfigAndHandoff(input: {
  safe: SafeConfigInput;
  selection: CheckoutSelectionInput;
}): ConfigGeneratorOutput {
  const safe = cleanSafeInput(input.safe);
  const selection = {
    ...input.selection,
    addon_ids: normalizeList(input.selection.addon_ids),
  };

  const handoffChecklist = buildHandoffChecklist(safe, selection);
  const projectEmail = buildProjectEmail(safe.business_name, selection.order_id);

  const configObject: Record<string, unknown> = {
    project: {
      order_id: selection.order_id || "",
      email: projectEmail,
    },
    business: {
      name: safe.business_name,
      contact_email: safe.contact_email,
      contact_phone: safe.contact_phone,
      city_service_area: safe.city_service_area,
      hours: safe.hours,
      social_links: safe.social_links,
    },
    services: {
      service_list_and_prices: safe.service_list_and_prices,
    },
    branding: {
      theme_choice: safe.theme_choice,
      brand_colors_hex: safe.brand_colors_hex,
    },
    booking: {
      mode: safe.booking_mode,
      link: safe.booking_mode === "external_link" ? safe.booking_link : "",
      embed_url: safe.booking_mode === "iframe" ? safe.booking_embed_url : "",
    },
    legal: {
      terms_url: safe.legal_terms_url,
      privacy_url: safe.legal_privacy_url,
    },
    owner_notifications: {
      email: safe.owner_notification_email,
    },
    package: {
      tier_id: selection.tier_id,
      addon_ids: selection.addon_ids,
      price_total: selection.price_total,
      deposit_amount: selection.deposit_amount,
      remaining_balance: selection.remaining_balance,
      order_id: selection.order_id || "",
    },
    handoff: handoffChecklist,
  };

  const readableAddons = selection.addon_ids.map((id) => toLabel(id));
  const addonSummary =
    readableAddons.length > 0
      ? toSentenceList(readableAddons)
      : "no additional add-ons";

  const bookingDetail =
    safe.booking_mode === "external_link" && safe.booking_link
      ? `external booking link at ${safe.booking_link}`
      : safe.booking_mode === "iframe" && safe.booking_embed_url
        ? `booking embed URL ${safe.booking_embed_url}`
        : safe.booking_mode === "contact_only"
          ? "contact-only booking"
          : `${toLabel(safe.booking_mode)} booking`;

  const contextParts: string[] = [];
  if (safe.city_service_area) contextParts.push(`service area is ${safe.city_service_area}`);
  if (safe.hours) contextParts.push(`hours are ${flattenForSentence(safe.hours)}`);
  if (safe.theme_choice) contextParts.push(`theme preference is ${safe.theme_choice}`);
  if (safe.brand_colors_hex && safe.brand_colors_hex.length > 0) {
    contextParts.push(`brand colors are ${safe.brand_colors_hex.join(", ")}`);
  }

  const contactParts: string[] = [];
  if (safe.contact_email) contactParts.push(`contact email is ${safe.contact_email}`);
  if (safe.contact_phone) contactParts.push(`phone is ${safe.contact_phone}`);
  if (safe.owner_notification_email) {
    contactParts.push(`owner notifications go to ${safe.owner_notification_email}`);
  }

  const legalParts: string[] = [];
  if (safe.legal_terms_url) legalParts.push(`terms URL is ${safe.legal_terms_url}`);
  if (safe.legal_privacy_url) legalParts.push(`privacy URL is ${safe.legal_privacy_url}`);

  const configSentenceParts = [
    `Order ${selection.order_id || "pending"} for ${safe.business_name || "your business"} is scoped for the ${getTierLabel(selection.tier_id)} tier with ${addonSummary}.`,
    `Booking is set to ${bookingDetail}, and pricing is ${formatUsd(selection.price_total)} total with ${formatUsd(selection.deposit_amount)} paid today and ${formatUsd(selection.remaining_balance)} remaining.`,
    safe.service_list_and_prices
      ? `Services and pricing notes: ${flattenForSentence(safe.service_list_and_prices)}.`
      : "",
    contextParts.length > 0 ? `Project context: ${contextParts.join("; ")}.` : "",
    contactParts.length > 0 ? `Contact routing: ${contactParts.join("; ")}.` : "",
    safe.social_links && safe.social_links.length > 0
      ? `Social links provided: ${safe.social_links.join(" | ")}.`
      : "",
    legalParts.length > 0 ? `Legal references: ${legalParts.join("; ")}.` : "",
    `Project handoff email alias: ${projectEmail}.`,
  ].filter(Boolean);

  const configSentence = configSentenceParts.join(" ");

  return {
    configObject,
    configJson: JSON.stringify(configObject, null, 2),
    handoffChecklist,
    configSentence,
    projectEmail,
  };
}
