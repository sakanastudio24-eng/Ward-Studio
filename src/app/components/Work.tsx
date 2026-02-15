import { ProjectCard } from "./ProjectCard";
import { getTooltipMessage } from "./HoverTooltip";

interface WorkProps {
  setTooltipText: (text: string) => void;
}

// Work: Displays engineering and design case-study cards.
export function Work({ setTooltipText }: WorkProps) {
  const engineeringProjects = [
    {
      title: "Heimdall Grid Analytics",
      outcome: "Real-time power grid monitoring platform",
      stack: ["Next.js", "TypeScript", "Django", "PostgreSQL"],
      context: "Energy infrastructure company needed a dashboard to monitor sensor data across global power lines.",
      problem: "Legacy systems couldn't handle real-time data visualization at scale. Critical alerts were delayed.",
      approach: "Built streaming data pipeline with WebSocket connections. Designed component library for grid visualization.",
      tools: ["Next.js", "TypeScript", "Django", "PostgreSQL", "WebSockets", "Tailwind", "Recharts"],
      resultDetail: "Deployed system now processes 50k+ data points per minute. Alert latency reduced from 3 minutes to <5 seconds.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGRhc2hib2FyZCUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzEwMzAxNjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Beagle Booking System",
      outcome: "Multi-service scheduling platform with calendar sync",
      stack: ["React", "Node.js", "Stripe", "Cal.com API"],
      context: "Pet care service needed online booking with automatic calendar management and payment processing.",
      problem: "Manual booking process created double-bookings. No payment collection upfront.",
      approach: "Integrated Stripe for deposits. Built bidirectional Cal.com sync. Designed mobile-first booking flow.",
      tools: ["React", "TypeScript", "Express", "Stripe API", "Cal.com API", "PostgreSQL"],
      resultDetail: "Bookings increased 240% in first quarter. Double-bookings eliminated. Average booking time reduced from 15min to 2min.",
      image: "https://images.unsplash.com/photo-1687524690542-2659f268cde8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc3MTA0MDI5MHww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Document Processing Pipeline",
      outcome: "Automated PDF extraction and data validation system",
      stack: ["Python", "Django", "Supabase", "MongoDB"],
      context: "Financial services firm processing 1000+ contracts monthly. Manual data entry taking 2 weeks per batch.",
      problem: "High error rates in manual transcription. No audit trail. Compliance issues.",
      approach: "Built OCR pipeline with validation rules. Webhook system for status updates. Admin dashboard for review.",
      tools: ["Python", "Django", "Supabase Functions", "Supabase Storage", "MongoDB", "React"],
      resultDetail: "Processing time reduced from 2 weeks to 4 hours. Error rate decreased from 12% to <1%. Full audit trail implemented.",
      image: "https://images.unsplash.com/photo-1760548425425-e42e77fa38f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWIlMjBkZXNpZ24lMjBkYXJrJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc3MTEyNDM0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const designProjects = [
    {
      title: "Catalyst Brand System",
      outcome: "Complete visual identity and component library",
      stack: ["Figma", "Design Tokens", "Documentation"],
      context: "B2B SaaS startup needed cohesive brand identity before Series A fundraising.",
      problem: "Inconsistent visuals across product and marketing. No design system. Brand felt generic.",
      approach: "Conducted stakeholder workshops. Designed typography scale, color system, and iconography. Built Figma component library.",
      tools: ["Figma", "Adobe Illustrator", "Notion"],
      resultDetail: "Delivered 200+ components. Design-to-dev handoff time reduced 60%. Brand recognition increased in user testing.",
      image: "https://images.unsplash.com/photo-1764383381195-5daa5902c3f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXN1YWwlMjBpZGVudGl0eSUyMGJyYW5kaW5nfGVufDF8fHx8MTc3MTEyOTk1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Mobile-First Redesign",
      outcome: "App redesign increasing retention 45%",
      stack: ["Figma", "User Research", "Prototyping"],
      context: "Consumer app had 65% mobile traffic but desktop-optimized UI. High bounce rates on mobile.",
      problem: "Mobile users abandoning key flows. Navigation unclear. Forms unusable on small screens.",
      approach: "Conducted mobile user testing. Redesigned information architecture. Created gesture-based navigation patterns.",
      tools: ["Figma", "Maze", "Hotjar", "Google Analytics"],
      resultDetail: "Mobile conversion increased 45%. Session duration up 30%. App Store rating improved from 3.2 to 4.6.",
      image: "https://images.unsplash.com/photo-1767449441925-737379bc2c4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjB1aSUyMGRlc2lnbnxlbnwxfHx8fDE3NzEwMjg1NTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      title: "Editorial Design System",
      outcome: "Typography-focused publishing platform design",
      stack: ["Figma", "Type Design", "CSS"],
      context: "Online magazine needed distinctive reading experience that worked across devices.",
      problem: "Generic templates made content blend in. Poor readability. No brand personality.",
      approach: "Developed custom typographic scale. Designed reading modes for different content types. Created modular layout system.",
      tools: ["Figma", "Adobe Fonts", "CSS Grid", "JavaScript"],
      resultDetail: "Average read time increased 35%. Reader feedback scored 4.8/5. Design system adopted by 3 partner publications.",
      image: "https://images.unsplash.com/photo-1658526064786-63d6e3603215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdHlwb2dyYXBoeSUyMGRlc2lnbnxlbnwxfHx8fDE3NzEwODExMjl8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  return (
    <section id="work" className="py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Engineering Work */}
        <div className="mb-20">
          <h2 className="text-[1.75rem] sm:text-[2rem] md:text-[3rem] mb-4 tracking-tight">
            Engineering Work
          </h2>
          <p className="text-muted-foreground mb-12">
            Production systems and web applications
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineeringProjects.map((project, idx) => (
              <ProjectCard key={idx} {...project} setTooltipText={setTooltipText} />
            ))}
          </div>
        </div>

        {/* Design Work */}
        <div>
          <h2 className="text-[1.75rem] sm:text-[2rem] md:text-[3rem] mb-4 tracking-tight">
            Visual & System Design
          </h2>
          <p className="text-muted-foreground mb-12">
            Brand systems and interface design
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designProjects.map((project, idx) => (
              <ProjectCard key={idx} {...project} setTooltipText={setTooltipText} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
