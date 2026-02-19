import { useEffect, useRef, useState } from "react";
import { getTooltipMessage } from "./HoverTooltip";

interface FooterProps {
  onGameOpen: () => void;
  setTooltipText: (text: string) => void;
}

// Footer: Renders the final section with navigation links and game entry point.
export function Footer({ onGameOpen, setTooltipText }: FooterProps) {
  // Reference to footer element for scroll calculations
  const footerRef = useRef<HTMLElement>(null);
  
  // Current scale of WARD text (0.3 = 30%, 1 = 100%)
  const [scale, setScale] = useState(0.3);
  
  // Tracks if user is hovering over WARD text
  const [isHoveringWard, setIsHoveringWard] = useState(false);

  useEffect(() => {
    // handleScroll: Scales the WARD headline based on footer visibility.
    const handleScroll = () => {
      if (!footerRef.current) return;

      const footer = footerRef.current;
      const rect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the footer is visible
      // When footer just enters viewport: progress = 0
      // When footer is fully in view: progress = 1
      const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)));

      // Scale from 0.3 to 1 (30% to 100%)
      const newScale = 0.3 + (progress * 0.7);
      setScale(newScale);
    };

    // Add scroll listener and run initial calculation
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    // Cleanup: remove scroll listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // scrollToSection: Smooth-scrolls to the specified section.
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // scrollToTop: Smooth-scrolls the page back to the top.
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItemClass = `text-sm font-medium leading-[1.5] transition-colors ${
    isHoveringWard ? "hover:text-white/70" : "hover:text-muted-foreground"
  }`;

  return (
    <footer 
      id="footer"
      ref={footerRef} 
      className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 md:px-12 border-t border-border transition-colors duration-300 ${isHoveringWard ? 'bg-orange-500' : ''}`}
    >
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <h2 
          className={`text-[4rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] tracking-tighter leading-none transition-all duration-300 ease-out whitespace-nowrap cursor-default ${isHoveringWard ? 'text-white' : ''}`}
          style={{ transform: `scale(${scale})` }}
          onMouseEnter={() => setIsHoveringWard(true)}
          onMouseLeave={() => setIsHoveringWard(false)}
        >
          WARD
        </h2>
      </div>
      <nav className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-12 text-sm ${isHoveringWard ? 'text-white' : ''}`}>
        <button 
          onClick={scrollToTop} 
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Home
        </button>
        <button 
          onClick={() => scrollToSection('work')} 
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Work
        </button>
        <button 
          onClick={() => scrollToSection('contact')} 
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Contact
        </button>
        <a
          href="/products"
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Products
        </a>
        <button 
          onClick={onGameOpen} 
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Games
        </button>
        <a
          href="/terms"
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Terms & Conditions
        </a>
      </nav>
      <div className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-8 ${isHoveringWard ? 'text-white' : ''}`}>
        <p className={`text-xs ${isHoveringWard ? 'text-white/70' : 'text-muted-foreground'}`}>
          © {new Date().getFullYear()} Ward Studio
        </p>
        <span className={`hidden md:inline text-xs ${isHoveringWard ? 'text-white/70' : 'text-muted-foreground'}`}>•</span>
        <p className={`text-xs ${isHoveringWard ? 'text-white/70' : 'text-muted-foreground'}`}>
          by Zechariah Ward
        </p>
      </div>
    </footer>
  );
}
