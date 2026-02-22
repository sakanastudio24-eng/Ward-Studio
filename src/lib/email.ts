import { randomUUID } from "node:crypto";
import { DEFAULT_EMAIL_FROM, DEFAULT_OWNER_EMAIL } from "../config/email";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_FALLBACK_FROM = "Ward Studio <onboarding@resend.dev>";

const sentOrderConfirmationIds = new Set<string>();

export type OrderSummary = {
  tierLabel: string;
  addOnLabels: string[];
  deposit: number;
  remaining: number;
};

export type OrderConfirmedInput = {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  summary: OrderSummary;
  bookingUrl: string;
  stripeSessionId?: string;
};

export type BookingConfirmedInput = {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  meetingDate: string;
  meetingTime: string;
  uploadUrl: string;
  bookingProvider: "cal";
  calendarEventId: string;
};

export type ConfigSubmissionInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  packageLabel: string;
  addOnSummaryText: string;
  generatedConfigJson: string;
  handoffSummary: string;
  assetLinksText: string;
  safeConfigWarning: string;
  secretsNotice: string;
  submittedAt: string;
};

export type EmailBundleResult = {
  deduped: boolean;
  sent: {
    client: boolean;
    internal: boolean;
  };
};

export type EmailBundleOptions = {
  force?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAddressList(values: string[]): string[] {
  return values.map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function isResendTestRecipientRestriction(details: string): boolean {
  return /you can only send testing emails to your own email address/i.test(details);
}

function extractAllowedTestRecipient(details: string): string {
  const match = details.match(/\(([^\s()]+@[^\s()]+)\)/);
  return match?.[1]?.trim() || "";
}

function getMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.ORDERS_FROM_EMAIL || DEFAULT_EMAIL_FROM;
  const internalTo =
    process.env.EMAIL_INTERNAL_TO ||
    process.env.ORDERS_OWNER_EMAIL ||
    process.env.CONTACT_OWNER_EMAIL ||
    DEFAULT_OWNER_EMAIL;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }
  if (!internalTo) {
    throw new Error("Missing EMAIL_INTERNAL_TO (or ORDERS_OWNER_EMAIL/CONTACT_OWNER_EMAIL fallback).");
  }

  return {
    apiKey,
    from,
    internalTo,
  };
}

async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const { apiKey, from } = getMailConfig();
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const preferredFrom = from.trim() || RESEND_FALLBACK_FROM;
  const fallbackFrom = (process.env.RESEND_FALLBACK_FROM || RESEND_FALLBACK_FROM).trim();

  const requestBody = {
    to: recipients,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  const sendWithFrom = async (fromAddress: string) =>
    fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        from: fromAddress,
        ...requestBody,
      }),
    });

  let response = await sendWithFrom(preferredFrom);
  if (response.ok) return;

  const initialDetails = await response.text();
  const senderRejected =
    /from|sender|domain|verify/i.test(initialDetails) ||
    /onboarding@resend\.dev/i.test(initialDetails);
  const shouldRetryWithFallback =
    senderRejected && preferredFrom.toLowerCase() !== fallbackFrom.toLowerCase();

  const tryTestModeRedirect = async (details: string, currentFrom: string) => {
    if (!isResendTestRecipientRestriction(details)) return null;

    const allowedTestRecipient = extractAllowedTestRecipient(details);
    if (!allowedTestRecipient) return null;

    const currentRecipients = normalizeAddressList(recipients);
    const alreadyAllowedOnly =
      currentRecipients.length === 1 &&
      currentRecipients[0] === allowedTestRecipient.toLowerCase();
    if (alreadyAllowedOnly) return null;

    const redirectedHtml = `
      <p><strong>Resend test-mode redirect:</strong> intended recipient(s): ${escapeHtml(recipients.join(", "))}</p>
      ${input.html}
    `;
    const redirectedText = [
      `Resend test-mode redirect. Intended recipient(s): ${recipients.join(", ")}`,
      "",
      input.text,
    ].join("\n");

    const redirected = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        from: currentFrom,
        to: [allowedTestRecipient],
        subject: `[TEST MODE REDIRECT] ${input.subject}`,
        html: redirectedHtml,
        text: redirectedText,
      }),
    });

    if (redirected.ok) {
      console.warn(
        `Resend test mode redirected email. intended=${recipients.join(", ")} allowed=${allowedTestRecipient}`,
      );
      return redirected;
    }

    return redirected;
  };

  if (shouldRetryWithFallback) {
    response = await sendWithFrom(fallbackFrom);
    if (response.ok) return;
    const retryDetails = await response.text();

    const redirected = await tryTestModeRedirect(retryDetails, fallbackFrom);
    if (redirected?.ok) return;

    throw new Error(
      `Preferred sender failed (${preferredFrom}): ${initialDetails || "unknown error"}. Fallback sender failed (${fallbackFrom}): ${retryDetails || response.statusText}`,
    );
  }

  const redirected = await tryTestModeRedirect(initialDetails, preferredFrom);
  if (redirected?.ok) return;

  throw new Error(initialDetails || response.statusText);
}

function buildEmailContainer(title: string, sectionsHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:18px 20px;background:#111111;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#f97316;">Ward Studio</div>
                <h1 style="margin:6px 0 0 0;font-size:22px;line-height:1.25;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px;">
                ${sectionsHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Marks an order id as sent and returns whether sending should be skipped.
 */
export function markOrSkipOrderConfirmation(orderId: string): boolean {
  if (sentOrderConfirmationIds.has(orderId)) return true;
  sentOrderConfirmationIds.add(orderId);
  return false;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown email error";
}

/**
 * Sends the buyer-facing order confirmation and next-steps message.
 */
export async function sendClientOrderConfirmation(input: OrderConfirmedInput) {
  const addOns = input.summary.addOnLabels.length > 0 ? input.summary.addOnLabels.join(", ") : "None";
  const name = input.customerName?.trim() || "there";

  const html = buildEmailContainer(
    `Payment confirmed for ${input.orderId}`,
    `
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;">Hi ${escapeHtml(name)}, your project slot is confirmed.</p>
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:12px;margin:0 0 12px 0;">
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Package:</strong> ${escapeHtml(input.summary.tierLabel)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Add-ons:</strong> ${escapeHtml(addOns)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Deposit paid:</strong> ${escapeHtml(formatUsd(input.summary.deposit))}</p>
        <p style="margin:0;font-size:13px;"><strong>Remaining balance:</strong> ${escapeHtml(formatUsd(input.summary.remaining))}</p>
      </div>
      <p style="margin:0 0 10px 0;font-size:13px;"><a href="${escapeHtml(input.bookingUrl)}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;">Book your strategy call</a></p>
      <p style="margin:0 0 8px 0;font-size:13px;"><strong>Prepare these assets:</strong></p>
      <ul style="margin:0 0 12px 18px;padding:0;font-size:13px;line-height:1.6;">
        <li>Business name/logo</li>
        <li>6-12 photos</li>
        <li>Service list + pricing</li>
        <li>Booking preference</li>
      </ul>
      <p style="margin:0;font-size:12px;color:#555555;">For security, do not send passwords or API keys by email.</p>
    `,
  );

  const text = [
    `Payment confirmed for ${input.orderId}.`,
    `Package: ${input.summary.tierLabel}`,
    `Add-ons: ${addOns}`,
    `Deposit paid: ${formatUsd(input.summary.deposit)}`,
    `Remaining balance: ${formatUsd(input.summary.remaining)}`,
    `Book your strategy call: ${input.bookingUrl}`,
    "Prepare: business name/logo, 6-12 photos, service list + pricing, booking preference.",
    "For security, do not send passwords or API keys by email.",
  ].join("\n");

  await sendEmail({
    to: input.customerEmail,
    subject: `DetailFlow order confirmed (${input.orderId})`,
    html,
    text,
  });
}

/**
 * Sends the internal owner-facing new order notification.
 */
export async function sendInternalNewOrder(input: OrderConfirmedInput) {
  const addOns = input.summary.addOnLabels.length > 0 ? input.summary.addOnLabels.join(", ") : "None";
  const { internalTo } = getMailConfig();
  const recipients = splitCsv(internalTo);
  const timestamp = new Date().toISOString();

  const html = buildEmailContainer(
    `New DetailFlow order ${input.orderId}`,
    `
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;">A new paid order was verified and is awaiting booking.</p>
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:12px;">
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Customer:</strong> ${escapeHtml(
          input.customerName?.trim() || "Unknown",
        )} (${escapeHtml(input.customerEmail)})</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Package:</strong> ${escapeHtml(input.summary.tierLabel)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Add-ons:</strong> ${escapeHtml(addOns)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Deposit:</strong> ${escapeHtml(formatUsd(input.summary.deposit))}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Remaining:</strong> ${escapeHtml(formatUsd(input.summary.remaining))}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Stripe session:</strong> ${escapeHtml(
          input.stripeSessionId || "n/a",
        )}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Timestamp:</strong> ${escapeHtml(timestamp)}</p>
        <p style="margin:0;font-size:13px;"><strong>Status:</strong> Awaiting booking</p>
      </div>
    `,
  );

  const text = [
    `New DetailFlow order ${input.orderId}`,
    `Customer: ${input.customerName?.trim() || "Unknown"} (${input.customerEmail})`,
    `Package: ${input.summary.tierLabel}`,
    `Add-ons: ${addOns}`,
    `Deposit: ${formatUsd(input.summary.deposit)}`,
    `Remaining: ${formatUsd(input.summary.remaining)}`,
    `Stripe session: ${input.stripeSessionId || "n/a"}`,
    `Timestamp: ${timestamp}`,
    "Status: Awaiting booking",
  ].join("\n");

  await sendEmail({
    to: recipients,
    subject: `New DetailFlow order (${input.orderId})`,
    html,
    text,
  });
}

/**
 * Sends both order-confirmed emails with in-memory idempotency.
 */
export async function sendOrderConfirmedBundle(
  input: OrderConfirmedInput,
  options: EmailBundleOptions = {},
): Promise<EmailBundleResult> {
  if (!options.force && markOrSkipOrderConfirmation(input.orderId)) {
    return {
      deduped: true,
      sent: {
        client: false,
        internal: false,
      },
    };
  }

  let clientSent = false;
  let internalSent = false;
  const failures: string[] = [];

  try {
    await sendClientOrderConfirmation(input);
    clientSent = true;
  } catch (error) {
    failures.push(`client: ${getErrorMessage(error)}`);
  }

  try {
    await sendInternalNewOrder(input);
    internalSent = true;
  } catch (error) {
    failures.push(`internal: ${getErrorMessage(error)}`);
  }

  if (failures.length > 0) {
    console.error(`Order confirmation email issue (${input.orderId}): ${failures.join(" | ")}`);
  }

  if (!clientSent && !internalSent) {
    throw new Error(failures.join(" | ") || "Both order confirmation emails failed.");
  }

  return {
    deduped: false,
    sent: {
      client: clientSent,
      internal: internalSent,
    },
  };
}

/**
 * Sends buyer reminder with upload instructions after booking confirmation.
 */
export async function sendBookingReminder(input: BookingConfirmedInput) {
  const name = input.customerName?.trim() || "there";

  const html = buildEmailContainer(
    `Strategy call confirmed (${input.orderId})`,
    `
      <p style="margin:0 0 10px 0;font-size:14px;">Hi ${escapeHtml(name)}, your strategy call is confirmed.</p>
      <p style="margin:0 0 6px 0;font-size:13px;"><strong>Date:</strong> ${escapeHtml(input.meetingDate)}</p>
      <p style="margin:0 0 12px 0;font-size:13px;"><strong>Time:</strong> ${escapeHtml(input.meetingTime)}</p>
      <p style="margin:0 0 10px 0;font-size:13px;">Upload your assets before the call:</p>
      <p style="margin:0 0 12px 0;font-size:13px;"><a href="${escapeHtml(input.uploadUrl)}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;">Secure upload link</a></p>
      <p style="margin:0;font-size:12px;color:#555555;">For security, do not send passwords or API keys by email.</p>
    `,
  );

  const text = [
    `Strategy call confirmed (${input.orderId})`,
    `Date: ${input.meetingDate}`,
    `Time: ${input.meetingTime}`,
    `Upload assets: ${input.uploadUrl}`,
    "For security, do not send passwords or API keys by email.",
  ].join("\n");

  await sendEmail({
    to: input.customerEmail,
    subject: `Strategy call confirmed (${input.orderId})`,
    html,
    text,
  });
}

/**
 * Sends internal notification when booking confirmation webhook is received.
 */
export async function sendInternalBookingConfirmed(input: BookingConfirmedInput) {
  const { internalTo } = getMailConfig();
  const recipients = splitCsv(internalTo);

  const html = buildEmailContainer(
    `Booking confirmed (${input.orderId})`,
    `
      <p style="margin:0 0 12px 0;font-size:14px;">Client booking confirmed through ${escapeHtml(
        input.bookingProvider,
      )}.</p>
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:12px;">
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Customer:</strong> ${escapeHtml(
          input.customerName?.trim() || "Unknown",
        )} (${escapeHtml(input.customerEmail)})</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Date:</strong> ${escapeHtml(input.meetingDate)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Time:</strong> ${escapeHtml(input.meetingTime)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Event ID:</strong> ${escapeHtml(input.calendarEventId)}</p>
        <p style="margin:0;font-size:13px;"><strong>Upload URL:</strong> ${escapeHtml(input.uploadUrl)}</p>
      </div>
    `,
  );

  const text = [
    `Booking confirmed (${input.orderId})`,
    `Customer: ${input.customerName?.trim() || "Unknown"} (${input.customerEmail})`,
    `Date: ${input.meetingDate}`,
    `Time: ${input.meetingTime}`,
    `Event ID: ${input.calendarEventId}`,
    `Upload URL: ${input.uploadUrl}`,
  ].join("\n");

  await sendEmail({
    to: recipients,
    subject: `Booking confirmed (${input.orderId})`,
    html,
    text,
  });
}

/**
 * Sends buyer and internal booking-confirmed emails.
 */
export async function sendBookingConfirmedBundle(input: BookingConfirmedInput): Promise<EmailBundleResult> {
  let clientSent = false;
  let internalSent = false;
  const failures: string[] = [];

  try {
    await sendBookingReminder(input);
    clientSent = true;
  } catch (error) {
    failures.push(`client: ${getErrorMessage(error)}`);
  }

  try {
    await sendInternalBookingConfirmed(input);
    internalSent = true;
  } catch (error) {
    failures.push(`internal: ${getErrorMessage(error)}`);
  }

  if (failures.length > 0) {
    console.error(`Booking confirmation email issue (${input.orderId}): ${failures.join(" | ")}`);
  }

  if (!clientSent && !internalSent) {
    throw new Error(failures.join(" | ") || "Both booking confirmation emails failed.");
  }

  return {
    deduped: false,
    sent: {
      client: clientSent,
      internal: internalSent,
    },
  };
}

/**
 * Sends required config-submission notification to the internal owner inbox.
 */
export async function sendInternalConfigSubmission(input: ConfigSubmissionInput) {
  const { internalTo } = getMailConfig();
  const recipients = splitCsv(internalTo);

  const html = buildEmailContainer(
    `Config submitted (${input.orderId})`,
    `
      <p style="margin:0 0 12px 0;font-size:14px;">A client submitted onboarding configuration details.</p>
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:12px;">
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Customer:</strong> ${escapeHtml(
          input.customerName,
        )} (${escapeHtml(input.customerEmail)})</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Package:</strong> ${escapeHtml(input.packageLabel)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Add-ons:</strong> ${escapeHtml(input.addOnSummaryText)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Asset links:</strong> ${escapeHtml(input.assetLinksText)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Submitted:</strong> ${escapeHtml(input.submittedAt)}</p>
        <p style="margin:0 0 6px 0;font-size:13px;"><strong>Safe config warning:</strong> ${escapeHtml(
          input.safeConfigWarning,
        )}</p>
        <p style="margin:0;font-size:13px;"><strong>Secrets notice:</strong> ${escapeHtml(input.secretsNotice)}</p>
      </div>
      <h2 style="margin:16px 0 8px 0;font-size:15px;">Generated Config</h2>
      <pre style="margin:0 0 12px 0;background:#111111;color:#f8f8f8;padding:10px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(
        input.generatedConfigJson,
      )}</pre>
      <h2 style="margin:0 0 8px 0;font-size:15px;">Handoff Summary</h2>
      <pre style="margin:0;background:#f5f5f5;padding:10px;border-radius:8px;overflow:auto;font-size:12px;">${escapeHtml(
        input.handoffSummary,
      )}</pre>
    `,
  );

  const text = [
    `Config submitted (${input.orderId})`,
    `Customer: ${input.customerName} (${input.customerEmail})`,
    `Package: ${input.packageLabel}`,
    `Add-ons: ${input.addOnSummaryText}`,
    `Asset links: ${input.assetLinksText}`,
    `Submitted: ${input.submittedAt}`,
    `Safe config warning: ${input.safeConfigWarning}`,
    `Secrets notice: ${input.secretsNotice}`,
    "",
    "Generated Config:",
    input.generatedConfigJson,
    "",
    "Handoff Summary:",
    input.handoffSummary,
  ].join("\n");

  await sendEmail({
    to: recipients,
    subject: `DetailFlow config submitted (${input.orderId})`,
    html,
    text,
  });
}

/**
 * Optional buyer acknowledgement after config submission.
 */
export async function sendBuyerConfigSubmissionAck(input: ConfigSubmissionInput) {
  const html = buildEmailContainer(
    `Configuration received (${input.orderId})`,
    `
      <p style="margin:0 0 12px 0;font-size:14px;">Your configuration details were received.</p>
      <p style="margin:0 0 6px 0;font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
      <p style="margin:0 0 6px 0;font-size:13px;"><strong>Package:</strong> ${escapeHtml(input.packageLabel)}</p>
      <p style="margin:0 0 12px 0;font-size:13px;"><strong>Add-ons:</strong> ${escapeHtml(input.addOnSummaryText)}</p>
      <p style="margin:0;font-size:12px;color:#555555;">For security, do not send passwords or API keys by email.</p>
    `,
  );

  const text = [
    `Configuration received (${input.orderId})`,
    `Package: ${input.packageLabel}`,
    `Add-ons: ${input.addOnSummaryText}`,
    "For security, do not send passwords or API keys by email.",
  ].join("\n");

  await sendEmail({
    to: input.customerEmail,
    subject: `DetailFlow configuration received (${input.orderId})`,
    html,
    text,
  });
}
