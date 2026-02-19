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
  "let's work": "Jump to contact and start your project brief.",
  "view work": "Scroll to case studies and shipped builds.",
  "see my work": "Scroll to case studies and shipped builds.",
  
  // Contact section
  "get in touch": "Share your goals, timeline, and budget.",
  "send message": "Submit your inquiry for a 24-48 hour response.",
  "submit": "Send your project details.",
  
  // Footer
  "home": "Back to the top of the page.",
  "work": "Go to the portfolio section.",
  "contact": "Open the contact section.",
  "games": "Open the mini game.",
  "terms & conditions": "View service terms and project policies.",
  "back to portfolio": "Return to the case studies and project grid.",
  "back to home": "Head back to the homepage.",
  "view product": "Jump from case study to the product setup room.",
  "view products": "Browse all live product builds and packages.",
  "show all projects": "Open the full project and case-study index.",
  "products": "Open product builds, options, and pricing drawers.",
  "purchase": "Lock in the build scope and total in one swipe.",
  "github": "Open the source repository.",
  
  // Portfolio cards
  "detailflow / cruz n clean": "From missed calls to booked slots. Open the full flow.",
  "inkbot discord bot": "Turns chat chaos into clean ops. See how InkBot keeps order.",
  "drawer flow": "See the 4-part drawer system plus the full combined flow.",
  "terminal adventure - systems-driven cli game": "Still in dev, still dangerous. Enter the command line arena.",
  
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
