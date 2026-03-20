import type { Metadata } from "next";
import { EmbeddedCheckoutReturnClient } from "./EmbeddedCheckoutReturnClient";

export const metadata: Metadata = {
  title: "Checkout Return | Ward Studio",
  description: "Stripe embedded checkout return page for DetailFlow payment confirmation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbeddedCheckoutReturnPage() {
  return <EmbeddedCheckoutReturnClient />;
}
