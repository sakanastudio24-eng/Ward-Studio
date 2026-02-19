"use client";

import type {
  AnalyticsEventName,
  AnalyticsPayload,
  AnalyticsSharedProps,
} from "./types";

const ANONYMOUS_ID_KEY = "ward_analytics_anonymous_id";

function analyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
}

function createAnonymousId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getAnonymousId(): string {
  if (typeof window === "undefined") {
    return "server-anonymous";
  }

  const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const nextId = createAnonymousId();
  window.localStorage.setItem(ANONYMOUS_ID_KEY, nextId);
  return nextId;
}

export async function track(
  event: AnalyticsEventName,
  props: Partial<AnalyticsSharedProps> & Record<string, unknown>,
): Promise<void> {
  if (typeof window === "undefined" || !analyticsEnabled()) {
    return;
  }

  const payload: AnalyticsPayload = {
    event,
    occurred_at: new Date().toISOString(),
    props: {
      product_id: "detailflow",
      session_id: null,
      ...props,
      anonymous_id: getAnonymousId(),
    } as AnalyticsSharedProps & Record<string, unknown>,
  };

  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Intentionally ignore telemetry delivery failures.
  }
}
