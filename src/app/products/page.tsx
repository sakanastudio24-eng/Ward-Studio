import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import { toAbsoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Products — Ward Studio",
  description:
    "Structured product packages including DetailFlow and InkBot. Configurable, production-ready systems with clear onboarding.",
  keywords: [
    "ward studio products",
    "detailflow template",
    "inkbot discord bot",
    "booking system package",
    "discord bot package",
    "configurable systems",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products — Ward Studio",
    description:
      "Structured product packages including DetailFlow and InkBot. Configurable, production-ready systems with clear onboarding.",
    url: toAbsoluteUrl("/products"),
    siteName: "Ward Studio",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ward Studio products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Products — Ward Studio",
    description:
      "Structured product packages including DetailFlow and InkBot. Configurable, production-ready systems with clear onboarding.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
