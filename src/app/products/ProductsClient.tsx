"use client";

import {
  HoverTooltip,
  getTooltipMessage,
  useHoverTooltip,
} from "../components/HoverTooltip";
import {
  ProductPurchaseDrawer,
} from "../components/products/ProductPurchaseDrawer";
import { createDetailflowConfig } from "../../products/detailflow";

export default function ProductsClient() {
  const { tooltipText, mousePosition, setTooltipText } = useHoverTooltip();
  const detailflowPricingConfig = createDetailflowConfig();

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
              Structured product systems built for real-world use.
              Configure what you need. Ship with clarity.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <img
                src="/case-studies/detailflow-1.png"
                alt="DetailFlow product image 1"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Structured intake and booking flow view.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/detailflow-2.png"
                alt="DetailFlow product image 2"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Validation and reliability states overview.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/detailflow-3.png"
                alt="DetailFlow product image 3"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Confirmation system and messaging behavior.")}
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
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="tracking-tight text-[1.8rem] sm:text-[2.4rem]">
                InkBot Product
              </h2>
              <span className="inline-flex items-center rounded-full border border-orange-300/40 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600">
                In development
              </span>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Modular community automation system focused on role-driven
              workflows, reliable state transitions, and maintainable moderation
              controls.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <img
                src="/case-studies/inkbot-1.png"
                alt="InkBot product image 1"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Role and flow architecture preview.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/inkbot-2.png"
                alt="InkBot product image 2"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Configurable moderation and reminder system.")}
                onMouseLeave={() => setTooltipText("")}
              />
              <img
                src="/case-studies/inkbot-3.png"
                alt="InkBot product image 3"
                className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                onMouseEnter={() => setTooltipText("Reliable command handling and event controls.")}
                onMouseLeave={() => setTooltipText("")}
              />
            </div>
            <div className="pt-1">
              <a
                href="/#contact"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onMouseEnter={() => setTooltipText("InkBot access is currently opened by request.")}
                onMouseLeave={() => setTooltipText("")}
              >
                Request access
              </a>
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
