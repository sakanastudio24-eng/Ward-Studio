"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { getTooltipMessage } from "../HoverTooltip";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  type DetailflowAddonId,
  type DetailflowGeneralAddonId,
  type DetailflowPricingConfig,
  type DetailflowReadinessAddonId,
  type DetailflowTierId,
  computeAddonSubtotal,
  computeDepositToday,
  computeRemainingBalance,
  computeTotal,
} from "../../../lib/pricing";
import {
  type AddonConflictPair,
  type BookingMode,
  type ReadinessPath,
  getAddonAvailability,
  sanitizeAddonsForTier,
  validateAddonConflicts,
  validatePackageStep,
  validateReadinessStep,
  validateRequiredItems,
} from "../../../lib/rules";
import { AddonSelector } from "./AddonSelector";
import { PlanSelector } from "./PlanSelector";
import { PriceSummary } from "./PriceSummary";
import { ReadinessGate } from "./ReadinessGate";
import { SuccessDrawer } from "./SuccessDrawer";
import {
  type CheckoutInteractionState,
  type CheckoutPrimaryState,
  checkoutFlowReducer,
  initialCheckoutFlowContext,
} from "./flow";
import { track } from "../../../lib/analytics/client";
import type { AnalyticsEventName } from "../../../lib/analytics/types";
import { toast } from "sonner";
import {
  generateDetailflowConfigAndHandoff,
  type HandoffChecklist,
  type SafeConfigInput,
} from "../../../lib/config-generator/detailflow";

export type DetailflowStep = "package" | "readiness" | "payment";

export type DetailflowPackageId = DetailflowTierId;

export type DetailflowPackagePreset = {
  id: DetailflowTierId;
  label: string;
  description: string;
};

export type DetailflowGeneralAddOn = {
  id: DetailflowGeneralAddonId;
  title: string;
  bestFor: string;
  includes: string[];
};

export type DetailflowReadinessAddOn = {
  id: DetailflowReadinessAddonId;
  title: string;
  bestFor: string;
  includes: string[];
};

export type EndpointFieldSpec = {
  key: string;
  label: string;
};

export type CheckoutEndpointContract = {
  method: "GET" | "POST";
  path: string;
  label: string;
  responseFields: EndpointFieldSpec[];
};

export type DetailflowAddonConfig = {
  productKey: "detailflow";
  subtitle: string;
  defaultPackageId?: DetailflowTierId;
  packagePresets: DetailflowPackagePreset[];
  timelineEstimate: string;
  requiredItems: string[];
  booking: {
    externalLinkMessage: string;
    iframeMessage: string;
    iframeWarning: string;
    contactOnlyMessage: string;
    defaultExternalUrl?: string;
    defaultEmbedUrl?: string;
  };
  readinessChecklist: {
    identity: string;
    photos: string;
    bookingMethod: string;
  };
  readinessGate: {
    readyLabel: string;
    notReadyLabel: string;
    forcedConsultationMessage: string;
  };
  generalAddOns: DetailflowGeneralAddOn[];
  readinessAddOns: DetailflowReadinessAddOn[];
  conflictPairs?: AddonConflictPair[];
  compatibilityRules: {
    cannotCombine: string[];
    stronglyRecommended: string[];
  };
  refundSummary: string[];
  checkoutEndpoints: {
    create: CheckoutEndpointContract;
    verify: CheckoutEndpointContract;
  };
  strategyCallUrl?: string;
  secureUploadUrl?: string;
  confirmationEmail?: string;
  supportEmail?: string;
  pricing: DetailflowPricingConfig;
};

export type GeneratedDetailflowConfig = {
  PACKAGE: {
    tier: DetailflowTierId;
  };
  BOOKING: {
    mode: BookingMode;
    url?: string;
    embedUrl?: string;
  };
  ADDONS: {
    selected: DetailflowAddonId[];
  };
  PRICING: {
    total: number;
    depositToday: number;
    remainingBalance: number;
  };
};

export interface CheckoutDrawerProps {
  productName: string;
  config: DetailflowAddonConfig;
  triggerLabel?: string;
  setTooltipText?: (text: string) => void;
  onGenerateConfig?: (config: GeneratedDetailflowConfig) => void;
  onPrimaryStateChange?: (state: CheckoutPrimaryState) => void;
  onInteractionState?: (state: CheckoutInteractionState) => void;
}

type DetailflowFormState = {
  selectedPackageId: DetailflowTierId;
  selectedGeneralAddOnIds: DetailflowGeneralAddonId[];
  selectedReadinessAddOnIds: DetailflowReadinessAddonId[];
  customerName: string;
  customerEmail: string;
  bookingMode: BookingMode;
  bookingUrl: string;
  bookingEmbedUrl: string;
  readinessPath: ReadinessPath;
  readinessChecks: {
    identity: boolean;
    photos: boolean;
    bookingMethod: boolean;
  };
};

type CheckoutCreateResponse = {
  url: string;
  sessionId: string;
  orderId: string;
};

type CheckoutVerifyResponse = {
  paid: boolean;
  status?: string;
  error?: string;
  orderId?: string;
  sessionId?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Seeds a safe config object used by the post-purchase handoff form.
 */
function buildInitialSafeConfig(bookingMode: BookingMode): SafeConfigInput {
  return {
    business_name: "",
    contact_email: "",
    contact_phone: "",
    city_service_area: "",
    service_list_and_prices: "",
    hours: "",
    social_links: [],
    theme_choice: "",
    brand_colors_hex: [],
    booking_mode: bookingMode,
    booking_link: "",
    booking_embed_url: "",
    owner_notification_email: "",
    legal_terms_url: "",
    legal_privacy_url: "",
  };
}

/**
 * Builds form defaults for a selected tier while preserving user-entered fields.
 */
function buildDetailflowPresetState(
  config: DetailflowAddonConfig,
  packageId: DetailflowTierId,
  previous?: DetailflowFormState,
): DetailflowFormState {
  const preservedBookingUrl = previous?.bookingUrl || config.booking.defaultExternalUrl || "";
  const preservedEmbedUrl = previous?.bookingEmbedUrl || config.booking.defaultEmbedUrl || "";
  const hasEmbedCandidate = preservedEmbedUrl.trim().length > 0;

  const baseState: DetailflowFormState = {
    selectedPackageId: packageId,
    selectedGeneralAddOnIds: previous?.selectedGeneralAddOnIds || [],
    selectedReadinessAddOnIds: previous?.selectedReadinessAddOnIds || [],
    customerName: previous?.customerName || "",
    customerEmail: previous?.customerEmail || "",
    bookingMode: hasEmbedCandidate && packageId !== "starter" ? "iframe" : "external_link",
    bookingUrl: preservedBookingUrl,
    bookingEmbedUrl: preservedEmbedUrl,
    readinessPath: previous?.readinessPath || "ready_now",
    readinessChecks: previous?.readinessChecks || {
      identity: false,
      photos: false,
      bookingMethod: false,
    },
  };

  const sanitized = sanitizeAddonsForTier(packageId, [
    ...baseState.selectedGeneralAddOnIds,
    ...baseState.selectedReadinessAddOnIds,
  ]);

  return {
    ...baseState,
    selectedGeneralAddOnIds: baseState.selectedGeneralAddOnIds.filter((id) =>
      sanitized.selectedAddonIds.includes(id),
    ),
    selectedReadinessAddOnIds: baseState.selectedReadinessAddOnIds.filter((id) =>
      sanitized.selectedAddonIds.includes(id),
    ),
  };
}

/**
 * Converts current selections into user-facing summary lines for readiness review.
 */
function buildDetailflowSummary(
  config: DetailflowAddonConfig,
  form: DetailflowFormState,
): string[] {
  const selectedTier = config.packagePresets.find((preset) => preset.id === form.selectedPackageId);
  const generalLabelMap = new Map(config.generalAddOns.map((item) => [item.id, item.title]));
  const readinessLabelMap = new Map(config.readinessAddOns.map((item) => [item.id, item.title]));

  const summary: string[] = [];
  summary.push(`Tier: ${selectedTier?.label || form.selectedPackageId}`);
  summary.push(`Booking: ${form.bookingMode}`);

  if (form.selectedGeneralAddOnIds.length === 0) {
    summary.push("General add-ons: none");
  } else {
    for (const id of form.selectedGeneralAddOnIds) {
      const label = generalLabelMap.get(id) || id;
      if (id === "advanced_email_styling") {
        summary.push(`${label} (replaces basic email templates)`);
      } else {
        summary.push(label);
      }
    }
  }

  if (form.selectedReadinessAddOnIds.length === 0) {
    summary.push("Readiness add-ons: none");
  } else {
    for (const id of form.selectedReadinessAddOnIds) {
      const label = readinessLabelMap.get(id) || id;
      summary.push(label);
    }
  }

  return summary;
}

/**
 * Generates a temporary order id for the placeholder checkout flow.
 */
function generateOrderId(): string {
  const year = new Date().getFullYear();
  const sequence = `${Math.floor(Math.random() * 9000) + 1000}`;
  return `DF-${year}-${sequence}`;
}

/**
 * Main controller for the DetailFlow staged checkout:
 * package -> readiness -> payment, then post-purchase success drawer.
 */
export function CheckoutDrawer({
  productName,
  config,
  triggerLabel = "Purchase",
  setTooltipText,
  onGenerateConfig,
  onPrimaryStateChange,
  onInteractionState,
}: CheckoutDrawerProps) {
  const defaultPackageId = config.defaultPackageId || config.packagePresets[0]?.id || "starter";

  const [flow, dispatchFlow] = useReducer(checkoutFlowReducer, initialCheckoutFlowContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isAfterPurchaseOpen, setIsAfterPurchaseOpen] = useState(false);
  const [step, setStep] = useState<DetailflowStep>("package");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [readinessNotice, setReadinessNotice] = useState("");
  const [policyOverlay, setPolicyOverlay] = useState<"terms" | "refund" | null>(null);
  const [awaitingBookingReturn, setAwaitingBookingReturn] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDateLabel, setBookingDateLabel] = useState("{Date}");
  const [bookingTimeLabel, setBookingTimeLabel] = useState("{Time}");
  const [resendNotice, setResendNotice] = useState("");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [safeConfig, setSafeConfig] = useState<SafeConfigInput>(() => buildInitialSafeConfig("external_link"));
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const successViewedTrackedRef = useRef(false);
  const previousPrimaryStateRef = useRef<CheckoutPrimaryState>(initialCheckoutFlowContext.primaryState);

  const [form, setForm] = useState<DetailflowFormState>(() =>
    buildDetailflowPresetState(config, defaultPackageId),
  );

  const selectedTier = config.pricing.tiers[form.selectedPackageId];
  const readinessScore = [
    form.readinessChecks.identity,
    form.readinessChecks.photos,
    form.readinessChecks.bookingMethod,
  ].filter(Boolean).length;

  const selectedAddOnIds: DetailflowAddonId[] = [
    ...form.selectedGeneralAddOnIds,
    ...form.selectedReadinessAddOnIds,
  ];

  const addOnSubtotal = computeAddonSubtotal(config.pricing, selectedAddOnIds);
  const total = computeTotal(config.pricing, form.selectedPackageId, selectedAddOnIds);
  const depositToday = computeDepositToday(config.pricing, form.selectedPackageId, selectedAddOnIds);
  const remainingBalance = computeRemainingBalance(
    config.pricing,
    form.selectedPackageId,
    selectedAddOnIds,
  );

  const generatedConfig = useMemo<GeneratedDetailflowConfig>(
    () => ({
      PACKAGE: {
        tier: form.selectedPackageId,
      },
      BOOKING: {
        mode: form.bookingMode,
        ...(form.bookingMode === "external_link" ? { url: form.bookingUrl.trim() } : {}),
        ...(form.bookingMode === "iframe" ? { embedUrl: form.bookingEmbedUrl.trim() } : {}),
      },
      ADDONS: {
        selected: selectedAddOnIds,
      },
      PRICING: {
        total,
        depositToday,
        remainingBalance,
      },
    }),
    [
      depositToday,
      form.bookingEmbedUrl,
      form.bookingMode,
      form.bookingUrl,
      form.selectedPackageId,
      remainingBalance,
      selectedAddOnIds,
      total,
    ],
  );

  const summaryItems = useMemo(() => buildDetailflowSummary(config, form), [config, form]);
  const selectedTierLabel =
    config.packagePresets.find((preset) => preset.id === form.selectedPackageId)?.label ||
    form.selectedPackageId;
  const fallbackOrderId = `DF-${new Date().getFullYear()}-0000`;

  const selectedAddOnLabels = useMemo(() => {
    const labelMap = new Map<string, string>([
      ...config.generalAddOns.map((item) => [item.id, item.title] as const),
      ...config.readinessAddOns.map((item) => [item.id, item.title] as const),
    ]);
    return selectedAddOnIds.map((id) => labelMap.get(id) || id);
  }, [config.generalAddOns, config.readinessAddOns, selectedAddOnIds]);

  const configGeneratorOutput = useMemo(
    () =>
      generateDetailflowConfigAndHandoff({
        safe: safeConfig,
        selection: {
          tier_id: form.selectedPackageId,
          addon_ids: selectedAddOnIds,
          price_total: total,
          deposit_amount: depositToday,
          remaining_balance: remainingBalance,
          order_id: flow.orderId || undefined,
        },
      }),
    [depositToday, flow.orderId, form.selectedPackageId, remainingBalance, safeConfig, selectedAddOnIds, total],
  );
  const generatedConfigText = configGeneratorOutput.configSentence;
  const handoffChecklist: HandoffChecklist = configGeneratorOutput.handoffChecklist;

  const addonLabelMap = useMemo(
    () =>
      Object.fromEntries(
        [...config.generalAddOns, ...config.readinessAddOns].map((addon) => [addon.id, addon.title]),
      ) as Partial<Record<DetailflowAddonId, string>>,
    [config.generalAddOns, config.readinessAddOns],
  );

  const confirmationEmail = config.confirmationEmail || "customer@email.com";
  const supportEmail = config.supportEmail || "support@wardstudio.com";
  const secureUploadUrl = config.secureUploadUrl || "#";
  const prepCallUrl = config.strategyCallUrl || "https://cal.com/";

  const requiredItemsValidation = validateRequiredItems({
    readinessPath: form.readinessPath,
    readinessChecks: form.readinessChecks,
    readinessChecklist: config.readinessChecklist,
  });

  const conflictValidation = validateAddonConflicts({
    selectedAddonIds: selectedAddOnIds,
    conflictPairs: config.conflictPairs || [],
    labelMap: addonLabelMap,
  });

  const packagePresets = useMemo(
    () =>
      config.packagePresets.map((preset) => {
        const tier = config.pricing.tiers[preset.id];
        return {
          ...preset,
          price: tier.price,
          deposit: tier.deposit,
          final: tier.final,
        };
      }),
    [config.packagePresets, config.pricing.tiers],
  );

  const generalAddOnCards = useMemo(
    () =>
      config.generalAddOns.map((addOn) => {
        const availability = getAddonAvailability(form.selectedPackageId, addOn.id);
        return {
          ...addOn,
          price: config.pricing.addons[addOn.id],
          checked: form.selectedGeneralAddOnIds.includes(addOn.id),
          disabled: !availability.enabled,
          disabledReason: availability.reason,
        };
      }),
    [config.generalAddOns, config.pricing.addons, form.selectedGeneralAddOnIds, form.selectedPackageId],
  );

  const readinessAddOnCards = useMemo(
    () =>
      config.readinessAddOns.map((addOn) => {
        const availability = getAddonAvailability(form.selectedPackageId, addOn.id);
        return {
          ...addOn,
          price: config.pricing.addons[addOn.id],
          checked: form.selectedReadinessAddOnIds.includes(addOn.id),
          disabled: !availability.enabled,
          disabledReason: availability.reason,
        };
      }),
    [
      config.pricing.addons,
      config.readinessAddOns,
      form.selectedPackageId,
      form.selectedReadinessAddOnIds,
    ],
  );

  const transitionBusy =
    flow.primaryState === "checkout_started" ||
    flow.primaryState === "redirecting_to_stripe" ||
    flow.primaryState === "return_success_loading" ||
    flow.transitionLocked;

  const analyticsSharedProps = useMemo(
    () => ({
      product_id: "detailflow" as const,
      tier_id: form.selectedPackageId,
      addon_ids: selectedAddOnIds,
      price_total: total,
      deposit_amount: depositToday,
      order_id: flow.orderId || undefined,
      session_id: null,
    }),
    [depositToday, flow.orderId, form.selectedPackageId, selectedAddOnIds, total],
  );

  function trackCheckoutEvent(
    event: AnalyticsEventName,
    eventProps: Record<string, unknown> = {},
  ) {
    void track(event, {
      ...analyticsSharedProps,
      ...eventProps,
    });
  }

  useEffect(() => {
    onPrimaryStateChange?.(flow.primaryState);
  }, [flow.primaryState, onPrimaryStateChange]);

  useEffect(() => {
    if (!flow.lastInteraction) return;
    onInteractionState?.(flow.lastInteraction);
  }, [flow.lastInteraction, onInteractionState]);

  useEffect(() => {
    const previousState = previousPrimaryStateRef.current;
    if (previousState === flow.primaryState) return;

    if (flow.primaryState === "payment_confirmed") {
      trackCheckoutEvent("payment_confirmed");
    }

    if (flow.primaryState === "payment_failed" || flow.primaryState === "verification_error") {
      trackCheckoutEvent("error_shown", {
        error_type: flow.primaryState,
        error_message: flow.errorMessage,
      });
    }

    previousPrimaryStateRef.current = flow.primaryState;
  }, [flow.errorMessage, flow.primaryState, analyticsSharedProps]);

  useEffect(() => {
    if (!isAfterPurchaseOpen || successViewedTrackedRef.current) return;

    trackCheckoutEvent("success_viewed");
    successViewedTrackedRef.current = true;
  }, [isAfterPurchaseOpen, analyticsSharedProps]);

  useEffect(() => {
    if (!isAfterPurchaseOpen || !awaitingBookingReturn) return;

    const handleFocus = () => {
      const now = new Date();
      setBookingDateLabel(
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(now),
      );
      setBookingTimeLabel(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(now),
      );
      setBookingConfirmed(true);
      setAwaitingBookingReturn(false);
      dispatchFlow({ type: "MARK_INTERACTION", interaction: "booking_confirmed" });
      trackCheckoutEvent("booking_confirmed");
    };

    window.addEventListener("focus", handleFocus, { once: true });
    return () => window.removeEventListener("focus", handleFocus);
  }, [awaitingBookingReturn, isAfterPurchaseOpen]);

  function resetToDefaults() {
    setStep("package");
    setValidationErrors([]);
    setReadinessNotice("");
    setIsAfterPurchaseOpen(false);
    setPolicyOverlay(null);
    setAwaitingBookingReturn(false);
    setBookingConfirmed(false);
    setBookingDateLabel("{Date}");
    setBookingTimeLabel("{Time}");
    setResendNotice("");
    setActiveSessionId("");
    setSafeConfig(buildInitialSafeConfig("external_link"));
    setIsSubmittingConfig(false);
    setSubmitStatus("idle");
    setSubmitMessage("");
    successViewedTrackedRef.current = false;
    previousPrimaryStateRef.current = initialCheckoutFlowContext.primaryState;
    dispatchFlow({ type: "RESET" });
    setForm(buildDetailflowPresetState(config, defaultPackageId));
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      resetToDefaults();
      dispatchFlow({ type: "OPEN_DRAWER" });
      trackCheckoutEvent("checkout_opened");
      return;
    }
    setStep("package");
    dispatchFlow({ type: "RESET" });
  }

  function applyPackagePreset(packageId: DetailflowTierId) {
    setValidationErrors([]);
    setReadinessNotice("");
    if (packageId !== form.selectedPackageId) {
      trackCheckoutEvent("plan_selected", {
        tier_id: packageId,
      });
    }
    setForm((prev) => buildDetailflowPresetState(config, packageId, prev));
  }

  /**
   * Toggles a general add-on and emits analytics for pricing behavior.
   */
  function handleGeneralAddOnToggle(addOnId: DetailflowGeneralAddonId, checked: boolean) {
    const availability = getAddonAvailability(form.selectedPackageId, addOnId);
    if (!availability.enabled) return;
    const exists = form.selectedGeneralAddOnIds.includes(addOnId);
    if (checked === exists) return;

    const nextAddonIds = checked
      ? Array.from(new Set([...selectedAddOnIds, addOnId]))
      : selectedAddOnIds.filter((id) => id !== addOnId);
    trackCheckoutEvent("addon_toggled", {
      addon_id: addOnId,
      checked,
      addon_group: "general",
      addon_ids: nextAddonIds,
    });

    setForm((prev) => {
      const present = prev.selectedGeneralAddOnIds.includes(addOnId);
      if (checked && !present) {
        return {
          ...prev,
          selectedGeneralAddOnIds: [...prev.selectedGeneralAddOnIds, addOnId],
        };
      }
      if (!checked && present) {
        return {
          ...prev,
          selectedGeneralAddOnIds: prev.selectedGeneralAddOnIds.filter((id) => id !== addOnId),
        };
      }
      return prev;
    });
  }

  /**
   * Toggles readiness-focused add-ons used in the readiness step.
   */
  function handleReadinessAddOnToggle(addOnId: DetailflowReadinessAddonId, checked: boolean) {
    const availability = getAddonAvailability(form.selectedPackageId, addOnId);
    if (!availability.enabled) return;
    const exists = form.selectedReadinessAddOnIds.includes(addOnId);
    if (checked === exists) return;

    const nextAddonIds = checked
      ? Array.from(new Set([...selectedAddOnIds, addOnId]))
      : selectedAddOnIds.filter((id) => id !== addOnId);
    trackCheckoutEvent("addon_toggled", {
      addon_id: addOnId,
      checked,
      addon_group: "readiness",
      addon_ids: nextAddonIds,
    });

    setForm((prev) => {
      const present = prev.selectedReadinessAddOnIds.includes(addOnId);
      if (checked && !present) {
        return {
          ...prev,
          selectedReadinessAddOnIds: [...prev.selectedReadinessAddOnIds, addOnId],
        };
      }
      if (!checked && present) {
        return {
          ...prev,
          selectedReadinessAddOnIds: prev.selectedReadinessAddOnIds.filter((id) => id !== addOnId),
        };
      }
      return prev;
    });
  }

  /**
   * Validates package-step requirements before entering readiness.
   */
  function goToReadiness() {
    const packageValidation = validatePackageStep({
      bookingMode: form.bookingMode,
      bookingUrl: form.bookingUrl,
      bookingEmbedUrl: form.bookingEmbedUrl,
    });

    setValidationErrors(packageValidation.errors);
    setReadinessNotice("");

    if (!packageValidation.valid) return;
    setStep("readiness");
  }

  /**
   * Validates package + readiness constraints before entering payment.
   */
  function goToPayment() {
    const packageValidation = validatePackageStep({
      bookingMode: form.bookingMode,
      bookingUrl: form.bookingUrl,
      bookingEmbedUrl: form.bookingEmbedUrl,
    });

    const readinessValidation = validateReadinessStep({
      readinessPath: form.readinessPath,
      readinessChecks: form.readinessChecks,
      forcedConsultationMessage: config.readinessGate.forcedConsultationMessage,
    });

    const combinedErrors = [
      ...packageValidation.errors,
      ...readinessValidation.errors,
      ...requiredItemsValidation.errors,
      ...conflictValidation.errors,
    ];

    setValidationErrors(combinedErrors);
    setReadinessNotice(readinessValidation.notices[0] || "");

    if (combinedErrors.length > 0) return;

    setSafeConfig((prev) => ({
      ...prev,
      booking_mode: form.bookingMode,
      booking_link: form.bookingMode === "external_link" ? form.bookingUrl.trim() : prev.booking_link || "",
      booking_embed_url:
        form.bookingMode === "iframe" ? form.bookingEmbedUrl.trim() : prev.booking_embed_url || "",
    }));
    setStep("payment");
    onGenerateConfig?.(generatedConfig);
  }

  async function parseApiError(response: Response, fallbackMessage: string): Promise<string> {
    const fallback = fallbackMessage || "Request failed.";
    try {
      const data = (await response.json()) as { error?: string; message?: string };
      return data.error || data.message || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Requests a checkout session and order id from the configured create endpoint.
   */
  async function requestCheckoutSession(): Promise<CheckoutCreateResponse> {
    const response = await fetch(config.checkoutEndpoints.create.path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: "detailflow",
        tierId: form.selectedPackageId,
        addonIds: selectedAddOnIds,
        customerEmail: form.customerEmail.trim(),
      }),
    });

    if (!response.ok) {
      const message = await parseApiError(response, "Could not create checkout session.");
      throw new Error(message);
    }

    const data = (await response.json()) as Partial<CheckoutCreateResponse>;
    if (!data.sessionId || !data.orderId) {
      throw new Error("Checkout create response is missing sessionId or orderId.");
    }

    return {
      url: data.url || "",
      sessionId: data.sessionId,
      orderId: data.orderId,
    };
  }

  /**
   * Verifies checkout status from the configured verify endpoint.
   */
  async function requestCheckoutVerification(sessionId: string): Promise<CheckoutVerifyResponse> {
    const response = await fetch(
      `${config.checkoutEndpoints.verify.path}?session_id=${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      const message = await parseApiError(response, "Could not verify checkout session.");
      throw new Error(message);
    }

    const data = (await response.json()) as CheckoutVerifyResponse;
    return data;
  }

  /**
   * Starts the placeholder payment lifecycle and opens the success drawer.
   */
  async function handlePayDeposit() {
    if (transitionBusy) return;

    const paymentValidationErrors: string[] = [];
    if (!form.customerName.trim()) {
      paymentValidationErrors.push("Customer name is required before checkout.");
    }
    if (!form.customerEmail.trim()) {
      paymentValidationErrors.push("Customer email is required before checkout.");
    } else if (!EMAIL_REGEX.test(form.customerEmail.trim())) {
      paymentValidationErrors.push("Customer email must be a valid email address.");
    }

    if (paymentValidationErrors.length > 0) {
      setValidationErrors(paymentValidationErrors);
      return;
    }

    setValidationErrors([]);
    setResendNotice("");
    setBookingConfirmed(false);
    setAwaitingBookingReturn(false);
    setSafeConfig((prev) => ({
      ...prev,
      business_name: form.customerName.trim() || prev.business_name,
      contact_email: form.customerEmail.trim() || prev.contact_email,
    }));
    trackCheckoutEvent("checkout_clicked");
    dispatchFlow({ type: "START_CHECKOUT" });
    setIsOpen(false);
    setIsAfterPurchaseOpen(true);

    try {
      dispatchFlow({ type: "REDIRECT_TO_STRIPE" });
      const checkout = await requestCheckoutSession();
      setActiveSessionId(checkout.sessionId);
      trackCheckoutEvent("stripe_redirected", { stripe_url_present: Boolean(checkout.url) });

      dispatchFlow({ type: "START_RETURN_CONFIRM" });
      const verification = await requestCheckoutVerification(checkout.sessionId);

      if (!verification.paid) {
        dispatchFlow({
          type: "PAYMENT_FAILED",
          errorMessage: verification.error || "Payment was not captured. Please retry checkout.",
        });
        return;
      }

      dispatchFlow({
        type: "PAYMENT_CONFIRMED",
        orderId: verification.orderId || checkout.orderId || generateOrderId(),
      });
    } catch (error) {
      dispatchFlow({
        type: "VERIFICATION_ERROR",
        errorMessage: error instanceof Error ? error.message : "Verification service failed.",
      });
    }
  }

  /**
   * Retries verification from failure states without resetting form selections.
   */
  async function handleRetryVerification() {
    if (!activeSessionId) {
      dispatchFlow({
        type: "VERIFICATION_ERROR",
        errorMessage: "No checkout session found. Start purchase again.",
      });
      return;
    }

    dispatchFlow({ type: "RETRY_VERIFICATION" });
    try {
      const verification = await requestCheckoutVerification(activeSessionId);

      if (!verification.paid) {
        dispatchFlow({
          type: "PAYMENT_FAILED",
          errorMessage: verification.error || "Payment was not captured. Please retry checkout.",
        });
        return;
      }

      dispatchFlow({
        type: "PAYMENT_CONFIRMED",
        orderId: verification.orderId || generateOrderId(),
      });
    } catch (error) {
      dispatchFlow({
        type: "VERIFICATION_ERROR",
        errorMessage: error instanceof Error ? error.message : "Verification service failed.",
      });
    }
  }

  /**
   * Resets flow and reopens the initial purchase drawer for a fresh run.
   */
  function handleStartNewPurchase() {
    resetToDefaults();
    setIsAfterPurchaseOpen(false);
    setIsOpen(true);
    dispatchFlow({ type: "OPEN_DRAWER" });
  }

  /**
   * Submits post-purchase safe configuration details to the orders endpoint.
   */
  async function handleSubmitConfiguration() {
    setIsSubmittingConfig(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const fallbackName = safeConfig.business_name.trim() || "DetailFlow Customer";
      const fallbackEmail = safeConfig.contact_email.trim() || configGeneratorOutput.projectEmail;
      const drivePlaceholderUrl = "https://drive.google.com/drive/my-drive";

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: flow.orderId || fallbackOrderId,
          customer: {
            name: fallbackName,
            email: fallbackEmail,
          },
          packageId: form.selectedPackageId,
          packageLabel: selectedTierLabel,
          readinessPath: form.readinessPath,
          readinessChecks: form.readinessChecks,
          depositType: "deposit",
          addOnSummary: selectedAddOnLabels,
          generatedConfigJson: generatedConfigText,
          safeConfig: configGeneratorOutput.configObject,
          handoffChecklist,
          assetLinks: [drivePlaceholderUrl],
          secretsNotice:
            "Please don’t email API keys or passwords. We’ll never ask for them by email.",
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string; warning?: string } | null;
      if (!response.ok) {
        const message = data?.error || "Configuration submit failed.";
        setSubmitStatus("error");
        setSubmitMessage(message);
        toast.error(message);
        return;
      }

      const message = data?.warning
        ? `Configuration submitted. ${data.warning}`
        : "Configuration submitted successfully.";
      setSubmitStatus("success");
      setSubmitMessage(message);
      toast.success("Configuration submitted");
    } catch {
      setSubmitStatus("error");
      setSubmitMessage("Configuration submit failed. Please try again.");
      toast.error("Configuration submit failed");
    } finally {
      setIsSubmittingConfig(false);
    }
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            onMouseEnter={() => setTooltipText?.(getTooltipMessage(triggerLabel))}
            onMouseLeave={() => setTooltipText?.("")}
          >
            {triggerLabel}
          </Button>
        </DrawerTrigger>

        <DrawerContent className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl">{productName}</DrawerTitle>
            <DrawerDescription>{config.subtitle}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 overflow-y-auto px-4 pb-2">
            {step === "package" && (
              <>
                <PlanSelector
                  packagePresets={packagePresets}
                  selectedPackageId={form.selectedPackageId}
                  selectedTierFeatures={selectedTier.features}
                  onSelectPackage={applyPackagePreset}
                  bookingMode={form.bookingMode}
                  onBookingModeChange={(bookingMode) =>
                    setForm((prev) => ({
                      ...prev,
                      bookingMode,
                    }))
                  }
                  bookingUrl={form.bookingUrl}
                  bookingEmbedUrl={form.bookingEmbedUrl}
                  onBookingUrlChange={(bookingUrl) =>
                    setForm((prev) => ({
                      ...prev,
                      bookingUrl,
                    }))
                  }
                  onBookingEmbedUrlChange={(bookingEmbedUrl) =>
                    setForm((prev) => ({
                      ...prev,
                      bookingEmbedUrl,
                    }))
                  }
                  bookingMessages={config.booking}
                />

                <AddonSelector
                  title="General Functional Add-Ons"
                  addons={generalAddOnCards}
                  onToggle={(addOnId, checked) =>
                    handleGeneralAddOnToggle(addOnId as DetailflowGeneralAddonId, checked)
                  }
                  selectedNoteAddonId="advanced_email_styling"
                  selectedNote="Advanced Email Templates upgrades basic email styling."
                />
              </>
            )}

            {step === "readiness" && (
              <>
                <ReadinessGate
                  summaryItems={summaryItems}
                  timelineEstimate={config.timelineEstimate}
                  requiredItems={config.requiredItems}
                  readinessScore={readinessScore}
                  readinessChecks={form.readinessChecks}
                  readinessChecklist={config.readinessChecklist}
                  onReadinessCheckChange={(key, checked) =>
                    setForm((prev) => ({
                      ...prev,
                      readinessChecks: {
                        ...prev.readinessChecks,
                        [key]: checked,
                      },
                    }))
                  }
                  readinessPath={form.readinessPath}
                  onReadinessPathChange={(readinessPath) =>
                    setForm((prev) => ({
                      ...prev,
                      readinessPath,
                    }))
                  }
                  readinessPathLabels={{
                    readyLabel: config.readinessGate.readyLabel,
                    notReadyLabel: config.readinessGate.notReadyLabel,
                  }}
                  readinessNotice={readinessNotice}
                  compatibilityRules={config.compatibilityRules}
                  conflictErrors={conflictValidation.errors}
                  missingRequiredItems={requiredItemsValidation.missingItems}
                />

                <AddonSelector
                  title="Readiness Add-Ons"
                  addons={readinessAddOnCards}
                  onToggle={(addOnId, checked) =>
                    handleReadinessAddOnToggle(addOnId as DetailflowReadinessAddonId, checked)
                  }
                />
              </>
            )}

            {step === "payment" && (
              <>
                <PriceSummary
                  tierPrice={selectedTier.price}
                  addOnSubtotal={addOnSubtotal}
                  total={total}
                  depositToday={depositToday}
                  remainingBalance={remainingBalance}
                />

                <section className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Buyer Details
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Needed to generate order details and confirmation communication.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Name</Label>
                      <Input
                        id="customer-name"
                        value={form.customerName}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            customerName: event.target.value,
                          }))
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={form.customerEmail}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            customerEmail: event.target.value,
                          }))
                        }
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Stripe Checkout
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Continue to reserve your build slot and trigger the post-purchase handoff flow.
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button
                      className="bg-orange-500 text-white hover:bg-orange-600"
                      disabled={transitionBusy}
                      onClick={handlePayDeposit}
                    >
                      Pay deposit
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">Flow status: {flow.primaryState}</p>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Endpoint Contract (Review)
                  </h3>
                  <div className="space-y-4">
                    {[config.checkoutEndpoints.create, config.checkoutEndpoints.verify].map((endpoint) => (
                      <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-md border border-border p-3">
                        <p className="text-sm font-medium">{endpoint.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {endpoint.method} {endpoint.path}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Response fields
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {endpoint.responseFields.map((field) => (
                            <li key={`${endpoint.path}-${field.key}`}>
                              • <span className="font-mono text-[11px]">{field.key}</span>: {field.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Refund Policy Summary
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {config.refundSummary.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setPolicyOverlay("terms")}>
                      Terms & Agreement
                    </Button>
                    <Button variant="outline" onClick={() => setPolicyOverlay("refund")}>
                      Refund Policy
                    </Button>
                  </div>
                </section>
              </>
            )}

            {validationErrors.length > 0 && (
              <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <h3 className="mb-2 text-sm font-semibold text-destructive">
                  Resolve these before continuing
                </h3>
                <ul className="space-y-1 text-sm text-destructive">
                  {validationErrors.map((error) => (
                    <li key={error}>• {error}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <DrawerFooter>
            {step === "package" && (
              <>
                <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={goToReadiness}>
                  Continue
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </>
            )}

            {step === "readiness" && (
              <>
                <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={goToPayment}>
                  Continue
                </Button>
                <Button variant="outline" onClick={() => setStep("package")}>
                  Back
                </Button>
              </>
            )}

            {step === "payment" && (
              <>
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  disabled={transitionBusy}
                  onClick={handlePayDeposit}
                >
                  Pay deposit
                </Button>
                <Button variant="outline" disabled={transitionBusy} onClick={() => setStep("readiness")}>
                  Back
                </Button>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <SuccessDrawer
        open={isAfterPurchaseOpen}
        onOpenChange={setIsAfterPurchaseOpen}
        primaryState={flow.primaryState}
        errorMessage={flow.errorMessage}
        productName={productName}
        orderId={flow.orderId}
        fallbackOrderId={fallbackOrderId}
        selectedTierLabel={selectedTierLabel}
        selectedAddOnLabels={selectedAddOnLabels}
        depositToday={depositToday}
        remainingBalance={remainingBalance}
        confirmationEmail={confirmationEmail}
        supportEmail={supportEmail}
        secureUploadUrl={secureUploadUrl}
        generatedConfigText={generatedConfigText}
        resendNotice={resendNotice}
        bookingConfirmed={bookingConfirmed}
        bookingDateLabel={bookingDateLabel}
        bookingTimeLabel={bookingTimeLabel}
        onRetryVerification={handleRetryVerification}
        onStartNewPurchase={handleStartNewPurchase}
        onBookingClick={() => {
          const target = config.strategyCallUrl || `/products/success?orderId=${flow.orderId}`;
          dispatchFlow({ type: "MARK_INTERACTION", interaction: "booking_clicked" });
          trackCheckoutEvent("booking_clicked");
          setAwaitingBookingReturn(true);
          window.open(target, "_blank", "noopener,noreferrer");
        }}
        onResendClick={() => {
          setResendNotice("Confirmation resent (demo).");
          dispatchFlow({ type: "MARK_INTERACTION", interaction: "resend_clicked" });
          dispatchFlow({ type: "MARK_INTERACTION", interaction: "email_sent_shown" });
          trackCheckoutEvent("resend_email_clicked");
        }}
        onSupportClick={() => {
          dispatchFlow({ type: "MARK_INTERACTION", interaction: "support_clicked" });
        }}
        onConfigCopied={() => {
          dispatchFlow({ type: "MARK_INTERACTION", interaction: "copy_config_clicked" });
          trackCheckoutEvent("copy_config");
        }}
        onConfigCopyFailed={() => {
          trackCheckoutEvent("error_shown", {
            error_type: "copy_config_failed",
            error_message: "Copy configuration failed.",
          });
        }}
        safeConfig={safeConfig}
        onSafeConfigChange={setSafeConfig}
        handoffChecklist={handoffChecklist}
        onSubmitConfiguration={handleSubmitConfiguration}
        isSubmittingConfiguration={isSubmittingConfig}
        submitStatus={submitStatus}
        submitMessage={submitMessage}
        prepCallUrl={prepCallUrl}
      />

      <Dialog open={Boolean(policyOverlay)} onOpenChange={(open) => !open && setPolicyOverlay(null)}>
        <DialogContent>
          {policyOverlay === "terms" ? (
            <>
              <DialogHeader>
                <DialogTitle>Terms & Agreement</DialogTitle>
                <DialogDescription>
                  Template scope, responsibilities, payments, hosting, and liability terms.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Applies to all DetailFlow template engagements.</p>
                <a href="/terms#terms-agreement" className="text-orange-500 hover:text-orange-600">
                  Open full terms page
                </a>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Refund Policy</DialogTitle>
                <DialogDescription>
                  Consultation, deposit, hold fee, kickoff timing, and asset delay policy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Build deposits are refundable before kickoff and non-refundable after kickoff.</p>
                <a href="/terms#refund-policy" className="text-orange-500 hover:text-orange-600">
                  Open full refund policy
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
