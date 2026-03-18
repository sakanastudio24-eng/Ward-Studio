import type { ProjectCardProps } from "./ProjectCard";

export type WorkScope = "home" | "all-projects";
export type WorkSection = "engineering" | "case-study";
export type ProjectVisibility = WorkScope[];

export interface WorkProject extends Omit<ProjectCardProps, "setTooltipText"> {
  section: WorkSection;
  visibility: ProjectVisibility;
  homeFeatured?: boolean;
}

export const allWorkProjects: WorkProject[] = [
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    homeFeatured: true,
    title: "GameMate Social Mobile App",
    statusLabel: "Contract Ready",
    outcome:
      "Mobile social platform for gamers to share clips, connect with teammates, and discover communities in one streamlined app",
    stack: ["React Native", "Django REST Framework", "PostgreSQL"],
    summary:
      "GameMate is a mobile social platform designed for gamers to share clips, connect with teammates, and discover communities based on the games they play.",
    whatItCanDo: [
      "Social feed for gameplay highlights and clips",
      "Group discovery by game title",
      "Friend connections and activity visibility",
      "Personalized onboarding based on favorite games",
      "Profile, notifications, privacy, and account controls",
    ],
    testsAndEdgeCases: [
      "Authentication/session validation",
      "Feed rendering with mixed media payloads",
      "Group discovery and membership filtering",
      "Privacy/notification preference persistence",
      "Navigation consistency across Feed, Groups, Social, and Profile",
    ],
    skillReflection:
      "GameMate shows full product thinking for social platforms by bringing discovery, connection, and community systems into one mobile first experience.",
    skillsUsed: ["React Native", "Django REST Framework", "PostgreSQL"],
    context:
      "Gamers usually split activity across social feeds, chat apps, and forums. GameMate was built to unify those workflows into one focused platform.",
    problem:
      "Gamers typically rely on several platforms to share clips, communicate with teams, and find teammates, which creates a fragmented experience and constant app switching.",
    approach:
      "Designed a dark, fast mobile interface with simple navigation between Feed, Groups, Social, and Profile, then implemented a centralized system for content discovery, friend connections, and group organization.",
    tools: ["React Native", "Django REST Framework", "PostgreSQL"],
    resultDetail:
      "The project demonstrates a complete social platform flow from onboarding to community interaction, with a structure ready for MVP rollout and iterative expansion.",
    image: "/case-studies/gamemate-feed.png",
    previewFrame: "phone",
    previewObjectFit: "contain",
    galleryFrame: "phone",
    galleryObjectFit: "contain",
    galleryAspectClassName: "aspect-[9/16]",
    galleryMaxWidthClassName: "max-w-[220px] sm:max-w-[280px]",
    galleryImages: [
      "/case-studies/gamemate-feed.png",
      "/case-studies/gamemate-comments.png",
      "/case-studies/gamemate-groups.png",
      "/case-studies/gamemate-login.png",
      "/case-studies/gamemate-onboard-1.png",
      "/case-studies/gamemate-onboard-2.png",
      "/case-studies/gamemate-onboard-3.png",
      "/case-studies/gamemate-onboard-4.png",
      "/case-studies/gamemate-settings.png",
      "/case-studies/gamemate-social.png",
      "/case-studies/gamemate-why-this-appeared.png",
    ],
    androidPreviewQrLink:
      "https://expo.dev/accounts/zech1v1/projects/GameMate/builds/c05082bb-b924-483d-bd22-30debca190be",
    androidPreviewQrLabel: "Show QR (Android Preview)",
    link: "https://github.com/sakanastudio24-eng/Game-Mate",
    linkLabel: "GitHub",
    placeholderColor: "#0f172a",
  },
  {
    section: "case-study",
    visibility: ["home", "all-projects"],
    homeFeatured: true,
    title: "Aurora Museum UX Case Study",
    statusLabel: "Contract Ready",
    outcome:
      "UX redesign for a museum website focused on clarity, discoverability, and accessibility for visitors, families, members, and donors",
    stack: ["UX Research", "Information Architecture", "Figma Prototype"],
    summary:
      "Aurora Museum is a UX design case study for the fictional Aurora Museum of Design, Art and Creativity in Palm Springs, California. The project redesigns the museum's digital presence through research, personas, wireframes, and a fully interactive prototype.",
    whatItCanDo: [
      "Clear information architecture for tickets, exhibitions, events, and programs",
      "Inclusive persona based UX decisions",
      "Fully navigable interactive prototype",
      "Consistent design system aligned to museum brand identity",
    ],
    testsAndEdgeCases: [
      "Fast access to ticketing and location details from multiple entry points",
      "Event and exhibition discoverability without deep navigation",
      "Membership and donor path clarity",
      "Accessible structure for a wide range of visitor needs",
      "Consistency across multi page navigation and hierarchy",
    ],
    skillReflection:
      "The case study highlights strengths in user research, information architecture, interface design, and interactive prototyping.",
    skillsUsed: ["User Research", "UX Strategy", "Empathy Mapping", "Wireframing", "Interactive Prototyping"],
    context:
      "Many museum websites bury critical information behind confusing navigation, making it harder for visitors to plan visits or discover programs.",
    problem:
      "Museum visitors often need immediate access to locations, pricing, exhibitions, events, and memberships, but these paths are frequently fragmented and hard to discover.",
    approach:
      "Built a clear UX process from research and personas to wireframes and a high fidelity prototype, then reorganized the site map around the tasks visitors actually need.",
    tools: ["Figma", "UX Research", "User Personas", "Wireframing", "Design System"],
    resultDetail:
      "The final prototype improves navigation clarity, simplifies ticket and event access, and creates a cohesive digital identity aligned with the museum brand.",
    image: "/case-studies/aurora-museum-1.png",
    previewObjectFit: "contain",
    galleryObjectFit: "contain",
    galleryAspectClassName: "aspect-[3/2]",
    galleryImages: ["/case-studies/aurora-museum-1.png"],
    previewLink: "https://grainy-dried-23206590.figma.site/",
    previewLabel: "Preview Aurora Museum",
    placeholderColor: "#7c2d12",
  },
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    title: "Community Discord Bot",
    statusLabel: "Contract Ready",
    outcome: "Automation tooling for community operations and platform integrations",
    stack: ["Node.js", "Discord.js"],
    summary:
      "Automation tools built for online communities with moderation safety, command workflows, and integration support.",
    whatItCanDo: [
      "Command based interaction",
      "Automated moderation",
      "API integrations",
    ],
    testsAndEdgeCases: [
      "Permission hierarchy checks",
      "Rate limit protection",
      "Command validation failures",
      "Channel scoping rules",
      "Fallback behavior for invalid inputs",
    ],
    skillReflection:
      "I can build automation tools, bots, and integrations for communities and product platforms.",
    skillsUsed: ["Node.js", "Discord.js"],
    context: "Built to structure online community workflows and reduce manual moderation overhead.",
    problem:
      "Communities and early stage products need automation without losing control or moderation clarity.",
    approach:
      "Built a modular bot system with command architecture, moderation actions, and integration ready endpoints.",
    tools: ["Node.js", "Discord.js"],
    resultDetail:
      "The bot system demonstrates reusable automation patterns for communities and SaaS support workflows.",
    image: "/case-studies/inkbot-1.png",
    galleryImages: [
      "/case-studies/inkbot-1.png",
      "/case-studies/inkbot-2.png",
      "/case-studies/inkbot-3.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    placeholderColor: "#1d4ed8",
  },
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    homeFeatured: true,
    title: "DetailFlow",
    statusLabel: "Production Ready",
    outcome: "Booking and confirmation system for service businesses",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    summary:
      "DetailFlow is a booking and confirmation system built for service businesses. It combines a mobile first interface, API backed submission handling, and owner and client email delivery in one clear flow.",
    whatItCanDo: [
      "Structured booking intake",
      "Client confirmation messaging",
      "Owner notification system",
      "API based submission handling",
      "Email template rendering",
      "Mobile first UI",
    ],
    testsAndEdgeCases: [
      "Required field validation",
      "Email format verification",
      "Rate limit protection",
      "Failed API fallback handling",
      "Timezone safe scheduling",
    ],
    skillReflection:
      "This project sharpened full stack flow design, form validation strategy, API integration patterns, email delivery workflows, and production UX thinking.",
    skillsUsed: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "REST APIs",
      "Email Automation",
      "Form Validation",
      "Mobile First Design",
    ],
    context:
      "Small service businesses need a professional booking flow without expensive SaaS lock in.",
    problem:
      "Without a structured intake and confirmation path, bookings become manual, harder to track, and harder to scale.",
    approach:
      "Designed in Figma, translated into a production ready Next.js interface, and integrated with backend routing and email confirmations.",
    tools: ["Next.js", "TypeScript", "FastAPI", "Resend", "Tailwind CSS"],
    resultDetail:
      "The booking flow now supports reliable intake, confirmation messaging, and clear owner visibility from submission through follow up.",
    image: "/case-studies/detailflow-1.png",
    previewImage: "/case-studies/previews/detailflow-1-home.webp",
    previewSources: [
      {
        srcSet: "/case-studies/previews/detailflow-1-home.avif",
        type: "image/avif",
      },
      {
        srcSet: "/case-studies/previews/detailflow-1-home.webp",
        type: "image/webp",
      },
    ],
    previewLoading: "lazy",
    galleryImages: [
      "/case-studies/detailflow-1.png",
      "/case-studies/detailflow-2.png",
      "/case-studies/detailflow-3.png",
      "/case-studies/detailflow-4.png",
      "/case-studies/detailflow-5.png",
    ],
    link: "https://github.com/sakanastudio24-eng/Ward-Studio",
    linkLabel: "GitHub",
    previewLink: "https://detailflow-demo.zward.studio/",
    previewLabel: "Preview DetailFlow",
    productLink: "/products#detailflow-template",
    productLabel: "View Product",
    placeholderColor: "#0f766e",
  },
  {
    section: "engineering",
    visibility: ["home", "all-projects"],
    title: "InkBot Discord Bot",
    outcome:
      "Modular event driven collaboration system for structured matching, digests, and moderation safety",
    stack: ["Python", "discord.py", "AsyncIO", "Event Handling"],
    context:
      "I built InkBot because creative servers become noisy and chaotic. It started as a simple command bot and evolved into a modular system built with cogs and scheduled jobs.",
    problem:
      "Collaboration requests were hard to track, role assignment was inconsistent, and moderation needed permission aware controls that would not over automate the community.",
    approach:
      "Built structured role based group matching, reaction driven state transitions, scheduled digests, operational analytics tracking, rate limiting, and permission aware moderation commands.",
    tools: [
      "Python",
      "discord.py",
      "AsyncIO",
      "Rate Limiting",
      "Event Handling",
      "Role Based Access Control",
      "Scheduled Jobs",
      "JSON State Storage",
      "Command Validation",
      "UX Architecture",
    ],
    resultDetail:
      "Tested edge cases include case insensitive role matching, cooldown enforcement, channel validation failures, permission hierarchy handling, thread fallback logic, and reaction based state locking. This project strengthened asynchronous event architecture, distributed state tracking, permission aware logic systems, lightweight storage design, and community UX thinking.",
    image: "/case-studies/inkbot-1.png",
    previewImage: "/case-studies/previews/inkbot-1-home.webp",
    previewSources: [
      {
        srcSet: "/case-studies/previews/inkbot-1-home.avif",
        type: "image/avif",
      },
      {
        srcSet: "/case-studies/previews/inkbot-1-home.webp",
        type: "image/webp",
      },
    ],
    previewLoading: "lazy",
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
    title: "Terminal Adventure CLI Game",
    outcome: "Systems focused terminal RPG with modular state driven gameplay",
    stack: ["Next.js", "React 19", "TypeScript", "xterm.js"],
    summary:
      "Terminal Adventure is a CLI game built around logic control, state safety, and interactive design. It grew from a simple combat loop into a modular system for player state, enemy behavior, combat, and game flow. It is still in active development.",
    whatItCanDo: [
      "Turn based combat logic",
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
    section: "engineering",
    visibility: ["home", "all-projects"],
    title: "Drawerflow Drawer Component",
    statusLabel: "Vr 1",
    outcome:
      "Case study on post purchase drawer architecture with reusable checkout components and one combined flow",
    stack: ["React", "TypeScript", "Tailwind CSS"],
    summary:
      "Drawerflow turns the checkout experience into reusable pieces and shows the full journey from selection to post purchase handoff in one case study.",
    context:
      "The checkout system needed clearer UI boundaries and a better way to explain how each drawer contributes to the full purchase and handoff flow.",
    problem:
      "Without clear component responsibilities, post purchase handoff and analytics transitions become harder to reason about and harder to maintain.",
    approach:
      "Split the experience into four drawer components, then mapped the fifth combined flow that connects plan selection, add ons, readiness, checkout, and post purchase actions.",
    tools: [
      "CheckoutDrawer",
      "PlanSelector",
      "AddonSelector",
      "ReadinessGate",
      "SuccessDrawer",
      "State modeling",
    ],
    resultDetail:
      "The flow now has explicit component boundaries and one clear post purchase sequence that can be used for implementation walkthroughs and analytics mapping.",
    whatItCanDo: [
      "Part 1: PlanSelector for tier decisions",
      "Part 2: AddonSelector for add on logic",
      "Part 3: ReadinessGate for required checks",
      "Part 4: SuccessDrawer for post purchase handoff",
      "Part 5: Full combined flow across all four components",
    ],
    testsAndEdgeCases: [
      "Transition lock while redirecting and confirming",
      "Retry behavior after payment or verification issues",
      "Copy and config handoff events tracked from user actions",
      "Mobile drawer height and footer reachability",
      "Post purchase content order and CTA visibility",
    ],
    skillReflection:
      "This case study reflects component orchestration, state transition design, and post purchase UX structuring with reusable interfaces.",
    skillsUsed: [
      "Component Architecture",
      "Type Safe State",
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
          "Sets context for add on recommendations and constraints.",
        ],
      },
      {
        id: "part-2",
        label: "Part 2",
        title: "AddonSelector",
        description: "Toggle add ons and enforce compatibility rules in real time.",
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
        description: "Run readiness before checkout so submission quality stays high.",
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
        description: "Handle post purchase actions, config handoff, and next steps.",
        bullets: [
          "Generates copy ready config and handoff checklist.",
          "Supports booking CTA, resend, support, and copy interactions.",
          "Shows clear upload and secure setup instructions after purchase.",
        ],
      },
      {
        id: "part-5",
        label: "Part 5",
        title: "Unified Flow",
        description:
          "All four pieces connected in one end to end sequence from selection to post purchase handoff.",
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
    title: "Fullerton Emergency Management Logo Case Study",
    statusLabel: "Design Case Study",
    outcome:
      "Civic emergency identity system that unifies city leadership and emergency services in one visual mark",
    stack: ["Brand Identity", "Logo System", "Typography", "Color Strategy"],
    summary:
      "The Fullerton Emergency Management logo was created to show how city leadership and emergency services work together through one civic identity.",
    whatItCanDo: [
      "Uses a Maltese cross to reference emergency response and protection",
      "Centers the four emergency phases: Mitigation, Preparedness, Response, Recovery",
      "Combines fire, EMS, civil defense, and city leadership symbols",
      "Maintains clear readability across print and digital usage",
    ],
    testsAndEdgeCases: [
      "Small format legibility for reports and internal documents",
      "Clear symbol hierarchy at reduced sizes",
      "Color contrast for emergency readability standards",
      "Consistency across civic and department communication assets",
    ],
    skillReflection:
      "This case study demonstrates identity systems thinking by balancing civic tone, emergency symbolism, and practical readability for real world use.",
    skillsUsed: [
      "Logo Design",
      "Visual Hierarchy",
      "Civic Branding",
      "Typography",
      "Color Theory",
      "Symbol Design",
      "Adobe Illustrator",
      "Iconography",
      "Public Safety Communication",
      "Graphic Design Fundamentals",
    ],
    context:
      "The city needed a logo that clearly communicated shared emergency responsibility across multiple departments.",
    problem:
      "Emergency programs often appear fragmented when departments use disconnected visual language, reducing clarity during public communication.",
    approach:
      "Built the mark around a Maltese cross, then layered a phase based emergency seal and service symbols to reflect coordinated preparedness and response.",
    tools: ["Illustrator", "Brand System Planning", "Symbol Design", "Typography"],
    resultDetail:
      "The final logo combines emergency recognition cues, city identity, and structured typography to reinforce Fullerton's commitment to preparedness, response, and community resilience.",
    image: "/case-studies/fullerton-emergency-management-logo.png",
    galleryImages: ["/case-studies/fullerton-emergency-management-logo.png"],
    placeholderColor: "#9a3412",
  },
  {
    section: "case-study",
    visibility: ["all-projects"],
    title: "Neon City Grid",
    statusLabel: "Design Project",
    outcome:
      "Grid inspired green and off white logo built for a bold urban identity",
    stack: ["Logo Design", "Brand Identity", "Typography", "Adobe Illustrator"],
    summary:
      "Neon City Grid is a standalone logo project built around a structured grid form and a confident, high contrast visual direction.",
    whatItCanDo: [
      "Uses a grid inspired symbol structure for geometric balance",
      "Applies a green and off white palette for clear recognition",
      "Pairs icon and wordmark for flexible usage",
      "Maintains readability across print and digital contexts",
    ],
    testsAndEdgeCases: [
      "Legibility at small icon and favicon sizes",
      "Contrast consistency between green and off white variants",
      "Wordmark clarity in horizontal and stacked lockups",
      "Background compatibility in light and dark placements",
    ],
    skillReflection:
      "This project demonstrates disciplined logo construction, typography control, and color direction aligned to a defined brand ego.",
    skillsUsed: [
      "Logo Design",
      "Visual Hierarchy",
      "Typography",
      "Color Theory",
      "Symbol Design",
      "Adobe Illustrator",
      "Iconography",
      "Graphic Design Fundamentals",
    ],
    context:
      "The project was created as a focused identity exercise for an urban inspired brand concept.",
    problem:
      "The brand needed a mark that felt distinct and structured without unnecessary visual noise.",
    approach:
      "Constructed the logo on a grid framework, then refined spacing and proportions with Centry Schoolbook to keep the identity clean and assertive.",
    tools: ["Adobe Illustrator", "Grid construction", "Logo system planning", "Typography"],
    resultDetail:
      "The final Neon City Grid logo delivers a clear geometric mark and a cohesive green and off white treatment that holds up across applications.",
    image: "/case-studies/neon-city-grid-logo.png",
    galleryImages: ["/case-studies/neon-city-grid-logo.png"],
    placeholderColor: "#166534",
  },
];
