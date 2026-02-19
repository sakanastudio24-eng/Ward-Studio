import type {
  DetailflowAddonId,
  DetailflowTierId,
} from "./pricing";

export type BookingMode = "external_link" | "iframe" | "contact_only";
export type ReadinessPath = "ready_now" | "not_ready";

export type ReadinessChecks = {
  identity: boolean;
  photos: boolean;
  bookingMethod: boolean;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  notices: string[];
};

export type AddonAvailability = {
  enabled: boolean;
  reason?: string;
};

export type AddonConflictPair = readonly [DetailflowAddonId, DetailflowAddonId];

function buildResult(errors: string[] = [], notices: string[] = []): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    notices,
  };
}

export function validatePackageStep(input: {
  bookingMode: BookingMode;
  bookingUrl: string;
  bookingEmbedUrl: string;
}): ValidationResult {
  const errors: string[] = [];

  if (input.bookingMode === "external_link" && !input.bookingUrl.trim()) {
    errors.push("External booking mode requires a booking URL.");
  }

  if (input.bookingMode === "iframe" && !input.bookingEmbedUrl.trim()) {
    errors.push("Iframe booking mode requires an embed URL.");
  }

  return buildResult(errors);
}

export function validateReadinessStep(input: {
  readinessPath: ReadinessPath;
  readinessChecks: ReadinessChecks;
  forcedConsultationMessage: string;
}): ValidationResult {
  const errors: string[] = [];
  const notices: string[] = [];

  const readinessScore = [
    input.readinessChecks.identity,
    input.readinessChecks.photos,
    input.readinessChecks.bookingMethod,
  ].filter(Boolean).length;

  if (input.readinessPath === "ready_now" && readinessScore < 3) {
    errors.push("Complete all readiness checklist items before continuing on Ready now.");
    notices.push(input.forcedConsultationMessage);
  }

  return buildResult(errors, notices);
}

export function validatePaymentStep(input: {
  stripeCheckoutPassed: boolean;
}): ValidationResult {
  if (!input.stripeCheckoutPassed) {
    return buildResult(["Stripe checkout must be completed before finishing."]);
  }

  return buildResult();
}

export function getAddonAvailability(
  tierId: DetailflowTierId,
  addonId: DetailflowAddonId,
): AddonAvailability {
  if (
    addonId === "booking_setup_assistance" &&
    tierId === "starter"
  ) {
    return {
      enabled: false,
      reason: "Requires Growth or Pro Launch tier.",
    };
  }

  if (addonId === "analytics_deep_setup" && tierId === "starter") {
    return {
      enabled: false,
      reason: "Requires Growth or Pro Launch tier.",
    };
  }

  return { enabled: true };
}

export function sanitizeAddonsForTier(
  tierId: DetailflowTierId,
  selectedAddonIds: DetailflowAddonId[],
): {
  selectedAddonIds: DetailflowAddonId[];
  removedAddonIds: DetailflowAddonId[];
} {
  const kept: DetailflowAddonId[] = [];
  const removed: DetailflowAddonId[] = [];

  for (const addonId of selectedAddonIds) {
    const availability = getAddonAvailability(tierId, addonId);
    if (availability.enabled) {
      kept.push(addonId);
    } else {
      removed.push(addonId);
    }
  }

  return {
    selectedAddonIds: kept,
    removedAddonIds: removed,
  };
}

export function validateAddonConflicts(input: {
  selectedAddonIds: DetailflowAddonId[];
  conflictPairs: AddonConflictPair[];
  labelMap?: Partial<Record<DetailflowAddonId, string>>;
}): ValidationResult {
  const errors: string[] = [];
  const selected = new Set(input.selectedAddonIds);

  for (const [left, right] of input.conflictPairs) {
    if (!selected.has(left) || !selected.has(right)) continue;
    const leftLabel = input.labelMap?.[left] || left;
    const rightLabel = input.labelMap?.[right] || right;
    errors.push(`${leftLabel} cannot be combined with ${rightLabel}.`);
  }

  return buildResult(errors);
}

export function validateRequiredItems(input: {
  readinessPath: ReadinessPath;
  readinessChecks: ReadinessChecks;
  readinessChecklist: {
    identity: string;
    photos: string;
    bookingMethod: string;
  };
}): ValidationResult & { missingItems: string[] } {
  const missingItems: string[] = [];
  if (!input.readinessChecks.identity) missingItems.push(input.readinessChecklist.identity);
  if (!input.readinessChecks.photos) missingItems.push(input.readinessChecklist.photos);
  if (!input.readinessChecks.bookingMethod) missingItems.push(input.readinessChecklist.bookingMethod);

  const errors =
    input.readinessPath === "ready_now" && missingItems.length > 0
      ? ["Required readiness items are still missing."]
      : [];

  return {
    ...buildResult(errors),
    missingItems,
  };
}
