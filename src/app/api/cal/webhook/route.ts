import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendBookingConfirmedBundle } from "../../../../lib/email";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

type CalWebhookPayload = {
  id?: string | number;
  event?: string;
  eventType?: string;
  triggerEvent?: string;
  type?: string;
  data?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

const BOOKING_EVENTS = new Set([
  "BOOKING_CREATED",
  "booking.created",
  "booking_confirmed",
  "booking.confirmed",
]);

const processedBookingWebhookKeys = new Set<string>();

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getWebhookSignature(request: Request): string {
  return (
    request.headers.get("x-cal-signature-256") ||
    request.headers.get("cal-signature-256") ||
    request.headers.get("x-cal-signature") ||
    ""
  ).trim();
}

function verifyCalSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedCandidates = [digest, `sha256=${digest}`];

  for (const expected of expectedCandidates) {
    const expectedBuf = Buffer.from(expected);
    const providedBuf = Buffer.from(signature);
    if (expectedBuf.length !== providedBuf.length) continue;
    if (timingSafeEqual(expectedBuf, providedBuf)) return true;
  }

  return false;
}

function formatMeetingDateAndTime(startIso: string): { meetingDate: string; meetingTime: string } {
  const fallback = {
    meetingDate: "TBD",
    meetingTime: "TBD",
  };
  if (!startIso) return fallback;

  const date = new Date(startIso);
  if (Number.isNaN(date.getTime())) return fallback;

  return {
    meetingDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    meetingTime: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

function extractEventType(payload: CalWebhookPayload): string {
  return (
    getString(payload.triggerEvent) ||
    getString(payload.eventType) ||
    getString(payload.event) ||
    getString(payload.type)
  );
}

function extractOrderId(data: Record<string, unknown>, root: CalWebhookPayload): string {
  const metadata = getObject(data.metadata);
  const customInputs = getObject(data.customInputs);
  const rootMetadata = getObject(root.metadata);

  return (
    getString(metadata.orderId) ||
    getString(metadata.order_id) ||
    getString(customInputs.orderId) ||
    getString(customInputs.order_id) ||
    getString(data.orderId) ||
    getString(data.order_id) ||
    getString(rootMetadata.orderId) ||
    getString(rootMetadata.order_id) ||
    getString(root.orderId) ||
    getString(root.order_id)
  );
}

function extractOrderUuid(data: Record<string, unknown>, root: CalWebhookPayload): string {
  const metadata = getObject(data.metadata);
  const customInputs = getObject(data.customInputs);
  const rootMetadata = getObject(root.metadata);

  return (
    getString(metadata.order_uuid) ||
    getString(metadata.orderUuid) ||
    getString(customInputs.order_uuid) ||
    getString(customInputs.orderUuid) ||
    getString(data.order_uuid) ||
    getString(data.orderUuid) ||
    getString(rootMetadata.order_uuid) ||
    getString(rootMetadata.orderUuid) ||
    getString(root.order_uuid) ||
    getString(root.orderUuid)
  );
}

function extractAttendee(data: Record<string, unknown>, root: CalWebhookPayload): {
  customerEmail: string;
  customerName: string;
} {
  const attendees = getArray(data.attendees);
  const firstAttendee = getObject(attendees[0]);
  const rootAttendees = getArray(root.attendees);
  const firstRootAttendee = getObject(rootAttendees[0]);

  const customerEmail =
    getString(firstAttendee.email) ||
    getString(data.email) ||
    getString(firstRootAttendee.email) ||
    getString(root.email);
  const customerName =
    getString(firstAttendee.name) ||
    getString(data.name) ||
    getString(firstRootAttendee.name) ||
    getString(root.name);

  return {
    customerEmail,
    customerName,
  };
}

function extractEventId(data: Record<string, unknown>, root: CalWebhookPayload, eventType: string): string {
  const references = getArray(data.references);
  const firstReference = getObject(references[0]);

  return (
    getString(data.id) ||
    getString(data.uid) ||
    getString(firstReference.uid) ||
    getString(root.id) ||
    `${eventType}:${getString(data.startTime) || "unknown-start"}`
  );
}

/**
 * Cal.com webhook receiver for booking confirmations.
 * Sends booking reminder + upload instructions to client and internal booking notification.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureSecret = process.env.CAL_WEBHOOK_SECRET?.trim() || "";
  const signature = getWebhookSignature(request);

  if (signatureSecret && !verifyCalSignature(rawBody, signature, signatureSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = (JSON.parse(rawBody || "{}") as CalWebhookPayload) || {};
  const eventType = extractEventType(payload);

  if (!BOOKING_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: true, ignored: true, reason: "Unsupported event type." });
  }

  const data = getObject(payload.data);
  const eventData = Object.keys(data).length > 0 ? data : getObject(payload.payload);
  let orderId = extractOrderId(eventData, payload);
  const orderUuid = extractOrderUuid(eventData, payload);
  const { customerEmail, customerName } = extractAttendee(eventData, payload);
  const startTime = getString(eventData.startTime) || getString(eventData.start) || getString(payload.startTime);
  const { meetingDate, meetingTime } = formatMeetingDateAndTime(startTime);
  const eventId = extractEventId(eventData, payload, eventType);
  const metadata = getObject(eventData.metadata);
  const uploadUrl =
    getString(metadata.uploadUrl) ||
    getString(metadata.upload_url) ||
    process.env.NEXT_PUBLIC_SECURE_UPLOAD_URL ||
    "#";

  if (!orderId && orderUuid) {
    try {
      const supabase = getSupabaseServerClient();
      const orderRow = await supabase.findOrderByUuid(orderUuid);
      const resolvedOrderId = getString(
        orderRow && typeof orderRow === "object" ? (orderRow as Record<string, unknown>).order_id : "",
      );
      if (resolvedOrderId) {
        orderId = resolvedOrderId;
      }
    } catch {
      // Non-fatal: fallback to UUID for downstream traceability.
    }
  }

  const orderReference = orderId || orderUuid;
  if (!orderReference || !customerEmail) {
    return NextResponse.json(
      {
        error: "Missing required booking reference fields: order_id/order_uuid and customerEmail.",
      },
      { status: 400 },
    );
  }

  const dedupeKey = `${eventId}:${orderReference}`;
  if (processedBookingWebhookKeys.has(dedupeKey)) {
    return NextResponse.json({
      ok: true,
      deduped: true,
      orderId: orderReference,
      eventId,
    });
  }

  try {
    const result = await sendBookingConfirmedBundle({
      orderId: orderReference,
      customerEmail,
      customerName: customerName || undefined,
      meetingDate,
      meetingTime,
      uploadUrl,
      bookingProvider: "cal",
      calendarEventId: eventId,
    });

    processedBookingWebhookKeys.add(dedupeKey);
    return NextResponse.json({
      ok: true,
      deduped: false,
      sent: result.sent,
      orderId: orderReference,
      orderUuid: orderUuid || undefined,
      eventId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Booking email send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 502 },
    );
  }
}
