import { NextResponse } from "next/server";

type ProbeState = "ok" | "false" | "error" | "not_responding";

type ProbeDefinition = {
  id: string;
  method: "GET" | "POST";
  path: string;
  booleanField?: "ok" | "paid";
  successStatuses?: number[];
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
    successStatuses: [200],
  },
  {
    id: "checkout_verify_route",
    method: "GET",
    path: "/api/checkout/verify",
    successStatuses: [400],
  },
  {
    id: "orders_create_route",
    method: "GET",
    path: "/api/orders/create",
    successStatuses: [405],
  },
  {
    id: "checkout_create_route",
    method: "GET",
    path: "/api/checkout/create",
    successStatuses: [405],
  },
  {
    id: "onboarding_submit_route",
    method: "GET",
    path: "/api/onboarding/submit",
    successStatuses: [405],
  },
  {
    id: "stripe_webhook_route",
    method: "GET",
    path: "/api/stripe/webhook",
    successStatuses: [405],
  },
  {
    id: "cal_webhook_route",
    method: "GET",
    path: "/api/cal/webhook",
    successStatuses: [405],
  },
  {
    id: "contact_route",
    method: "GET",
    path: "/api/contact",
    successStatuses: [405],
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

function isSuccessfulStatus(status: number, probe: ProbeDefinition): boolean {
  if (probe.successStatuses && probe.successStatuses.length > 0) {
    return probe.successStatuses.includes(status);
  }
  return status >= 200 && status < 300;
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
      probe.booleanField && parsedBody
        ? getBooleanFieldValue(parsedBody, probe.booleanField)
        : undefined;
    const responseMessage = safeMessage(response.status, parsedBody);

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

    if (!isSuccessfulStatus(response.status, probe)) {
      return {
        id: probe.id,
        method: probe.method,
        path: probe.path,
        state: "error",
        responding: true,
        httpStatus: response.status,
        booleanField: probe.booleanField,
        booleanValue: boolValue,
        message: responseMessage,
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
      message: responseMessage,
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

function buildHumanSummary(input: {
  ok: boolean;
  summary: { total: number; ok: number; false: number; error: number; notResponding: number };
  checks: ProbeResult[];
  checkedAt: string;
}): string {
  const lines: string[] = [];
  lines.push(`Health Check: ${input.ok ? "PASS" : "ATTENTION NEEDED"}`);
  lines.push(
    `Summary: total ${input.summary.total}, ok ${input.summary.ok}, false ${input.summary.false}, error ${input.summary.error}, not responding ${input.summary.notResponding}`,
  );
  lines.push(`Checked at: ${input.checkedAt}`);
  lines.push("");
  lines.push("Checks:");
  for (const check of input.checks) {
    lines.push(
      `${check.state.toUpperCase()} ${check.id} ${check.method} ${check.path} status=${check.httpStatus ?? "none"} message="${check.message}"`,
    );
  }
  return lines.join("\n");
}

/**
 * Health test points for critical API and webhook routes.
 * Probes route reachability without invoking business side effects.
 */
export async function handleApiHealthRequest(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const results = await Promise.all(PROBES.map((probe) => probeEndpoint(origin, probe)));

  const summary = {
    total: results.length,
    ok: results.filter((item) => item.state === "ok").length,
    false: results.filter((item) => item.state === "false").length,
    error: results.filter((item) => item.state === "error").length,
    notResponding: results.filter((item) => item.state === "not_responding").length,
  };

  const payload = {
    ok: summary.error === 0 && summary.notResponding === 0 && summary.false === 0,
    summary,
    checks: results,
    checkedAt: new Date().toISOString(),
  };

  const format = (url.searchParams.get("format") || "").trim().toLowerCase();
  if (format === "human") {
    return new NextResponse(buildHumanSummary(payload), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.json(payload);
}
