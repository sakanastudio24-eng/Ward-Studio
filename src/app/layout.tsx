import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Ward Studio - Design & Engineering Contractor | Zechariah Ward",
    template: "%s | Ward Studio",
  },
  description:
    "Professional contractor specializing in design systems, brand identity, web engineering with Next.js/React, and digital integrations.",
  keywords: [
    "web design contractor",
    "next.js developer",
    "react engineer",
    "portfolio case studies",
    "automation systems",
    "booking system development",
    "discord bot development",
    "ward studio",
    "zechariah ward",
  ],
  metadataBase: new URL("https://wardstudio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ward Studio - Design & Engineering Contractor | Zechariah Ward",
    description:
      "Professional contractor specializing in design systems, brand identity, web engineering with Next.js/React, and digital integrations.",
    url: "https://wardstudio.com/",
    siteName: "Ward Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ward Studio - Design & Engineering Contractor | Zechariah Ward",
    description:
      "Professional contractor specializing in design systems, brand identity, web engineering with Next.js/React, and digital integrations.",
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
      </body>
    </html>
  );
}
