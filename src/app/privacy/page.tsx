import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ward Studio",
  description:
    "Privacy policy for Ward Studio website inquiries, product onboarding submissions, and communication handling.",
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
        <p className="mb-10 text-sm text-muted-foreground">Effective date: February 19, 2026</p>

        <div className="space-y-8 text-sm sm:text-base">
          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you submit through forms, including name, email, company,
              project details, and onboarding configuration data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">2. How We Use Information</h2>
            <p className="text-muted-foreground">
              Information is used to respond to inquiries, deliver project onboarding, and provide
              project communication and support.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">3. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use third-party services such as hosting, email delivery, and payments. These
              services process data according to their own policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">4. Data Security</h2>
            <p className="text-muted-foreground">
              We apply reasonable safeguards for submitted data. Do not send passwords, API keys,
              or secrets through public forms or email.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl tracking-tight">5. Contact</h2>
            <p className="text-muted-foreground">
              For privacy requests or questions, contact Ward Studio through the website contact
              form.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
