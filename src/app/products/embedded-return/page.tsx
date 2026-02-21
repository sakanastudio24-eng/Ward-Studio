"use client";

import { useEffect, useMemo, useState } from "react";

type SessionStatus = {
  status?: string;
  payment_status?: string;
  customer_email?: string;
  error?: string;
};

/**
 * Handles Stripe embedded checkout return by checking session status and redirecting.
 */
export default function EmbeddedCheckoutReturnPage() {
  const [message, setMessage] = useState("Confirming payment...");
  const [errorMessage, setErrorMessage] = useState("");

  const search = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const sessionId = search.get("session_id") || "";

  useEffect(() => {
    let cancelled = false;

    async function resolveSession() {
      if (!sessionId) {
        setErrorMessage("Missing checkout session id.");
        setMessage("Unable to verify payment.");
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
          },
        );
        const payload = (await response.json()) as SessionStatus;

        if (cancelled) return;

        if (!response.ok) {
          setErrorMessage(payload.error || "Could not retrieve checkout session.");
          setMessage("Unable to verify payment.");
          return;
        }

        if (payload.status === "complete" || payload.payment_status === "paid") {
          window.location.replace(
            `/products/success?session_id=${encodeURIComponent(sessionId)}&celebrate=1`,
          );
          return;
        }

        if (payload.status === "open") {
          setMessage("Payment was not completed. You can retry checkout.");
          return;
        }

        setMessage(`Checkout status: ${payload.status || "unknown"}`);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "Session verification failed.");
        setMessage("Unable to verify payment.");
      }
    }

    void resolveSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 md:px-12">
      <div className="mx-auto max-w-2xl rounded-xl border border-border p-6">
        <h1 className="tracking-tight text-[1.6rem] sm:text-[2rem]">Checkout Return</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {errorMessage && <p className="mt-2 text-sm text-destructive">{errorMessage}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="/products#detailflow-template"
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Back to DetailFlow
          </a>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

