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
        left: `${mouseX + 12}px`, // Offset 12px to the right of cursor
        top: `${mouseY + 12}px`,  // Offset 12px below cursor
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
  
  // Current mouse position for tooltip positioning
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // handleMouseMove: Updates tooltip coordinates as the pointer moves.
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Add global mouse move listener
    window.addEventListener("mousemove", handleMouseMove);
    
    // Cleanup: remove listener on unmount
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return {
    tooltipText,
    mousePosition,
    setTooltipText,
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
  "see my work": "Review engineering systems and case studies.",
  
  // Contact section
  "get in touch": "Share your goals, timeline, and constraints.",
  "send message": "Send your inquiry for a structured response.",
  "submit": "Send your project details.",
  
  // Footer
  "home": "Back to the top of the page.",
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
  "products": "Open configurable product systems and pricing.",
  "purchase": "Start the purchase flow and confirm scope.",
  "github": "Open the source repository.",
  
  // Portfolio cards
  "detailflow": "See the booking and confirmation system architecture.",
  "inkbot discord bot": "See the modular community automation system.",
  "drawer flow": "See the staged drawer system and combined flow.",
  "terminal adventure - systems-driven cli game": "See the CLI game systems and state architecture.",
  
  // Games
  "close game": "Close the game overlay.",
  "play game": "Start the game overlay.",
  
  // Default fallback
  "default": "Open details.",
};

// getTooltipMessage: Resolves normalized button text to a tooltip message.
export function getTooltipMessage(buttonText: string): string {
  // Normalize button text (lowercase, trim whitespace)
  const normalized = buttonText.toLowerCase().trim();
  
  // Return matching message or default fallback
  return tooltipMessages[normalized] || tooltipMessages["default"];
}
