import "server-only";
import { env } from "../../env";

export type DiagnosticStatus = "valid" | "missing" | "placeholder" | "invalid";

export type StripeKeyDiagnostic = {
  key: string;
  status: DiagnosticStatus;
  required: boolean;
  description: string;
  fix: string;
};

function sanitize(value: string | undefined): string {
  return (value || "").trim();
}

function looksPlaceholder(value: string): boolean {
  const lowered = value.toLowerCase();
  return (
    lowered.includes("xxxx") ||
    lowered.includes("your_") ||
    lowered.includes("replace_me") ||
    lowered.includes("fake")
  );
}

function validateByPrefix(value: string, prefixes: string[]): DiagnosticStatus {
  if (!value) return "missing";
  if (looksPlaceholder(value)) return "placeholder";
  if (!prefixes.some((prefix) => value.startsWith(prefix))) return "invalid";
  return "valid";
}

function readLiveMode(): "true" | "false" | "auto" {
  const mode = sanitize(env.STRIPE_CHECKOUT_LIVE_MODE).toLowerCase();
  if (mode === "true") return "true";
  if (mode === "false") return "false";
  return "auto";
}

/**
 * Returns non-secret diagnostics for Stripe-related env configuration.
 */
export function getStripeDiagnostics() {
  const secretStatus = validateByPrefix(sanitize(env.STRIPE_SECRET_KEY), [
    "sk_test_",
    "sk_live_",
  ]);
  const webhookStatus = validateByPrefix(sanitize(env.STRIPE_WEBHOOK_SECRET), [
    "whsec_",
  ]);
  const liveMode = readLiveMode();

  const checks: StripeKeyDiagnostic[] = [
    {
      key: "STRIPE_SECRET_KEY",
      status: secretStatus,
      required: true,
      description: "Server secret key used for checkout/session retrieval.",
      fix: "Set STRIPE_SECRET_KEY to a real sk_test_... or sk_live_... key.",
    },
    {
      key: "STRIPE_WEBHOOK_SECRET",
      status: webhookStatus,
      required: false,
      description: "Webhook signing secret for future webhook verification.",
      fix: "Set STRIPE_WEBHOOK_SECRET to a real whsec_... value when webhook is enabled.",
    },
  ];

  const hasBlocking = checks.some((check) => check.required && check.status !== "valid");
  const liveCheckoutEnabled =
    (liveMode === "true" || liveMode === "auto") && secretStatus === "valid";

  return {
    ok: !hasBlocking,
    liveMode,
    liveCheckoutEnabled,
    checks,
  };
}
