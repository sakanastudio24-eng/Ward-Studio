import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ward Studio",
  description:
    "Privacy policy for Zward Studio website use, data handling, and third-party service integrations.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Back to Home
          </a>
        </div>

        <h1 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem] md:text-[3.5rem]">
          Privacy Policy
        </h1>
        <p className="mb-2 text-sm text-muted-foreground">Effective Date: February 19, 2026</p>
        <p className="mb-10 text-sm text-muted-foreground">Zward Studio respects your privacy.</p>

        <div className="space-y-8 text-sm sm:text-base">
          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">1. Information Collected</h2>
            <p className="text-muted-foreground">We may collect:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Name</li>
              <li>Email address</li>
              <li>Project configuration details</li>
              <li>Booking preferences</li>
              <li>Payment session identifiers</li>
            </ul>
            <p className="text-muted-foreground">
              We do not store credit card information, full payment details, or raw API keys submitted
              via external platforms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">2. How Information Is Used</h2>
            <p className="text-muted-foreground">Information is used to:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Deliver purchased services</li>
              <li>Configure templates</li>
              <li>Schedule consultations</li>
              <li>Communicate regarding projects</li>
            </ul>
            <p className="text-muted-foreground">
              We do not sell or rent personal data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">3. Third-Party Services</h2>
            <p className="text-muted-foreground">We may use third-party providers such as:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>Stripe (payment processing)</li>
              <li>Supabase (data storage)</li>
              <li>Cal.com (booking)</li>
              <li>Resend or email providers</li>
            </ul>
            <p className="text-muted-foreground">
              These services operate under their own privacy policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">4. Data Retention</h2>
            <p className="text-muted-foreground">
              Project-related information is stored only as long as necessary to deliver services
              or meet legal obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">5. Security</h2>
            <p className="text-muted-foreground">
              We implement reasonable technical measures to protect submitted information.
              Clients should never send sensitive credentials via unsecured email.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">6. Contact</h2>
            <p className="text-muted-foreground">
              For privacy inquiries: hello@zward.studio
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
