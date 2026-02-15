import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "Ward Studio - Design & Engineering Contractor | Zechariah Ward",
  description:
    "Professional contractor specializing in design systems, brand identity, web engineering with Next.js/React, and digital integrations.",
  metadataBase: new URL("https://wardstudio.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
