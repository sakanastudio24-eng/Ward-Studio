import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/index.css";
import { Providers } from "./providers";
import { SITE_URL, toAbsoluteUrl } from "../config/site";

export const metadata: Metadata = {
  title: {
    default: "Ward Studio — Design & Engineering Systems",
    template: "%s | Ward Studio",
  },
  description:
    "Design systems, brand identity, and production-ready web engineering. Built by Zechariah Ward for growing businesses.",
  keywords: [
    "design contractor",
    "next.js developer",
    "web systems",
    "booking systems",
    "discord bot development",
    "brand identity",
    "ward studio",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/favicon-light.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-dark.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Ward Studio — Design & Engineering Systems",
    description:
      "Design systems, brand identity, and production-ready web engineering. Built by Zechariah Ward for growing businesses.",
    url: toAbsoluteUrl("/"),
    siteName: "Ward Studio",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ward Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ward Studio — Design & Engineering Systems",
    description:
      "Design systems, brand identity, and production-ready web engineering. Built by Zechariah Ward for growing businesses.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
