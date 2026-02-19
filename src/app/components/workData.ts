import type { ProjectCardProps } from "./ProjectCard";

export type WorkScope = "home" | "all-projects";
export type WorkSection = "engineering" | "case-study";
export type ProjectVisibility = WorkScope[];

export interface WorkProject extends Omit<ProjectCardProps, "setTooltipText"> {
  section: WorkSection;
  visibility: ProjectVisibility;
}

export const allWorkProjects: WorkProject[] = [
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    title: "DetailFlow / Cruz n Clean",
    statusLabel: "Production Ready",
    outcome: "Booking and confirmation system for service businesses",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    summary:
      "DetailFlow / Cruz n Clean is a production booking and confirmation flow designed for service businesses. It combines a mobile-first front end, API-backed submission handling, and owner/client email delivery. The system focuses on clarity, speed, and operational reliability.",
    whatItCanDo: [
      "Structured booking intake",
      "Client confirmation messaging",
      "Owner notification system",
      "API-based submission handling",
      "Email template rendering",
      "Mobile-first UI",
    ],
    testsAndEdgeCases: [
      "Required field validation",
      "Email format verification",
      "Rate-limiting protection",
      "Failed API fallback handling",
      "Timezone-safe scheduling",
    ],
    skillReflection:
      "This project strengthened full-stack flow design, form validation strategy, API integration patterns, email delivery workflows, and production UX thinking.",
    skillsUsed: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "REST APIs",
      "Email Automation",
      "Form Validation",
      "Mobile-First Design",
    ],
    context:
      "Small service businesses need professional booking flows without expensive SaaS lock-in.",
    problem:
      "Without a structured intake and confirmation path, bookings become manual, error-prone, and harder to scale.",
    approach:
      "Designed in Figma, translated into a production-ready Next.js interface, and integrated with backend routing plus email confirmations.",
    tools: ["Next.js", "TypeScript", "FastAPI", "Resend", "Tailwind CSS"],
    resultDetail:
      "The booking flow now supports reliable intake, confirmation messaging, and clear owner visibility from submission to follow-up.",
    image: "/case-studies/detailflow-1.png",
    galleryImages: [
      "/case-studies/detailflow-1.png",
      "/case-studies/detailflow-2.png",
      "/case-studies/detailflow-3.png",
      "/case-studies/detailflow-4.png",
      "/case-studies/detailflow-5.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    productLink: "/products#detailflow-template",
    productLabel: "View Product",
    placeholderColor: "#0f766e",
  },
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    title: "InkBot Discord Bot",
    outcome:
      "Modular event-driven collaboration system for structured matching, digests, and moderation safety",
    stack: ["Python", "discord.py", "AsyncIO", "Event Handling"],
    context:
      "I built InkBot because creative servers become noisy and chaotic. It started as a simple command bot and evolved into a modular system built with cogs and scheduled jobs.",
    problem:
      "Collaboration requests were hard to track, role assignment was inconsistent, and moderation needed permission-aware controls that would not over-automate the community.",
    approach:
      "Implemented structured role-based group matching, reaction-driven state transitions, scheduled digests, operational analytics tracking, rate limiting and validation, and permission-aware moderation commands.",
    tools: [
      "Python",
      "discord.py",
      "AsyncIO",
      "Rate Limiting",
      "Event Handling",
      "Role-Based Access Control",
      "Scheduled Jobs",
      "JSON State Storage",
      "Command Validation",
      "UX Architecture",
    ],
    resultDetail:
      "Tested edge cases include case-insensitive role matching, cooldown enforcement, channel validation failures, permission hierarchy handling, thread fallback logic, and reaction-based state locking. This project strengthened asynchronous event architecture, distributed state tracking, permission-aware logic systems, lightweight storage design, and community UX thinking.",
    image: "/case-studies/inkbot-1.png",
    galleryImages: [
      "/case-studies/inkbot-1.png",
      "/case-studies/inkbot-2.png",
      "/case-studies/inkbot-3.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    productLink: "/products#inkbot-product",
    productLabel: "View Product",
    placeholderColor: "#1d4ed8",
  },
  {
    section: "engineering",
    visibility: ["all-projects"],
    title: "Terminal Adventure - Systems-Driven CLI Game",
    outcome: "Systems-focused terminal RPG with modular state-driven gameplay",
    stack: ["Next.js", "React 19", "TypeScript", "xterm.js"],
    summary:
      "Terminal RPG is a systems-driven CLI game focused on logic control, state safety, and interactive design. It evolved from a single combat loop into modular components for player, enemy, combat engine, and game state. It is still in active development.",
    whatItCanDo: [
      "Turn-based combat logic",
      "Dynamic stat updates",
      "Branching choices",
      "State persistence",
      "Structured modular architecture",
    ],
    testsAndEdgeCases: [
      "Invalid input handling",
      "Health underflow prevention",
      "State reset handling",
      "Conditional branching validation",
      "Graceful termination paths",
    ],
    skillReflection:
      "This project sharpened algorithmic thinking, game loop control, state mutation safety, input validation patterns, and modular architecture planning.",
    skillsUsed: [
      "Python",
      "CLI Systems",
      "State Machines",
      "Input Validation",
      "Modular Design",
      "Game Logic",
      "Architecture",
      "Terminal UX",
    ],
    context:
      "Built to explore logic systems, state management, and interactive design in a controlled environment.",
    problem:
      "Gameplay systems need deterministic control over state transitions, input handling, and loop safety.",
    approach:
      "Started as a single combat loop and expanded into modular components for player, enemy, combat engine, and game state.",
    tools: ["Next.js 15", "xterm.js", "Vitest", "Playwright", "Tailwind CSS"],
    resultDetail:
      "Core architecture is active with progressive feature layering, and it remains in development.",
    image: "/case-studies/terminal-rpg-1.png",
    galleryImages: ["/case-studies/terminal-rpg-1.png"],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    placeholderColor: "#7c2d12",
  },
  {
    section: "case-study",
    visibility: ["home", "all-projects"],
    title: "DetailFlow / Cruz n Clean",
    statusLabel: "Production Ready",
    outcome:
      "Case study: booking and confirmation system with validated intake and messaging",
    stack: ["Figma", "Next.js", "Tailwind CSS"],
    summary:
      "DetailFlow / Cruz n Clean was designed to give small service businesses a production-grade booking path without SaaS lock-in. It combines a clear booking UI, API submission flow, and owner/client confirmation messaging. The experience is optimized for mobile and desktop use.",
    whatItCanDo: [
      "Structured booking intake",
      "Client confirmation messaging",
      "Owner notification system",
      "API-based submission handling",
      "Email template rendering",
      "Mobile-first UI",
    ],
    testsAndEdgeCases: [
      "Required field validation",
      "Email format verification",
      "Rate-limiting protection",
      "Failed API fallback handling",
      "Timezone-safe scheduling",
    ],
    skillReflection:
      "This project strengthened full-stack flow design, form validation strategy, API integration patterns, email delivery workflows, and production UX thinking.",
    skillsUsed: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "REST APIs",
      "Email Automation",
      "Form Validation",
      "Mobile-First Design",
    ],
    context:
      "Small service businesses need professional booking flows without expensive SaaS lock-in.",
    problem:
      "Without a validated intake and communication system, scheduling quality drops and owner workload increases.",
    approach:
      "Designed in Figma, translated to production-ready Next.js UI, and integrated with backend routing and email confirmations.",
    tools: ["Component design", "Interaction states", "Form UX", "Accessibility pass"],
    resultDetail:
      "The final system supports reliable booking intake, clear confirmations, and production-grade UX behavior.",
    image: "/case-studies/detailflow-1.png",
    galleryImages: [
      "/case-studies/detailflow-1.png",
      "/case-studies/detailflow-2.png",
      "/case-studies/detailflow-3.png",
      "/case-studies/detailflow-4.png",
      "/case-studies/detailflow-5.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    productLink: "/products#detailflow-template",
    productLabel: "View Product",
    placeholderColor: "#14b8a6",
  },
  {
    section: "case-study",
    visibility: ["home", "all-projects"],
    title: "InkBot Discord Bot",
    outcome:
      "Case study: structured collaboration UX for Discord communities without over-automation",
    stack: ["Discord UX", "Command Design", "Event Architecture"],
    context:
      "This case study documents why InkBot was built: creative communities need structure without losing flexibility. It began as a basic command bot and matured into a modular event-driven platform.",
    problem:
      "Without reliable role matching, reaction state control, and moderation-safe commands, community coordination becomes inconsistent and hard to scale.",
    approach:
      "Designed role-based matching flows, reaction-driven transitions, scheduled digest loops, analytics checkpoints, and validation paths that keep operations stable across channel and permission edge cases.",
    tools: [
      "Python",
      "discord.py",
      "Role-Based Access Control",
      "Scheduled Jobs",
      "Command Validation",
      "UX Architecture",
    ],
    resultDetail:
      "Coverage included case-insensitive role matching, cooldown controls, channel validation failures, permission hierarchy handling, thread fallback logic, and reaction-based state locking. Core skill growth came from asynchronous event architecture, distributed state tracking, permission-aware logic, lightweight storage, and community UX design.",
    image: "/case-studies/inkbot-2.png",
    galleryImages: [
      "/case-studies/inkbot-1.png",
      "/case-studies/inkbot-2.png",
      "/case-studies/inkbot-3.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    productLink: "/products#inkbot-product",
    productLabel: "View Product",
    placeholderColor: "#2563eb",
  },
  {
    section: "case-study",
    visibility: ["home", "all-projects"],
    title: "Drawer Flow",
    statusLabel: "Vr 1",
    outcome:
      "Case study: post-purchase drawer architecture with reusable checkout components and one combined flow",
    stack: ["React", "TypeScript", "Tailwind CSS"],
    summary:
      "Drawer Flow packages the checkout experience into reusable units, then documents the entire journey from selection to post-purchase handoff in one unified case study path.",
    context:
      "The checkout system needed reusable UI boundaries and a clear story for how each drawer component contributes to a complete purchase and handoff flow.",
    problem:
      "Without separated component responsibilities, post-purchase handoff and analytics-ready transitions become hard to reason about and harder to maintain.",
    approach:
      "Split the experience into four drawer components, then validate the fifth combined flow that connects plan selection, add-ons, readiness, checkout, and post-purchase actions.",
    tools: [
      "CheckoutDrawer",
      "PlanSelector",
      "AddonSelector",
      "ReadinessGate",
      "SuccessDrawer",
      "State modeling",
    ],
    resultDetail:
      "The flow now has explicit component boundaries and a unified post-purchase sequence that can be used for implementation walkthroughs and analytics mapping.",
    whatItCanDo: [
      "Part 1: PlanSelector for tier decisions",
      "Part 2: AddonSelector for add-on logic",
      "Part 3: ReadinessGate for required checks",
      "Part 4: SuccessDrawer for post-purchase handoff",
      "Part 5: Full combined flow across all four components",
    ],
    testsAndEdgeCases: [
      "Transition lock while redirecting/confirming",
      "Retry behavior after payment or verification issues",
      "Copy/config handoff events tracked from user actions",
      "Mobile drawer height and footer reachability",
      "Post-purchase content order and CTA visibility",
    ],
    skillReflection:
      "This case study reflects component orchestration, state transition design, and post-purchase UX structuring with reusable interfaces.",
    skillsUsed: [
      "Component Architecture",
      "Type-safe State",
      "Flow Orchestration",
      "UX Sequencing",
      "Mobile Drawer Design",
    ],
    hidePreviewImage: true,
    interactiveOverlayParts: [
      {
        id: "part-1",
        label: "Part 1",
        title: "PlanSelector",
        description: "Choose the tier and establish the base package scope.",
        bullets: [
          "Tier choice drives baseline pricing and included deliverables.",
          "Selection updates totals used by downstream checkout steps.",
          "Sets context for add-on recommendations and constraints.",
        ],
      },
      {
        id: "part-2",
        label: "Part 2",
        title: "AddonSelector",
        description: "Toggle add-ons and enforce compatibility rules in real time.",
        bullets: [
          "Adds optional capabilities like booking setup or email styling.",
          "Applies conflict and requirement rules from shared validation logic.",
          "Recalculates total, deposit, and remaining balance immediately.",
        ],
      },
      {
        id: "part-3",
        label: "Part 3",
        title: "ReadinessGate",
        description: "Run pre-checkout readiness so submission quality stays high.",
        bullets: [
          "Flags missing required details before payment starts.",
          "Prevents risky transitions when prerequisites are incomplete.",
          "Ensures the checkout step receives validated configuration state.",
        ],
      },
      {
        id: "part-4",
        label: "Part 4",
        title: "SuccessDrawer",
        description: "Handle post-purchase actions, config handoff, and next steps.",
        bullets: [
          "Generates copy-ready config and handoff checklist.",
          "Supports booking CTA, resend, support, and copy interactions.",
          "Shows clear upload and secure setup instructions after purchase.",
        ],
      },
      {
        id: "part-5",
        label: "Part 5",
        title: "Unified Flow",
        description:
          "All four pieces connected in one end-to-end sequence from selection to post-purchase handoff.",
        bullets: [
          "PlanSelector -> AddonSelector -> ReadinessGate -> SuccessDrawer.",
          "State transitions remain explicit through checkout and confirmation.",
          "Creates a reusable blueprint for analytics and future product variants.",
        ],
      },
    ],
    image: "/case-studies/cruzn-clean-ux-placeholder.svg",
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    productLink: "/products#detailflow-template",
    productLabel: "View Product",
    placeholderColor: "#ea580c",
  },
  {
    section: "case-study",
    visibility: ["all-projects"],
    title: "Terminal Adventure - Systems-Driven CLI Game",
    outcome:
      "Case study: systems-driven CLI game architecture and state-safe interaction design",
    stack: ["xterm.js", "ANSI styling", "Interaction design"],
    summary:
      "Terminal RPG was built to explore logic systems, state management, and interaction design through a command-line game model. It began with one combat loop and evolved into modular components for player, enemy, combat engine, and game state. The project is still in development.",
    whatItCanDo: [
      "Turn-based combat logic",
      "Dynamic stat updates",
      "Branching choices",
      "State persistence",
      "Structured modular architecture",
    ],
    testsAndEdgeCases: [
      "Invalid input handling",
      "Health underflow prevention",
      "State reset handling",
      "Conditional branching validation",
      "Graceful termination paths",
    ],
    skillReflection:
      "This project sharpened algorithmic thinking, game loop control, state mutation safety, input validation patterns, and modular architecture planning.",
    skillsUsed: [
      "Python",
      "CLI Systems",
      "State Machines",
      "Input Validation",
      "Modular Design",
      "Game Logic",
      "Architecture",
      "Terminal UX",
    ],
    context:
      "Built to explore logic systems, state management, and interactive design in a controlled environment.",
    problem:
      "Terminal experiences require strict input handling and safe state transitions to stay stable.",
    approach:
      "Started as a single combat loop and expanded into modular components for player, enemy, combat engine, and game state.",
    tools: ["Terminal renderer", "Event design", "Gameplay copy", "Runtime notes"],
    resultDetail:
      "Gameplay systems are active and continue to evolve while development is in progress.",
    image: "/case-studies/terminal-rpg-1.png",
    galleryImages: ["/case-studies/terminal-rpg-1.png"],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    placeholderColor: "#92400e",
  },
];
