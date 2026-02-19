import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ward Studio",
  description:
    "DetailFlow Template terms, payment structure, and refund policy for Ward Studio projects.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Back to Portfolio
          </a>
        </div>

        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] tracking-tight mb-4">
          Terms & Conditions
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: February 18, 2026</p>

        <div className="space-y-8 text-sm sm:text-base">
          <section id="refund-policy" className="space-y-2 scroll-mt-24">
            <h2 className="text-xl tracking-tight">Refund Policy</h2>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">1. Consultation Bookings</h2>
            <p className="text-muted-foreground">
              Consultation sessions are refundable up to 24 hours before the scheduled call.
              No-shows or cancellations within 24 hours are non-refundable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">2. Build Deposits (Template Projects)</h2>
            <p className="text-muted-foreground">
              A build deposit reserves your production slot. Deposits are fully refundable until
              project kickoff and non-refundable once project work has started.
            </p>
            <p className="text-muted-foreground">
              Project kickoff occurs when the client submits required configuration details and
              minimum assets (logo, services, etc.), or 48 hours after confirmation of readiness is
              acknowledged by both parties. Once kickoff begins, development resources are allocated
              and the deposit becomes non-refundable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">3. Hold My Spot Reservations</h2>
            <p className="text-muted-foreground">
              If a client pays a reservation/hold fee: refundable within 24 hours of payment,
              non-refundable after 24 hours, and applies toward the final invoice if the project
              proceeds within 14 days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">4. Asset Delay Policy</h2>
            <p className="text-muted-foreground">
              If required assets are not submitted within 14 days, the project may be paused. The
              deposit may convert to credit toward future scheduling. No automatic refund is issued
              after work has been scheduled.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">5. Custom Work</h2>
            <p className="text-muted-foreground">
              Custom modifications outside the template scope are non-refundable once work has begun.
            </p>
          </section>

          <section id="terms-agreement" className="space-y-2 scroll-mt-24">
            <h2 className="text-xl tracking-tight">DetailFlow Template Terms & Agreement (v1)</h2>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">1. Scope of Work</h2>
            <p className="text-muted-foreground">
              Template packages include layout configuration, design customization within template
              limits, and deployment guidance (if applicable). Custom features beyond template scope
              require additional approval and payment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">2. Client Responsibilities</h2>
            <p className="text-muted-foreground">
              Clients must provide accurate business information, required assets (logo, service
              details, photos), booking method preference, and hosting access if self-managed. Ward
              Studio is not responsible for delays caused by missing or incomplete materials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">3. Payment Structure</h2>
            <p className="text-muted-foreground">
              Projects require a deposit to reserve development time. Remaining balance is due before
              final delivery or deployment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">4. Hosting & Third-Party Services</h2>
            <p className="text-muted-foreground">
              If the client chooses self-managed hosting (e.g., Vercel), third-party email services,
              or payment providers, the client is responsible for maintaining those services. Ward
              Studio is not responsible for outages, API changes, or platform limitations of
              third-party tools.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">5. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Clients receive rights to use the delivered template configuration for their business.
              Template source code ownership remains with Ward Studio unless otherwise agreed in
              writing. Resale, redistribution, or replication of template structure is prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Ward Studio is not liable for revenue loss, data loss due to client hosting
              misconfiguration, or third-party service failures.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">7. Refund Policy</h2>
            <p className="text-muted-foreground">
              Refund terms are governed by the Refund Policy outlined above.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
