import { PRICING } from "../lib/pricing";
import type { DetailflowAddonConfig } from "../app/components/products/CheckoutDrawer";

export function createDetailflowConfig(): DetailflowAddonConfig {
  return {
    productKey: "detailflow",
    subtitle:
      "Structured product systems built for real-world use. Configure what you need. Ship with clarity.",
    defaultPackageId: "starter",
    timelineEstimate: "Estimated launch window: 7-14 days once required assets are in.",
    requiredItems: [
      "Business name + contact info",
      "Service list + rough pricing",
      "At least 6 photos",
      "Booking preference (link, iframe, or contact-only)",
    ],
    packagePresets: [
      {
        id: "starter",
        label: "Starter",
        description: "For solo detailers just starting out.",
      },
      {
        id: "growth",
        label: "Growth",
        description: "For businesses ready to scale bookings.",
      },
      {
        id: "pro_launch",
        label: "Pro Launch",
        description: "For owners who want smoother setup and launch support.",
      },
    ],
    booking: {
      externalLinkMessage:
        "Easiest setup. You keep your booking system. We just route customers to it.",
      iframeMessage:
        "Keeps users on your site. Some providers allow embed; if not, we fall back to link mode.",
      iframeWarning: "Some providers block iframes.",
      contactOnlyMessage:
        "Best when you prefer to approve requests manually. No scheduling tool required.",
    },
    readinessChecklist: {
      identity: "I have my logo or business name finalized.",
      photos: "I have at least 6 photos.",
      bookingMethod: "I have a booking method (link or contact-only).",
    },
    readinessGate: {
      readyLabel: "Ready now",
      notReadyLabel: "Not ready",
      forcedConsultationMessage:
        "Readiness is incomplete. Complete the checklist or switch to Not ready.",
    },
    pricing: PRICING,
    generalAddOns: [
      {
        id: "advanced_email_styling",
        title: "Advanced Email Styling",
        bestFor: "teams that want branded, polished communication templates",
        includes: [
          "Custom branded customer receipt",
          "Owner notification layout",
          "Deposit confirmation design",
          "Email styling beyond basic text",
        ],
      },
      {
        id: "analytics_deep_setup",
        title: "Analytics Deep Setup",
        bestFor: "teams that track conversion and booking behavior",
        includes: [
          "Google Analytics integration",
          "Conversion tracking",
          "Booking click tracking",
          "Event tracking setup",
        ],
      },
      {
        id: "hosting_help",
        title: "Hosting Help",
        bestFor: "teams that need deployment and DNS setup help",
        includes: [
          "Vercel deployment guidance",
          "Domain DNS help",
          "Email DNS help",
          "Environment variable walkthrough",
        ],
      },
    ],
    readinessAddOns: [
      {
        id: "content_structuring",
        title: "Content Structuring",
        bestFor: "clients without clear messaging",
        includes: [
          "Service descriptions written/refined",
          "FAQ creation",
          "Booking explanation text",
          "Call-to-action optimization",
        ],
      },
      {
        id: "brand_polish",
        title: "Brand Polish",
        bestFor: "clients without finalized branding",
        includes: [
          "Basic logo refinement",
          "Color system refinement",
          "Typography pairing",
          "Visual consistency pass",
        ],
      },
      {
        id: "photo_optimization",
        title: "Photo Optimization",
        bestFor: "clients with low-quality images",
        includes: ["Cropping for web", "Compression", "Hero image formatting"],
      },
      {
        id: "booking_setup_assistance",
        title: "Booking Readiness Setup",
        bestFor: "clients unsure about booking tools",
        includes: [
          "Tool recommendation",
          "Configuration guidance",
          "Setup walkthrough",
          "Time zone configuration",
        ],
      },
      {
        id: "strategy_call",
        title: "Free 20-Min Strategy Call",
        bestFor: "clients unsure what they need before kickoff",
        includes: [
          "Understand your goals",
          "See if the template is the right fit",
          "Recommend the best tier",
          "No pressure, no sales pitch",
        ],
      },
    ],
    conflictPairs: [["booking_setup_assistance", "strategy_call"]],
    compatibilityRules: {
      cannotCombine: [
        "Booking Readiness Setup + Free 20-Min Strategy Call",
        "Self-Managed Hosting + Ward Managed Hosting",
        "No Booking + Deposit Collection",
      ],
      stronglyRecommended: [
        "No logo -> Brand Polish",
        "No written services -> Content Structuring",
      ],
    },
    refundSummary: [
      "Consultation bookings are refundable up to 24 hours before the scheduled call.",
      "Build deposits are refundable until kickoff and non-refundable after kickoff.",
      "Hold my spot fee is refundable within 24 hours, then non-refundable.",
      "Kickoff starts when required config and minimum assets are received.",
    ],
    checkoutEndpoints: {
      orderCreate: {
        method: "POST",
        path: "/api/orders/create",
        label: "Create order record",
        responseFields: [
          { key: "order_id", label: "Persistent order id for payment and onboarding." },
        ],
      },
      create: {
        method: "POST",
        path: "/api/checkout/create",
        label: "Create checkout session",
        responseFields: [
          { key: "url", label: "Checkout redirect URL for Stripe/success flow." },
          { key: "sessionId", label: "Server session id used for verify calls." },
          { key: "orderId", label: "Order id for post-purchase state and emails." },
          { key: "tierId", label: "Tier server accepted for this order." },
          { key: "addonIds", label: "Add-ons server accepted for this order." },
          { key: "deposit", label: "Deposit amount due now." },
          { key: "remaining", label: "Remaining balance after deposit." },
          { key: "amountTotal", label: "Total order amount." },
          { key: "currency", label: "Currency for all amounts." },
        ],
      },
      onboardingSubmit: {
        method: "POST",
        path: "/api/onboarding/submit",
        label: "Submit setup details",
        responseFields: [
          { key: "ok", label: "True when onboarding details are stored." },
          { key: "warning", label: "Optional notice when sensitive keys are removed." },
        ],
      },
      verify: {
        method: "GET",
        path: "/api/checkout/verify",
        label: "Verify checkout session",
        optional: true,
        responseFields: [
          { key: "paid", label: "True when checkout is captured and verified." },
          { key: "status", label: "Verification/payment status for UI state." },
          { key: "sessionId", label: "Session id returned from server verification." },
          { key: "orderId", label: "Order id to persist in success flow." },
          { key: "tierId", label: "Paid tier id." },
          { key: "addonIds", label: "Paid add-on ids." },
          { key: "deposit", label: "Paid deposit amount." },
          { key: "remaining", label: "Remaining balance amount." },
          { key: "amountTotal", label: "Total order amount." },
          { key: "currency", label: "Currency for all amounts." },
          { key: "customerEmail", label: "Customer email tied to the checkout." },
        ],
      },
    },
    strategyCallUrl:
      process.env.NEXT_PUBLIC_STRATEGY_CALL_URL || "https://cal.com/",
    secureUploadUrl: process.env.NEXT_PUBLIC_SECURE_UPLOAD_URL || "#",
    confirmationEmail: "customer@email.com",
    supportEmail: "support@wardstudio.com",
  };
}
