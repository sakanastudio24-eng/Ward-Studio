import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Products",
  description:
    "DetailFlow and InkBot product packages from Ward Studio with configurable options, management modes, and transparent pricing.",
  keywords: [
    "ward studio products",
    "detailflow template",
    "inkbot discord bot",
    "booking system package",
    "discord bot package",
    "purchase configuration",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products | Ward Studio",
    description:
      "Configure DetailFlow and InkBot packages with add-ons, management mode, and live pricing.",
    url: "https://wardstudio.com/products",
    siteName: "Ward Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products | Ward Studio",
    description:
      "Configure DetailFlow and InkBot packages with add-ons, management mode, and live pricing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsPage() {
  return (
    <ProductsClient
      stripeLinks={{
        consultation: process.env.STRIPE_LINK_CONSULTATION || "",
        buildDeposit: process.env.STRIPE_LINK_BUILD_DEPOSIT || "",
        holdSpot: process.env.STRIPE_LINK_HOLD_SPOT || "",
      }}
    />
  );
}
