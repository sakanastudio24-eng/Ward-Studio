import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ward Studio",
  description:
    "Terms and conditions for Zward Studio services, deposits, refunds, licensing, and client responsibilities.",
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
        <p className="text-sm text-muted-foreground mb-2">Effective Date: February 19, 2026</p>
        <p className="text-sm text-muted-foreground mb-2">Website: https://zward.studio</p>
        <p className="text-sm text-muted-foreground mb-10">
          Owner: Zechariah Ward (&quot;Zward Studio&quot;, &quot;Ward Studio&quot;, &quot;we&quot;, &quot;us&quot;)
        </p>

        <div className="space-y-8 text-sm sm:text-base">
          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing this website or purchasing any product or service from Zward Studio, you agree to be
              bound by these Terms &amp; Conditions.
            </p>
            <p className="text-muted-foreground">
              If you do not agree, please do not use this website or purchase services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">2. Services Provided</h2>
            <p className="text-muted-foreground">
              Zward Studio provides design and development services, including but not limited to:
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Website templates</li>
              <li>Custom website development</li>
              <li>Booking and automation systems</li>
              <li>System configuration</li>
              <li>Consultation and strategy calls</li>
              <li>Digital product builds</li>
            </ul>
            <p className="text-muted-foreground">
              All services are delivered as described at the time of purchase or written agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">3. Payments &amp; Deposits</h2>
            <h3 className="text-lg tracking-tight">3.1 Deposits</h3>
            <p className="text-muted-foreground">
              Certain products and services require a deposit to reserve scheduling, lock project scope, and begin
              configuration or development. Deposits are applied toward the total project cost.
            </p>
            <h3 className="text-lg tracking-tight">3.2 Final Payment</h3>
            <p className="text-muted-foreground">
              Remaining balances are due before final deployment, code transfer, asset delivery, or hosting handoff.
              Failure to complete final payment may result in delayed delivery.
            </p>
            <p className="text-muted-foreground">
              All payments are processed through third-party providers (for example, Stripe).
            </p>
          </section>

          <section id="refund-policy" className="space-y-2 scroll-mt-24">
            <h2 className="text-xl tracking-tight">4. Refund Policy</h2>
            <p className="text-muted-foreground">
              Zward Studio operates on a time-reserved, digital product model. Refund terms are as follows.
            </p>
            <h3 className="text-lg tracking-tight">4.1 Deposits</h3>
            <p className="text-muted-foreground">
              Deposits are refundable only if no development or configuration work has begun, and no consultation
              or onboarding session has taken place. Once work has started, deposits are non-refundable.
            </p>
            <h3 className="text-lg tracking-tight">4.2 Template Products</h3>
            <p className="text-muted-foreground">
              Template products (including DetailFlow and similar system builds) may be refunded within 3 calendar
              days of purchase only if no configuration work has started and no onboarding assets have been submitted.
            </p>
            <p className="text-muted-foreground">
              Once configuration or setup begins, the purchase becomes non-refundable. Templates are licensed digital
              products and cannot be returned once delivered or configured.
            </p>
            <h3 className="text-lg tracking-tight">4.3 Custom Development</h3>
            <p className="text-muted-foreground">
              Custom development services are non-refundable once development begins.
            </p>
            <p className="text-muted-foreground">
              If a client cancels after work has started, completed deliverables up to that point may be provided.
              Deposits remain non-refundable. Additional costs may apply depending on scope progress.
            </p>
            <h3 className="text-lg tracking-tight">4.4 Project Inactivity</h3>
            <p className="text-muted-foreground">
              If required materials (assets, content, credentials) are not provided within 30 days, the project may
              be marked inactive. Deposits remain non-refundable. Reactivation may require a restart or scope review.
            </p>
            <h3 className="text-lg tracking-tight">4.5 Chargebacks</h3>
            <p className="text-muted-foreground">
              Clients agree to contact Zward Studio before initiating any chargeback or payment dispute. Fraudulent
              disputes may result in service termination and refusal of future services.
            </p>
          </section>

          <section id="terms-agreement" className="space-y-2 scroll-mt-24">
            <h2 className="text-xl tracking-tight">5. Client Responsibilities</h2>
            <p className="text-muted-foreground">
              Clients agree to provide accurate project information, supply necessary assets and credentials, not
              transmit sensitive credentials through unsecured channels, and respond to project communication in a
              timely manner.
            </p>
            <p className="text-muted-foreground">
              Delays caused by missing materials may impact timelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">6. Intellectual Property</h2>
            <h3 className="text-lg tracking-tight">6.1 Client Content</h3>
            <p className="text-muted-foreground">
              Clients retain ownership of their brand assets, content, and materials.
            </p>
            <h3 className="text-lg tracking-tight">6.2 Template Licensing</h3>
            <p className="text-muted-foreground">
              Template purchases grant a non-transferable, non-resellable license for use by the purchasing business.
            </p>
            <p className="text-muted-foreground">Templates may not be resold, redistributed, shared publicly, or republished as competing products.</p>
            <h3 className="text-lg tracking-tight">6.3 Custom Work</h3>
            <p className="text-muted-foreground">
              Custom work ownership transfers upon full payment. Zward Studio may display completed projects in
              portfolio materials unless otherwise agreed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">7. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Projects may integrate third-party tools including hosting providers, payment processors, booking
              platforms, database services, and email systems.
            </p>
            <p className="text-muted-foreground">
              Zward Studio is not responsible for outages, pricing changes, or service disruptions from third-party providers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              All services are provided &quot;as-is.&quot;
            </p>
            <p className="text-muted-foreground">
              Zward Studio shall not be liable for lost revenue, indirect or consequential damages, third-party outages,
              client misconfiguration of credentials, or business losses due to external platform issues.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">9. Modifications to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to update these Terms at any time. Updates will be posted on this page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">10. Contact</h2>
            <p className="text-muted-foreground">
              For questions regarding these Terms: hello@zward.studio
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
