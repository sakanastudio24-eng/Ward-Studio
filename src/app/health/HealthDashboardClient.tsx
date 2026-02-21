"use client";

import { useEffect, useMemo, useState } from "react";

type CheckState = "ok" | "false" | "error" | "not_responding";

type HealthCheck = {
  id: string;
  method: "GET" | "POST";
  path: string;
  state: CheckState;
  httpStatus: number | null;
  message: string;
};

type HealthPayload = {
  ok: boolean;
  summary: {
    total: number;
    ok: number;
    false: number;
    error: number;
    notResponding: number;
  };
  checks: HealthCheck[];
  checkedAt: string;
};

function stateTone(state: CheckState): string {
  if (state === "ok") return "text-emerald-600";
  if (state === "false") return "text-amber-600";
  if (state === "not_responding") return "text-orange-700";
  return "text-red-600";
}

/**
 * Human-readable status board for API/webhook test points.
 */
export function HealthDashboardClient() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const response = await fetch("/api/health/endpoints", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as HealthPayload;
        if (!mounted) return;
        setData(payload);
      } catch (nextError) {
        if (!mounted) return;
        setError(nextError instanceof Error ? nextError.message : "Could not load health status.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const headingTone = useMemo(() => {
    if (!data) return "text-muted-foreground";
    return data.ok ? "text-emerald-600" : "text-amber-600";
  }, [data]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading endpoint health status...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">Health dashboard error: {error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-destructive">No health payload returned.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-4">
        <p className={`text-sm font-semibold ${headingTone}`}>
          Overall: {data.ok ? "Healthy" : "Needs attention"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Total {data.summary.total} | Ok {data.summary.ok} | False {data.summary.false} | Error{" "}
          {data.summary.error} | Not responding {data.summary.notResponding}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Checked at: {data.checkedAt}</p>
      </div>

      <div className="space-y-2">
        {data.checks.map((check) => (
          <div key={check.id} className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{check.id}</span>
              <span className={`text-xs uppercase tracking-wide ${stateTone(check.state)}`}>
                {check.state.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground">
                {check.method} {check.path}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              HTTP {check.httpStatus ?? "none"} - {check.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
