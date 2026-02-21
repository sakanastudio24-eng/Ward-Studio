import type { Metadata } from "next";
import { EmbeddedCheckoutClient } from "./EmbeddedCheckoutClient";

type EmbeddedCheckoutPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
  title: "Embedded Checkout | Ward Studio",
  description: "Stripe embedded checkout for DetailFlow deposit payment.",
  robots: {
    index: false,
    follow: false,
  },
};

function getParam(searchParams: EmbeddedCheckoutPageProps["searchParams"], key: string): string {
  const value = searchParams?.[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function getAddonIds(value: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function EmbeddedCheckoutPage({ searchParams }: EmbeddedCheckoutPageProps) {
  const orderId = getParam(searchParams, "orderId");
  const orderUuid = getParam(searchParams, "orderUuid");
  const tierId = getParam(searchParams, "tier") || "starter";
  const addonIds = getAddonIds(getParam(searchParams, "addons"));
  const customerEmail = getParam(searchParams, "email");

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 md:px-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="tracking-tight text-[1.8rem] sm:text-[2.3rem]">DetailFlow Embedded Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Complete your payment below. You will be redirected to confirmation after payment.
        </p>
        <div className="overflow-hidden rounded-xl border border-border p-2 sm:p-4">
          <EmbeddedCheckoutClient
            orderId={orderId}
            orderUuid={orderUuid}
            tierId={tierId}
            addonIds={addonIds}
            customerEmail={customerEmail}
          />
        </div>
      </div>
    </main>
  );
}
