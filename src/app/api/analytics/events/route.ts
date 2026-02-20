import { NextResponse } from "next/server";
import { isAnalyticsEventName, type AnalyticsPayload } from "../../../../lib/analytics/types";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const analyticsStorageConfigured = Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
  if (!analyticsStorageConfigured) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "Analytics storage is not configured in this environment.",
    }, { status: 202 });
  }

  const payload = (await request.json().catch(() => null)) as AnalyticsPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  const event = getString((payload as { event?: unknown }).event);
  if (!isAnalyticsEventName(event)) {
    return NextResponse.json({ error: "Unsupported analytics event." }, { status: 400 });
  }

  const props = (payload as { props?: unknown }).props;
  if (!props || typeof props !== "object") {
    return NextResponse.json({ error: "Missing analytics properties." }, { status: 400 });
  }

  const objectProps = props as Record<string, unknown>;
  const productId = getString(objectProps.product_id);
  const anonymousId = getString(objectProps.anonymous_id);

  if (!productId) {
    return NextResponse.json({ error: "Missing product_id." }, { status: 400 });
  }

  if (!anonymousId) {
    return NextResponse.json({ error: "Missing anonymous_id." }, { status: 400 });
  }

  const occurredAt = getString((payload as { occurred_at?: unknown }).occurred_at) || new Date().toISOString();

  try {
    const supabase = getSupabaseServerClient();
    await supabase.insertAnalyticsEvent({
      event_name: event,
      product_id: productId,
      tier_id: getString(objectProps.tier_id) || null,
      addon_ids: Array.isArray(objectProps.addon_ids) ? objectProps.addon_ids : null,
      price_total: typeof objectProps.price_total === "number" ? objectProps.price_total : null,
      deposit_amount: typeof objectProps.deposit_amount === "number" ? objectProps.deposit_amount : null,
      order_id: getString(objectProps.order_id) || null,
      session_id: getString(objectProps.session_id) || null,
      anonymous_id: anonymousId,
      props: objectProps,
      created_at: occurredAt,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        reason: error instanceof Error ? error.message : "Analytics insert failed.",
      },
      { status: 202 },
    );
  }
}
