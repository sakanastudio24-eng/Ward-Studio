"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { launchConfetti } from "../../../lib/confetti";
import { CAL_LINKS } from "../../../config/cal";
import { DEFAULT_SERVICE_EMAIL, DEFAULT_SUPPORT_EMAIL } from "../../../config/email";
import {
  generateDetailflowConfigAndHandoff,
  type SafeConfigInput,
} from "../../../lib/config-generator/detailflow";
import type { DetailflowTierId } from "../../../lib/pricing";
import { PostPurchaseForm } from "../../components/products/PostPurchaseForm";
import type { CheckoutPrimaryState } from "../../components/products/flow";

type VerifyStatus = "checking" | "paid" | "failed";

type VerifyResponse = {
  paid: boolean;
  orderUuid?: string;
  orderId?: string;
  tierId?: string;
  addonIds?: string[];
  deposit?: number;
  remaining?: number;
  customerEmail?: string;
  error?: string;
};

const TIER_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  pro_launch: "Pro Launch",
};

const ADDON_LABELS: Record<string, string> = {
  booking_system_integration: "Booking System Integration",
  deposit_payment_collection: "Deposit / Payment Collection",
  advanced_email_styling: "Advanced Email Templates",
  analytics_setup: "Analytics Setup",
  hosting_assistance: "Hosting Assistance",
  performance_optimization: "Performance Optimization",
  content_structuring: "Content Structuring",
  brand_polish: "Brand Polish",
  photo_optimization: "Photo Optimization",
  booking_readiness_setup: "Booking Readiness Setup",
  launch_clarity_consultation: "Launch Clarity Consultation",
  booking_setup_assistance: "Booking Setup Assistance",
  hosting_help: "Hosting Help",
  analytics_deep_setup: "Analytics Deep Setup",
  strategy_call: "Free 20-Min Strategy Call",
};

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeTierId(value: string): DetailflowTierId {
  if (value === "starter" || value === "growth" || value === "pro_launch") {
    return value;
  }
  return "starter";
}

function buildInitialSafeConfig(bookingMode: SafeConfigInput["booking_mode"]): SafeConfigInput {
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

export default function SuccessClient() {
  const [status, setStatus] = useState<VerifyStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationNonce, setVerificationNonce] = useState(0);
  const [resendNotice, setResendNotice] = useState("");
  const [isSubmittingConfiguration, setIsSubmittingConfiguration] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [orderUuid, setOrderUuid] = useState("");
  const [orderId, setOrderId] = useState("");
  const [tierId, setTierId] = useState<DetailflowTierId>("starter");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [deposit, setDeposit] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [customerEmail, setCustomerEmail] = useState(DEFAULT_SERVICE_EMAIL);

  const search = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const shouldCelebrate = search.get("celebrate") === "1";
  const sessionId = search.get("session_id") || "";
  const fallbackOrderId = search.get("orderId") || `DF-${new Date().getFullYear()}-0000`;
  const fallbackOrderUuid = search.get("orderUuid") || "";
  const queryName = (search.get("name") || "").trim();
  const queryEmail = (search.get("email") || "").trim();
  const bookingConfirmed =
    search.get("booking_confirmed") === "1" || (search.get("booking") || "").toLowerCase() === "confirmed";
  const bookingDateLabel = search.get("booking_date") || "{Date}";
  const bookingTimeLabel = search.get("booking_time") || "{Time}";

  const [safeConfig, setSafeConfig] = useState<SafeConfigInput>(() => {
    const next = buildInitialSafeConfig("external_link");
    if (queryName) next.business_name = queryName;
    if (queryEmail) next.contact_email = queryEmail;
    return next;
  });

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!sessionId) {
        setStatus("failed");
        setErrorMessage("Missing payment session reference.");
        return;
      }

      setStatus("checking");
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,
          { method: "GET" },
        );

        const data = (await response.json().catch(() => null)) as VerifyResponse | null;

        if (cancelled) return;

        if (!response.ok || !data?.paid) {
          setStatus("failed");
          setErrorMessage(data?.error || "Unable to verify payment.");
          return;
        }

        const nextOrderId = (data.orderId || "").trim();
        const nextOrderUuid = (data.orderUuid || "").trim();
        const nextTierId = normalizeTierId((data.tierId || "").trim());
        const nextAddonIds = Array.isArray(data.addonIds)
          ? data.addonIds.map((item) => String(item).trim()).filter(Boolean)
          : [];
        const nextDeposit = typeof data.deposit === "number" ? data.deposit : 0;
        const nextRemaining = typeof data.remaining === "number" ? data.remaining : 0;
        const nextCustomerEmail = (data.customerEmail || "").trim();

        setOrderId(nextOrderId || fallbackOrderId);
        setOrderUuid(nextOrderUuid || fallbackOrderUuid);
        setTierId(nextTierId);
        setAddonIds(nextAddonIds);
        setDeposit(nextDeposit);
        setRemaining(nextRemaining);
        setCustomerEmail(nextCustomerEmail || queryEmail || DEFAULT_SERVICE_EMAIL);
        setSafeConfig((prev) => ({
          ...prev,
          contact_email: prev.contact_email || nextCustomerEmail || queryEmail || "",
        }));
        setStatus("paid");
      } catch {
        if (cancelled) return;
        setStatus("failed");
        setErrorMessage("Payment verification failed. Please contact support.");
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [fallbackOrderId, fallbackOrderUuid, queryEmail, sessionId, verificationNonce]);

  useEffect(() => {
    if (status !== "paid" || !shouldCelebrate) return;

    const key = "ward_welcome_confetti_shown";
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      launchConfetti();
    } catch {
      launchConfetti();
    }
  }, [shouldCelebrate, status]);

  const selectedTierLabel = TIER_LABELS[tierId] || "DetailFlow";
  const selectedAddOnLabels = addonIds.map((addonId) => ADDON_LABELS[addonId] || addonId);
  const resolvedOrderId = orderId || fallbackOrderId;
  const resolvedOrderUuid = orderUuid || fallbackOrderUuid;
  const secureUploadUrl = process.env.NEXT_PUBLIC_SECURE_UPLOAD_URL || "";
  const supportEmail = DEFAULT_SUPPORT_EMAIL;

  const configOutput = useMemo(
    () =>
      generateDetailflowConfigAndHandoff({
        safe: safeConfig,
        selection: {
          tier_id: tierId,
          addon_ids: addonIds,
          price_total: deposit + remaining,
          deposit_amount: deposit,
          remaining_balance: remaining,
          order_id: resolvedOrderId,
        },
      }),
    [addonIds, deposit, remaining, resolvedOrderId, safeConfig, tierId],
  );

  const primaryState: CheckoutPrimaryState =
    status === "checking" ? "return_success_loading" : status === "paid" ? "payment_confirmed" : "verification_error";

  async function handleSubmitConfiguration() {
    if (!resolvedOrderId && !resolvedOrderUuid) {
      toast.error("Missing order reference.");
      return;
    }

    setIsSubmittingConfiguration(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const fallbackUploadUrl = "https://drive.google.com/drive/my-drive";
      const assetLink = isHttpUrl(secureUploadUrl) ? secureUploadUrl : fallbackUploadUrl;

      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: resolvedOrderId || undefined,
          order_uuid: resolvedOrderUuid || undefined,
          config_json: configOutput.configObject,
          asset_links: [assetLink],
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; warning?: string } | null;
      if (!response.ok) {
        const message = payload?.error || "Setup details submit failed.";
        setSubmitStatus("error");
        setSubmitMessage(message);
        toast.error(message);
        return;
      }

      const message = payload?.warning ? `Setup details submitted. ${payload.warning}` : "Setup details submitted.";
      setSubmitStatus("success");
      setSubmitMessage(message);
      toast.success("Setup details submitted");
    } catch {
      setSubmitStatus("error");
      setSubmitMessage("Setup details submit failed. Please try again.");
      toast.error("Setup details submit failed");
    } finally {
      setIsSubmittingConfiguration(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <PostPurchaseForm
        primaryState={primaryState}
        errorMessage={errorMessage}
        productName="DetailFlow"
        orderId={resolvedOrderId}
        fallbackOrderId={fallbackOrderId}
        selectedTierLabel={selectedTierLabel}
        selectedAddOnLabels={selectedAddOnLabels}
        depositToday={deposit}
        remainingBalance={remaining}
        confirmationEmail={customerEmail || queryEmail || DEFAULT_SERVICE_EMAIL}
        supportEmail={supportEmail}
        secureUploadUrl={secureUploadUrl}
        generatedConfigText={configOutput.configSentence}
        resendNotice={resendNotice}
        bookingConfirmed={bookingConfirmed}
        bookingDateLabel={bookingDateLabel}
        bookingTimeLabel={bookingTimeLabel}
        onRetryVerification={() => setVerificationNonce((prev) => prev + 1)}
        onDone={() => {
          window.location.assign("/products#detailflow-template");
        }}
        onStartNewPurchase={() => {
          window.location.assign("/products#detailflow-template");
        }}
        onBookingClick={() => {
          const targetUrl = new URL(CAL_LINKS.detailflowSetup);
          if (resolvedOrderId) targetUrl.searchParams.set("orderId", resolvedOrderId);
          if (resolvedOrderUuid) targetUrl.searchParams.set("orderUuid", resolvedOrderUuid);
          if (customerEmail) targetUrl.searchParams.set("email", customerEmail);
          if (queryName) targetUrl.searchParams.set("name", queryName);
          window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
        }}
        onResendClick={() => {
          if (!customerEmail) {
            setResendNotice("Customer email is missing.");
            toast.error("Customer email is required to resend confirmation");
            return;
          }

          void (async () => {
            try {
              const response = await fetch("/api/email/order-confirmed", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: resolvedOrderId,
                  customerEmail,
                  customerName: queryName || undefined,
                  summary: {
                    tierLabel: selectedTierLabel,
                    addOnLabels: selectedAddOnLabels,
                    deposit,
                    remaining,
                  },
                  bookingUrl: CAL_LINKS.detailflowSetup,
                  stripeSessionId: sessionId || undefined,
                  force: true,
                }),
              });

              const payload = (await response.json().catch(() => null)) as
                | { error?: string; sent?: { client?: boolean; internal?: boolean } }
                | null;

              if (!response.ok) {
                throw new Error(payload?.error || "Resend failed.");
              }

              const wasSent = Boolean(payload?.sent?.client || payload?.sent?.internal);
              const message = wasSent ? "Confirmation email resent." : "Confirmation request received.";
              setResendNotice(message);
              toast.success(message);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Resend failed.";
              setResendNotice(message);
              toast.error(message);
            }
          })();
        }}
        onSupportClick={() => undefined}
        onConfigCopied={() => toast.success("Configuration copied")}
        onConfigCopyFailed={() => toast.error("Copy failed")}
        safeConfig={safeConfig}
        onSafeConfigChange={setSafeConfig}
        handoffChecklist={configOutput.handoffChecklist}
        onSubmitConfiguration={handleSubmitConfiguration}
        isSubmittingConfiguration={isSubmittingConfiguration}
        submitStatus={submitStatus}
        submitMessage={submitMessage}
        prepCallUrl={CAL_LINKS.freeStrategyFit}
      />
    </main>
  );
}
