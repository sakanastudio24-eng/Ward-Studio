"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Hero } from "./components/Hero";
import { Capabilities } from "./components/Capabilities";
import { Work } from "./components/Work";
import { HowIWork } from "./components/HowIWork";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { DinoGame } from "./components/DinoGame";
import { FlappyBird } from "./components/FlappyBird";
import { HoverTooltip, useHoverTooltip } from "./components/HoverTooltip";
import { SEOHead } from "./components/SEOHead";
import { KeyboardIndicator } from "./components/KeyboardIndicator";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

// App: Renders all site sections and global overlays with initial page behavior.
export default function App() {
  // Game overlay state - controls whether game is visible
  const [gameOpen, setGameOpen] = useState(false);
  
  // Mobile detection state - determines which game to show (dino vs flappy bird)
  const [isMobile, setIsMobile] = useState(false);
  
  // Page load animation state - triggers fade-in on mount
  const [isLoaded, setIsLoaded] = useState(false);
  
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
    
    // Trigger load animation after component mounts
    setIsLoaded(true);
    
    // Cleanup: remove resize listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <SEOHead />
      <main>
        <Hero setTooltipText={setTooltipText} />
        <Capabilities />
        <Work setTooltipText={setTooltipText} />
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
    </motion.div>
  );
}
