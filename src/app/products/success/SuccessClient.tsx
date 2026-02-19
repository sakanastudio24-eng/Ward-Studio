"use client";

import { useEffect, useMemo, useState } from "react";
import { launchConfetti } from "../../../lib/confetti";

type VerifyStatus = "checking" | "paid" | "failed";

type VerifyResponse = {
  paid: boolean;
  orderId?: string;
  status?: string;
  sessionId?: string;
  error?: string;
};

export default function SuccessClient() {
  const [status, setStatus] = useState<VerifyStatus>("checking");
  const [errorMessage, setErrorMessage] = useState("");

  const search = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const shouldCelebrate = search.get("celebrate") === "1";
  const sessionId = search.get("session_id") || "";

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!sessionId) {
        setStatus("failed");
        setErrorMessage("Missing payment session reference.");
        return;
      }

      try {
        const response = await fetch(
          `/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
          },
        );

        const data = (await response.json()) as VerifyResponse;

        if (cancelled) return;

        if (!response.ok || !data.paid) {
          setStatus("failed");
          setErrorMessage(data.error || "Unable to verify payment.");
          return;
        }

        setStatus("paid");
      } catch {
        if (cancelled) return;
        setStatus("failed");
        setErrorMessage("Payment verification failed. Please contact support.");
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (status !== "paid" || !shouldCelebrate) return;

    const key = "ward_welcome_confetti_shown";

    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      launchConfetti();
    } catch {
      launchConfetti();
    }
  }, [shouldCelebrate, status]);

  useEffect(() => {
    const onPageShow = () => {
      if (status !== "paid" || !shouldCelebrate) return;
      const key = "ward_welcome_confetti_shown";
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
        launchConfetti();
      } catch {
        launchConfetti();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [shouldCelebrate, status]);

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-border p-6 sm:p-8">
        {status === "checking" && (
          <>
            <h1 className="tracking-tight text-[1.9rem] sm:text-[2.6rem]">Confirming payment...</h1>
            <p className="leading-relaxed text-muted-foreground">
              Verifying your Stripe session now.
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 animate-pulse bg-orange-500" />
            </div>
          </>
        )}

        {status === "paid" && (
          <>
            <h1 className="tracking-tight text-[1.9rem] sm:text-[2.6rem]">Payment Confirmed</h1>
            <p className="leading-relaxed text-muted-foreground">
              Your deposit was verified. Next steps and onboarding details have been sent by email.
            </p>

            <section className="space-y-2 text-sm sm:text-base">
              <h2 className="text-lg font-medium">Next steps</h2>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep your selected package and add-ons handy for kickoff.</li>
                <li>• Watch for an onboarding response from Ward Studio.</li>
                <li>• Prepare required assets so production can start on schedule.</li>
              </ul>
            </section>

            <section className="space-y-2 text-sm sm:text-base">
              <h2 className="text-lg font-medium">Response window</h2>
              <p className="text-muted-foreground">
                You will receive a confirmation and next-step response within 24-48 hours.
              </p>
            </section>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="tracking-tight text-[1.9rem] sm:text-[2.6rem]">Payment Verification Needed</h1>
            <p className="leading-relaxed text-muted-foreground">
              {errorMessage || "We could not verify payment from this link."}
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-3">
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
