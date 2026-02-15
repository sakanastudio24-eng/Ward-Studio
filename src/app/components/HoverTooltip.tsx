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
 * Map of button text to witty tooltip responses
 * Keys are lowercase button text, values are personality-driven messages
 */
export const tooltipMessages: Record<string, string> = {
  // Hero section
  "let's work": "Ready to see what we can do!",
  "view work": "Prepare to be impressed!",
  "see my work": "Prepare to be impressed!",
  
  // Contact section
  "get in touch": "Let's make something great!",
  "send message": "I promise to respond!",
  "submit": "Sending good vibes your way!",
  
  // Footer
  "home": "Back to the top!",
  "work": "Check out the portfolio!",
  "contact": "Let's chat!",
  "games": "Time to play!",
  "terms & conditions": "The boring legal stuff...",
  
  // Case studies
  "view case study": "Deep dive incoming!",
  "close": "See you later!",
  "heimdall grid analytics": "Real-time data at scale!",
  "beagle booking system": "No more double bookings!",
  "document processing pipeline": "Automation for the win!",
  "catalyst brand system": "Brand consistency unlocked!",
  "mobile-first redesign": "Mobile users deserve better!",
  "editorial design system": "Typography done right!",
  
  // Games
  "close game": "Giving up already?",
  "play game": "Challenge accepted!",
  
  // Default fallback
  "default": "Click me, I dare you!",
};

// getTooltipMessage: Resolves normalized button text to a tooltip message.
export function getTooltipMessage(buttonText: string): string {
  // Normalize button text (lowercase, trim whitespace)
  const normalized = buttonText.toLowerCase().trim();
  
  // Return matching message or default fallback
  return tooltipMessages[normalized] || tooltipMessages["default"];
}
