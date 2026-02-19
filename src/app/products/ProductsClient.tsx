"use client";

import {
  HoverTooltip,
  getTooltipMessage,
  useHoverTooltip,
} from "../components/HoverTooltip";
import {
  ProductPurchaseDrawer,
  type ProductPricingConfig,
} from "../components/products/ProductPurchaseDrawer";
import {
  createDetailflowConfig,
  type DetailflowStripeLinks,
} from "../../products/detailflow";

interface ProductsClientProps {
  stripeLinks?: DetailflowStripeLinks;
}

const inkbotPricingConfig: ProductPricingConfig = {
  productKey: "inkbot",
  subtitle:
    "Set up a simplified MEE6-style configuration with transparent pricing before purchase.",
  basePrice: 300,
  baseLabel: "InkBot base package",
  optionsHeading: "Core Community Pack",
  optionsHint: "Customizable settings in chat.",
  options: [
    { id: "welcome-message", label: "Welcome Message", price: 25 },
    { id: "auto-role-assign", label: "Auto-Role Assign", price: 40 },
    { id: "digest-schedule", label: "Digest Schedule", price: 35 },
    { id: "anti-spam-cooldown", label: "Anti-Spam Cooldown", price: 30 },
    { id: "moderation-logging", label: "Moderation Logging", price: 45 },
  ],
  managementOptions: [
    { id: "self-managed", label: "Self-managed", price: 0 },
    { id: "ward-managed", label: "Ward.studio managed", price: 250 },
  ],
};

export default function ProductsClient({ stripeLinks }: ProductsClientProps) {
  const { tooltipText, mousePosition, setTooltipText } = useHoverTooltip();
  const detailflowPricingConfig = createDetailflowConfig(
    stripeLinks || {
      consultation: "",
      buildDeposit: "",
      holdSpot: "",
    },
  );

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 md:px-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Back to Home
          </a>
        </div>

        <div className="space-y-16">
          <section
            id="detailflow-template"
            className="scroll-mt-24 space-y-5 rounded-2xl border border-border p-5 sm:p-7"
          >
            <h1 className="tracking-tight text-[1.8rem] sm:text-[2.4rem]">
              DetailFlow Template
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              Booking and confirmation product template for service businesses.
              Includes form validation, API-ready payload structure,
              owner/client email flow design, and mobile-first UI behavior.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <img
                src="/case-studies/detailflow-1.png"
                alt="DetailFlow product image 1"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Where leads stop ghosting and start booking.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/detailflow-2.png"
                alt="DetailFlow product image 2"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Validation that catches bad input before bad days.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/detailflow-3.png"
                alt="DetailFlow product image 3"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Clean confirmations, fewer follow-up headaches.")}
                onMouseLeave={() => setTooltipText("")}
              />
            </div>
            <div className="pt-1">
              <ProductPurchaseDrawer
                productName="DetailFlow Template"
                config={detailflowPricingConfig}
                variant="detailflow-pro"
                triggerLabel="Purchase"
                setTooltipText={setTooltipText}
              />
            </div>
          </section>

          <section
            id="inkbot-product"
            className="scroll-mt-24 space-y-5 rounded-2xl border border-border p-5 sm:p-7"
          >
            <h2 className="tracking-tight text-[1.8rem] sm:text-[2.4rem]">
              InkBot Product
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Community collaboration bot product focused on role-driven
              workflows, reaction state transitions, and moderation-safe command
              handling.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <img
                src="/case-studies/inkbot-1.png"
                alt="InkBot product image 1"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("From chat chaos to organized creative ops.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/inkbot-2.png"
                alt="InkBot product image 2"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Roles, rules, and reminders without the mess.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/inkbot-3.png"
                alt="InkBot product image 3"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Moderation logic that behaves when pressure spikes.")}
                onMouseLeave={() => setTooltipText("")}
              />
            </div>
            <div className="pt-1">
              <ProductPurchaseDrawer
                productName="InkBot Product"
                config={inkbotPricingConfig}
                triggerLabel="Purchase"
                setTooltipText={setTooltipText}
              />
            </div>
          </section>
        </div>
      </div>
      <HoverTooltip
        text={tooltipText}
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
      />
    </main>
  );
}
