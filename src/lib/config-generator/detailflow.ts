import type { BookingMode } from "../rules";
import type { DetailflowTierId } from "../pricing";
import { HANDOFF_CHECKLIST_EMAIL } from "../../config/email";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

function uniqueLines(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

const CALL_REQUIRED_ADDONS = new Set([
  "booking_setup_assistance",
  "hosting_help",
  "analytics_deep_setup",
  "strategy_call",
  "advanced_email_styling",
]);

/**
 * Builds next-step checklist content based on selected tier and add-ons.
 */
function buildHandoffChecklist(
  safe: SafeConfigInput,
  selection: CheckoutSelectionInput,
): HandoffChecklist {
  const addonSet = new Set(selection.addon_ids);
  const sendNow: string[] = [
    "Business + service details",
    "Booking preference and URL",
    "Legal links and owner notification email",
    `Email for now: ${HANDOFF_CHECKLIST_EMAIL}`,
  ];
  const uploadFiles: string[] = [
    "Logo file (PNG/SVG)",
    "6-12 photos",
  ];
  const duringCall: string[] = [];

  if (selection.tier_id === "starter") {
    sendNow.push("Starter launch is self-managed. Confirm who will own hosting after handoff.");
  }

  if (selection.tier_id === "growth") {
    sendNow.push("Provide booking provider details and timezone preferences.");
    duringCall.push("Confirm booking provider behavior and timezone-safe scheduling.");
  }

  if (selection.tier_id === "pro_launch") {
    sendNow.push("Provide domain + DNS access plan for launch support.");
    sendNow.push("Share analytics priorities for launch tracking.");
    uploadFiles.push("Brand guide PDF (optional)");
    duringCall.push("Kickoff deployment and domain connection walkthrough.");
  }

  if (safe.booking_mode === "iframe") {
    duringCall.push("Validate iframe permissions and define fallback booking link.");
  }

  if (addonSet.has("booking_setup_assistance")) {
    sendNow.push("Share booking edge-case rules (buffer time, service duration, blackout dates).");
    duringCall.push("Live booking setup assistance session.");
  }

  if (addonSet.has("hosting_help")) {
    sendNow.push("Share registrar + DNS provider details for domain routing.");
    duringCall.push("Domain DNS and Vercel environment review.");
  }

  if (addonSet.has("analytics_deep_setup")) {
    sendNow.push("Define conversion events and campaign attribution requirements.");
    duringCall.push("Analytics event map and conversion tracking setup.");
  }

  if (addonSet.has("advanced_email_styling")) {
    sendNow.push("Confirm brand voice and sender identity for styled email templates.");
    duringCall.push("Review branded email template rendering and sender alignment.");
  }

  if (addonSet.has("content_structuring")) {
    sendNow.push("Provide service messaging priorities and FAQ direction.");
  }

  if (addonSet.has("brand_polish")) {
    uploadFiles.push("Current logo source and existing brand references.");
  }

  if (addonSet.has("photo_optimization")) {
    uploadFiles.push("Original high-resolution photos for compression and hero formatting.");
  }

  if (addonSet.has("strategy_call")) {
    duringCall.push("Strategy agenda: goals, offer structure, and launch sequence.");
  }

  const callRequired =
    selection.tier_id === "pro_launch" ||
    safe.booking_mode === "iframe" ||
    selection.addon_ids.some((addonId) => CALL_REQUIRED_ADDONS.has(addonId)) ||
    duringCall.length > 0;

  const rulesText = callRequired
    ? [
        "Send setup email now, then we will complete secure setup during your call.",
        "Checklist adapts to your selected package and add-ons.",
        "Do not email API keys or passwords. We will handle secrets only in live setup.",
      ].join("\n")
    : [
        "Send setup email now and upload the requested assets.",
        "Checklist adapts to your selected package and add-ons.",
        "Do not email API keys or passwords.",
      ].join("\n");

  return {
    send_now: uniqueLines(sendNow),
    upload_files: uniqueLines(uploadFiles),
    during_call: callRequired ? uniqueLines(duringCall) : [],
    call_required: callRequired,
    rules_text: rulesText,
  };
}

/**
 * Builds a connected configuration summary from a submitted config object.
 */
export function buildConfigSummaryFromSubmittedConfig(config: Record<string, unknown>): string {
  const project = isRecord(config.project) ? config.project : {};
  const business = isRecord(config.business) ? config.business : {};
  const packageSection = isRecord(config.package) ? config.package : {};
  const booking = isRecord(config.booking) ? config.booking : {};

  const orderId = asString(project.order_id) || asString(packageSection.order_id) || "pending";
  const businessName = asString(business.name) || "your business";
  const tierId = asString(packageSection.tier_id) as DetailflowTierId;
  const tierLabel = tierId === "starter" || tierId === "growth" || tierId === "pro_launch"
    ? getTierLabel(tierId)
    : "DetailFlow";
  const addonIds = asStringList(packageSection.addon_ids);
  const addonLabels = addonIds.map((addonId) => toLabel(addonId));
  const addOnSummary = addonLabels.length > 0 ? toSentenceList(addonLabels) : "no additional add-ons";
  const bookingMode = asString(booking.mode) || "contact_only";
  const bookingLink = asString(booking.link);
  const bookingEmbedUrl = asString(booking.embed_url);
  const total = asNumber(packageSection.price_total);
  const deposit = asNumber(packageSection.deposit_amount);
  const remaining = asNumber(packageSection.remaining_balance);

  const bookingSummary =
    bookingMode === "external_link" && bookingLink
      ? `external booking link at ${bookingLink}`
      : bookingMode === "iframe" && bookingEmbedUrl
        ? `booking embed URL ${bookingEmbedUrl}`
        : bookingMode === "contact_only"
          ? "contact-only booking"
          : `${toLabel(bookingMode)} booking`;

  const parts = [
    `Order ${orderId} for ${businessName} is scoped for the ${tierLabel} tier with ${addOnSummary}.`,
    `Booking is set to ${bookingSummary}.`,
    `Pricing is ${formatUsd(total)} total, ${formatUsd(deposit)} deposit, and ${formatUsd(remaining)} remaining.`,
  ];

  return parts.join(" ");
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
