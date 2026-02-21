import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProbeState = "ok" | "false" | "error" | "not_responding";

type ProbeDefinition = {
  id: string;
  method: "GET" | "POST";
  path: string;
  booleanField?: "ok" | "paid";
  timeoutMs?: number;
};

type ProbeResult = {
  id: string;
  method: "GET" | "POST";
  path: string;
  state: ProbeState;
  responding: boolean;
  httpStatus: number | null;
  booleanField?: string;
  booleanValue?: boolean;
  message: string;
};

const DEFAULT_TIMEOUT_MS = 4500;

const PROBES: ProbeDefinition[] = [
  {
    id: "stripe_diagnostics",
    method: "GET",
    path: "/api/stripe/diagnostics",
    booleanField: "ok",
  },
  {
    id: "checkout_verify",
    method: "GET",
    path: "/api/checkout/verify?session_id=healthcheck",
    booleanField: "paid",
  },
  {
    id: "stripe_session_status",
    method: "GET",
    path: "/api/stripe/session-status?session_id=healthcheck",
  },
  {
    id: "orders_create_route",
    method: "GET",
    path: "/api/orders/create",
  },
  {
    id: "checkout_create_route",
    method: "GET",
    path: "/api/checkout/create",
  },
  {
    id: "onboarding_submit_route",
    method: "GET",
    path: "/api/onboarding/submit",
  },
  {
    id: "stripe_webhook_route",
    method: "GET",
    path: "/api/stripe/webhook",
  },
  {
    id: "cal_webhook_route",
    method: "GET",
    path: "/api/cal/webhook",
  },
  {
    id: "contact_route",
    method: "GET",
    path: "/api/contact",
  },
];

function getBooleanFieldValue(data: unknown, key: "ok" | "paid"): boolean | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : undefined;
}

function safeMessage(status: number, data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return `HTTP ${status}`;
  }
  const source = data as Record<string, unknown>;
  const error = typeof source.error === "string" ? source.error : "";
  const message = typeof source.message === "string" ? source.message : "";
  return error || message || `HTTP ${status}`;
}

async function probeEndpoint(origin: string, probe: ProbeDefinition): Promise<ProbeResult> {
  const timeoutMs = probe.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${origin}${probe.path}`, {
      method: probe.method,
      cache: "no-store",
      signal: controller.signal,
    });

    let parsedBody: unknown = null;
    try {
      parsedBody = await response.json();
    } catch {
      parsedBody = null;
    }

    const boolValue =
      probe.booleanField && parsedBody ? getBooleanFieldValue(parsedBody, probe.booleanField) : undefined;

    if (typeof boolValue === "boolean" && boolValue === false) {
      return {
        id: probe.id,
        method: probe.method,
        path: probe.path,
        state: "false",
        responding: true,
        httpStatus: response.status,
        booleanField: probe.booleanField,
        booleanValue: boolValue,
        message: `${probe.booleanField}=false`,
      };
    }

    if (!response.ok && response.status !== 400 && response.status !== 401 && response.status !== 404 && response.status !== 405) {
      return {
        id: probe.id,
        method: probe.method,
        path: probe.path,
        state: "error",
        responding: true,
        httpStatus: response.status,
        booleanField: probe.booleanField,
        booleanValue: boolValue,
        message: safeMessage(response.status, parsedBody),
      };
    }

    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      state: "ok",
      responding: true,
      httpStatus: response.status,
      booleanField: probe.booleanField,
      booleanValue: boolValue,
      message: safeMessage(response.status, parsedBody),
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      id: probe.id,
      method: probe.method,
      path: probe.path,
      state: "not_responding",
      responding: false,
      httpStatus: null,
      booleanField: probe.booleanField,
      message: isAbort ? `Timeout after ${timeoutMs}ms` : "Request failed to complete",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Health test points for critical API/webhook routes.
 * Reports whether routes are responding and whether boolean signals are false.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const results = await Promise.all(PROBES.map((probe) => probeEndpoint(origin, probe)));

  const summary = {
    total: results.length,
    ok: results.filter((item) => item.state === "ok").length,
    false: results.filter((item) => item.state === "false").length,
    error: results.filter((item) => item.state === "error").length,
    notResponding: results.filter((item) => item.state === "not_responding").length,
  };

  return NextResponse.json({
    ok: summary.error === 0 && summary.notResponding === 0,
    summary,
    checks: results,
    checkedAt: new Date().toISOString(),
  });
}
