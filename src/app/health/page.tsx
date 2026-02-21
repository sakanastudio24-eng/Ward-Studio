import type { Metadata } from "next";
import { HealthDashboardClient } from "./HealthDashboardClient";

export const metadata: Metadata = {
  title: "System Health | Ward Studio",
  description: "Human-readable status board for API and webhook endpoint checks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HealthPage() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 md:px-12">
      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">System Health</h1>
        <p className="text-sm text-muted-foreground">
          Readable endpoint and webhook status. For raw output use{" "}
          <code className="rounded bg-muted px-1 py-0.5">/api/health/endpoints</code> or{" "}
          <code className="rounded bg-muted px-1 py-0.5">/api/health/endpoints?format=human</code>.
        </p>
        <HealthDashboardClient />
      </section>
    </main>
  );
}
