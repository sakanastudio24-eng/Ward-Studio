import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import type { HandoffChecklist, SafeConfigInput } from "../../../lib/config-generator/detailflow";
import { CopyBlock } from "./CopyBlock";
import { ConfettiTrigger } from "./ConfettiTrigger";
import { formatPrice } from "./utils";
import type { CheckoutPrimaryState } from "./flow";

export interface SuccessDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryState: CheckoutPrimaryState;
  errorMessage: string;
  productName: string;
  orderId: string;
  fallbackOrderId: string;
  selectedTierLabel: string;
  selectedAddOnLabels: string[];
  depositToday: number;
  remainingBalance: number;
  confirmationEmail: string;
  supportEmail: string;
  secureUploadUrl: string;
  generatedConfigText: string;
  resendNotice: string;
  bookingConfirmed: boolean;
  bookingDateLabel: string;
  bookingTimeLabel: string;
  onRetryVerification: () => void;
  onStartNewPurchase: () => void;
  onBack: () => void;
  onBookingClick: () => void;
  onResendClick: () => void;
  onSupportClick: () => void;
  onConfigCopied: () => void;
  onConfigCopyFailed: () => void;
  safeConfig: SafeConfigInput;
  onSafeConfigChange: (next: SafeConfigInput) => void;
  handoffChecklist: HandoffChecklist;
  onSubmitConfiguration: () => void;
  isSubmittingConfiguration: boolean;
  submitStatus: "idle" | "success" | "error";
  submitMessage: string;
  prepCallUrl: string;
}

const isErrorState = (state: CheckoutPrimaryState) =>
  state === "payment_failed" || state === "verification_error";

/**
 * Normalizes comma/newline textarea input into trimmed list values.
 */
function parseLineList(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Post-purchase right-side drawer shown after payment verification.
 * Handles booking CTA, onboarding inputs, config copy, and support actions.
 */
export function SuccessDrawer({
  open,
  onOpenChange,
  primaryState,
  errorMessage,
  productName,
  orderId,
  fallbackOrderId,
  selectedTierLabel,
  selectedAddOnLabels,
  depositToday,
  remainingBalance,
  confirmationEmail,
  supportEmail,
  secureUploadUrl,
  generatedConfigText,
  resendNotice,
  bookingConfirmed,
  bookingDateLabel,
  bookingTimeLabel,
  onRetryVerification,
  onStartNewPurchase,
  onBack,
  onBookingClick,
  onResendClick,
  onSupportClick,
  onConfigCopied,
  onConfigCopyFailed,
  safeConfig,
  onSafeConfigChange,
  handoffChecklist,
  onSubmitConfiguration,
  isSubmittingConfiguration,
  submitStatus,
  submitMessage,
  prepCallUrl,
}: SuccessDrawerProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const loading = primaryState === "return_success_loading";
  const uploadLink = secureUploadUrl.trim();
  const hasUploadLink = uploadLink.startsWith("http://") || uploadLink.startsWith("https://");

  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => {
      const root = contentRef.current;
      if (!root) return;
      const focusTarget = root.querySelector<HTMLElement>("[data-success-primary-action]") || root;
      focusTarget.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open, primaryState]);

  function patchSafeConfig<K extends keyof SafeConfigInput>(key: K, value: SafeConfigInput[K]) {
    onSafeConfigChange({
      ...safeConfig,
      [key]: value,
    });
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DrawerContent ref={contentRef} className="h-full w-full sm:max-w-[44rem]" tabIndex={-1}>
        <ConfettiTrigger shouldFire={primaryState === "payment_confirmed"} />

        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl">Post-Purchase</DrawerTitle>
          <DrawerDescription>{productName} onboarding and next steps.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-4 sm:space-y-5 sm:px-5">
          {loading && (
            <section className="space-y-3 rounded-lg border border-border p-4">
              <h3 className="text-base font-semibold">Confirming payment...</h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </section>
          )}

          {isErrorState(primaryState) && (
            <section className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <h3 className="text-base font-semibold text-destructive">Payment verification issue</h3>
              <p className="mt-2 text-sm text-destructive">
                {errorMessage || "Payment verification did not complete. Please retry."}
              </p>
              <Button className="mt-4 bg-orange-500 text-white hover:bg-orange-600" onClick={onRetryVerification}>
                Retry verification
              </Button>
            </section>
          )}

          {primaryState === "payment_confirmed" && (
            <>
              <section className="rounded-lg border border-border p-4">
                <Button
                  data-success-primary-action
                  className="h-14 w-full bg-orange-500 text-base font-semibold text-white hover:bg-orange-600"
                  onClick={onBookingClick}
                >
                  Book Your Free Strategy Call
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Required to begin development.</p>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="text-base font-semibold">Payment Confirmed</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your project slot is officially reserved.</p>
                <p className="mt-3 break-all text-sm font-medium">Order ID: {orderId || fallbackOrderId}</p>
              </section>

              <section className="rounded-lg border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    What to send now
                  </h3>
                  <a
                    href={prepCallUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    I prefer to cover all this over phone
                  </a>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Do not include API keys, tokens, or passwords.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="business-name">Business name</Label>
                    <Input
                      id="business-name"
                      value={safeConfig.business_name}
                      onChange={(event) => patchSafeConfig("business_name", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contact-email">Contact email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={safeConfig.contact_email}
                      onChange={(event) => patchSafeConfig("contact_email", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contact-phone">Contact phone</Label>
                    <Input
                      id="contact-phone"
                      value={safeConfig.contact_phone || ""}
                      onChange={(event) => patchSafeConfig("contact_phone", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="service-area">City / service area</Label>
                    <Input
                      id="service-area"
                      value={safeConfig.city_service_area || ""}
                      onChange={(event) => patchSafeConfig("city_service_area", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="service-list">Service list + prices</Label>
                    <textarea
                      id="service-list"
                      value={safeConfig.service_list_and_prices}
                      onChange={(event) => patchSafeConfig("service_list_and_prices", event.target.value)}
                      className="min-h-[110px] w-full resize-y rounded-md border border-border bg-muted/20 p-3 text-sm text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      value={safeConfig.hours || ""}
                      onChange={(event) => patchSafeConfig("hours", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="theme-choice">Theme choice</Label>
                    <Input
                      id="theme-choice"
                      value={safeConfig.theme_choice || ""}
                      onChange={(event) => patchSafeConfig("theme_choice", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="social-links">Social links (comma or new line separated)</Label>
                    <textarea
                      id="social-links"
                      value={(safeConfig.social_links || []).join("\n")}
                      onChange={(event) => patchSafeConfig("social_links", parseLineList(event.target.value))}
                      className="min-h-[72px] w-full resize-y rounded-md border border-border bg-muted/20 p-3 text-sm text-foreground"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="brand-colors">Brand colors (hex, comma or new line separated)</Label>
                    <textarea
                      id="brand-colors"
                      value={(safeConfig.brand_colors_hex || []).join("\n")}
                      onChange={(event) => patchSafeConfig("brand_colors_hex", parseLineList(event.target.value))}
                      className="min-h-[72px] w-full resize-y rounded-md border border-border bg-muted/20 p-3 text-sm text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="booking-mode">Booking mode</Label>
                    <select
                      id="booking-mode"
                      value={safeConfig.booking_mode}
                      onChange={(event) => patchSafeConfig("booking_mode", event.target.value as SafeConfigInput["booking_mode"])}
                      className="h-9 w-full rounded-md border border-border bg-input-background px-3 text-sm"
                    >
                      <option value="external_link">External link</option>
                      <option value="iframe">Embed (iframe)</option>
                      <option value="contact_only">Contact only</option>
                    </select>
                  </div>

                  {safeConfig.booking_mode === "external_link" && (
                    <div className="space-y-1">
                      <Label htmlFor="booking-link">Booking link</Label>
                      <Input
                        id="booking-link"
                        value={safeConfig.booking_link || ""}
                        onChange={(event) => patchSafeConfig("booking_link", event.target.value)}
                      />
                    </div>
                  )}

                  {safeConfig.booking_mode === "iframe" && (
                    <div className="space-y-1">
                      <Label htmlFor="booking-embed">Booking embed URL</Label>
                      <Input
                        id="booking-embed"
                        value={safeConfig.booking_embed_url || ""}
                        onChange={(event) => patchSafeConfig("booking_embed_url", event.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="owner-email">Owner notification email</Label>
                    <Input
                      id="owner-email"
                      type="email"
                      value={safeConfig.owner_notification_email || ""}
                      onChange={(event) => patchSafeConfig("owner_notification_email", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="terms-url">Legal terms URL</Label>
                    <Input
                      id="terms-url"
                      value={safeConfig.legal_terms_url || ""}
                      onChange={(event) => patchSafeConfig("legal_terms_url", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="privacy-url">Legal privacy URL</Label>
                    <Input
                      id="privacy-url"
                      value={safeConfig.legal_privacy_url || ""}
                      onChange={(event) => patchSafeConfig("legal_privacy_url", event.target.value)}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label>Add-ons chosen</Label>
                    <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      {selectedAddOnLabels.length > 0 ? selectedAddOnLabels.join(", ") : "None"}
                    </p>
                  </div>
                </div>
              </section>

              <CopyBlock
                title="Generated Configuration"
                value={generatedConfigText}
                description="Copy this one-line project summary for fulfillment, onboarding, or CRM notes."
                onCopied={() => {
                  onConfigCopied();
                  toast.success("Configuration copied");
                }}
                onCopyFailed={() => {
                  onConfigCopyFailed();
                  toast.error("Copy failed");
                }}
              />

              <section className="rounded-lg border border-border p-4">
                <Button
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                  disabled={isSubmittingConfiguration}
                  onClick={onSubmitConfiguration}
                >
                  {isSubmittingConfiguration ? "Submitting..." : "Submit setup details"}
                </Button>
                {submitStatus !== "idle" && (
                  <p className={`mt-2 text-xs ${submitStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                    {submitMessage}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Not ready right now? This handoff is also in your email.
                </p>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Handoff Checklist
                </h3>
                <p className="mb-3 whitespace-pre-line text-sm text-muted-foreground">{handoffChecklist.rules_text}</p>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Send now (copy/paste)</p>
                    <ul className="mt-1 space-y-1">
                      {handoffChecklist.send_now.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground">Upload (files)</p>
                    <ul className="mt-1 space-y-1">
                      {handoffChecklist.upload_files.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {handoffChecklist.call_required && handoffChecklist.during_call.length > 0 && (
                    <div>
                      <p className="font-medium text-foreground">During call (secure setup)</p>
                      <ul className="mt-1 space-y-1">
                        {handoffChecklist.during_call.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {hasUploadLink ? (
                  <a
                    href={uploadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Secure Upload Link
                  </a>
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Upload link will be shared after booking confirmation.
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Order Summary</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Package: {selectedTierLabel}</p>
                  <p>Add-Ons: {selectedAddOnLabels.length > 0 ? selectedAddOnLabels.join(", ") : "None"}</p>
                  <p>Deposit Paid: {formatPrice(depositToday)}</p>
                  <p>Remaining Balance: {formatPrice(remainingBalance)}</p>
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Email Confirmation</h3>
                <p className="text-sm text-muted-foreground">We have sent your receipt and next steps to:</p>
                <p className="mt-1 break-all text-sm font-medium">{confirmationEmail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={onResendClick}>
                    Resend confirmation
                  </Button>
                  <a
                    href={`mailto:${supportEmail}?subject=DetailFlow%20Support%20${encodeURIComponent(orderId)}`}
                    className="inline-flex items-center rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={onSupportClick}
                  >
                    Contact support
                  </a>
                </div>
                {resendNotice && <p className="mt-2 text-xs text-muted-foreground">{resendNotice}</p>}
              </section>

              {bookingConfirmed && (
                <section className="rounded-lg border border-border p-4">
                  <h3 className="text-base font-semibold">Strategy Call Confirmed</h3>
                  <p className="mt-3 text-sm text-muted-foreground">Your call is booked for:</p>
                  <p className="text-sm">{bookingDateLabel}</p>
                  <p className="text-sm">{bookingTimeLabel}</p>
                  <a
                    href={secureUploadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    Secure Upload Link
                  </a>
                </section>
              )}
            </>
          )}

        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="outline" onClick={onStartNewPurchase}>
            Start new purchase
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
