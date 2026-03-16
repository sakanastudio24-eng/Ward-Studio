import { useEffect, useState } from "react";

interface HoverTooltipProps {
  text: string;
  mouseX: number;
  mouseY: number;
}

// HoverTooltip: Shows contextual helper text near the mouse cursor.
export function HoverTooltip({ text, mouseX, mouseY }: HoverTooltipProps) {
  // Don't render if there's no text to display
  if (!text) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100] px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-md whitespace-nowrap transition-opacity duration-200"
      style={{
        left: `${mouseX - 12}px`, // Offset to the left of cursor
        top: `${mouseY + 12}px`,  // Offset 12px below cursor
        transform: "translateX(-100%)",
      }}
    >
      {text}
    </div>
  );
}

// useHoverTooltip: Stores tooltip text and tracks live mouse position.
export function useHoverTooltip() {
  // Current tooltip text being displayed
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipEnabled, setTooltipEnabled] = useState(true);
  
  // Current mouse position for tooltip positioning
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse), (max-width: 1024px)");
    const updateEnabled = () => {
      setTooltipEnabled(!mediaQuery.matches);
      if (mediaQuery.matches) setTooltipText("");
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    // handleMouseMove: Updates tooltip coordinates as the pointer moves.
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Add global mouse move listener
    window.addEventListener("mousemove", handleMouseMove);
    
    // Cleanup: remove listener on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  return {
    tooltipText,
    mousePosition,
    setTooltipText: (text: string) => {
      if (!tooltipEnabled) {
        setTooltipText("");
        return;
      }
      setTooltipText(text);
    },
  };
}

/**
 * Map of UI text to contextual tooltip responses.
 * Keys are lowercase text values from buttons/links/card titles.
 */
export const tooltipMessages: Record<string, string> = {
  // Hero section
  "let's work": "Open the contact form to start a scoped project.",
  "view work": "Review engineering systems and case studies.",
  "view projects": "Review featured contract-ready projects.",
  "see my work": "Review engineering systems and case studies.",
  
  // Contact section
  "get in touch": "Share your goals, timeline, and constraints.",
  "send message": "Send your inquiry for a structured response.",
  "submit": "Send your project details.",
  
  // Footer
  "home": "Back to the top of the page.",
  "services": "Jump to the services section.",
  "projects": "Jump to the featured projects section.",
  "about": "Jump to the about section.",
  "work": "Go to the work section.",
  "contact": "Open the contact section.",
  "games": "Open the mini game.",
  "terms & conditions": "Review terms, agreements, and refund policy.",
  "privacy policy": "Review how inquiry and onboarding data is handled.",
  "back to portfolio": "Return to the project index.",
  "back to home": "Head back to the homepage.",
  "view product": "Open the related product configuration flow.",
  "view products": "Open all product systems and onboarding flows.",
  "show all projects": "Open the full projects index.",
  "all projects": "Show all engineering and design project cards.",
  "show qr (android preview)": "Open the Expo build page and scan the Android preview QR code.",
  "engineering": "Show engineering builds and technical project work.",
  "design": "Show design-focused case studies and UX execution.",
  "products": "Open configurable product systems and pricing.",
  "purchase": "Start the purchase flow and confirm scope.",
  "preview detailflow": "Open the live DetailFlow demo preview.",
  "download preview": "Open the Android preview build page.",
  "github": "Open the source repository.",
  
  // Portfolio cards
  "detailflow": "See the booking and confirmation system architecture.",
  "inkbot discord bot": "See the modular community automation system.",
  "drawer flow": "See the staged drawer system and combined flow.",
  "drawerflow drawer component": "See the staged drawer system and combined flow.",
  "terminal adventure - systems-driven cli game": "See the CLI game systems and state architecture.",
  
  // Games
  "close game": "Close the game overlay.",
  "play game": "Start the game overlay.",
  
  // Default fallback
  "default": "Open details.",
};

const featuredProjectTooltipMessages: Record<string, string[]> = {
  "gamemate — social mobile app": [
    "Cool! Mobile social systems in action.",
    "Wow! Built for squads, clips, and discovery.",
    "Nice! Strong product structure for gamers.",
    "Clean execution on app UX and flow.",
  ],
  "aurora museum ux case study": [
    "Wow! Strong UX case study flow.",
    "Nice! Clear museum navigation design.",
    "Cool! Research-to-prototype execution.",
    "Polished IA and accessibility direction.",
  ],
  "community discord bot": [
    "Nice! Automation with moderation controls.",
    "Cool! Community tooling done right.",
    "Wow! Event-driven bot architecture.",
    "Clean command and permission systems.",
  ],
  detailflow: [
    "Nice! Product flow and checkout systems.",
    "Cool! Strong booking and confirmation execution.",
    "Wow! Structured handoff and onboarding logic.",
    "Clean production-ready UX and API flow.",
  ],
  "inkbot discord bot": [
    "Cool! Async community automation done right.",
    "Nice! Strong moderation and command architecture.",
    "Wow! Role and event systems are cleanly structured.",
    "Polished bot workflow for real communities.",
  ],
  "terminal adventure - systems-driven cli game": [
    "Cool! State-driven game systems.",
    "Nice! CLI architecture with clear progression.",
    "Wow! Strong logic and interaction design.",
    "Clean modular game loop execution.",
  ],
  "drawerflow drawer component": [
    "Cool! Reusable drawer orchestration.",
    "Nice! Component-driven checkout sequencing.",
    "Wow! Clear post-purchase UX structure.",
    "Polished multi-step flow architecture.",
  ],
  "fullerton emergency management logo case study": [
    "Nice! Strong civic identity structure.",
    "Cool! Symbol system with clear hierarchy.",
    "Wow! Public safety branding executed well.",
    "Polished typography and logo composition.",
  ],
  "neon city grid": [
    "Cool! Bold grid-led identity direction.",
    "Nice! Strong color and logo balance.",
    "Wow! Clean typographic execution.",
    "Polished visual system and mark design.",
  ],
  default: [
    "Cool!",
    "Wow!",
    "Nice!",
    "Strong featured build.",
    "Polished case study.",
  ],
};

// getTooltipMessage: Resolves normalized button text to a tooltip message.
export function getTooltipMessage(buttonText: string): string {
  // Normalize button text (lowercase, trim whitespace)
  const normalized = buttonText.toLowerCase().trim();
  
  // Return matching message or default fallback
  return tooltipMessages[normalized] || tooltipMessages["default"];
}

// getRandomFeaturedProjectTooltip: Returns a random, project-aware featured tooltip.
export function getRandomFeaturedProjectTooltip(projectTitle: string): string {
  const normalized = projectTitle.toLowerCase().trim();
  const pool = featuredProjectTooltipMessages[normalized] || featuredProjectTooltipMessages.default;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || "Cool!";
}
