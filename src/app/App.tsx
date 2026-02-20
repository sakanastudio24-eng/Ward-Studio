"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Hero } from "./components/Hero";
import { Capabilities } from "./components/Capabilities";
import { Work } from "./components/Work";
import { HowIWork } from "./components/HowIWork";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { HoverTooltip, useHoverTooltip } from "./components/HoverTooltip";
import { KeyboardIndicator } from "./components/KeyboardIndicator";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

const DinoGame = dynamic(
  () => import("./components/DinoGame").then((mod) => mod.DinoGame),
  { ssr: false },
);

const FlappyBird = dynamic(
  () => import("./components/FlappyBird").then((mod) => mod.FlappyBird),
  { ssr: false },
);

// App: Renders all site sections and global overlays with initial page behavior.
export default function App() {
  // Game overlay state - controls whether game is visible
  const [gameOpen, setGameOpen] = useState(false);
  
  // Mobile detection state - determines which game to show (dino vs flappy bird)
  const [isMobile, setIsMobile] = useState(false);

  // Tooltip hook - manages orange tooltip that follows mouse cursor
  const { tooltipText, mousePosition, setTooltipText } = useHoverTooltip();

  // Enable keyboard navigation (↑/↓ or W/S to navigate between sections)
  useKeyboardNavigation();

  useEffect(() => {
    // checkMobile: Detects mobile viewports to choose the right game overlay.
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check on mount
    checkMobile();
    
    // Listen for window resize to update mobile state
    window.addEventListener('resize', checkMobile);

    // Cleanup: remove resize listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen">
      <main>
        <Hero setTooltipText={setTooltipText} />
        <Capabilities />
        <Work scope="home" setTooltipText={setTooltipText} />
        <HowIWork />
        <Contact setTooltipText={setTooltipText} />
      </main>
      <Footer onGameOpen={() => setGameOpen(true)} setTooltipText={setTooltipText} />
      {gameOpen && (
        isMobile ? (
          <FlappyBird onClose={() => setGameOpen(false)} />
        ) : (
          <DinoGame onClose={() => setGameOpen(false)} />
        )
      )}
      <HoverTooltip
        text={tooltipText}
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
      />
      <KeyboardIndicator />
    </div>
  );
}
