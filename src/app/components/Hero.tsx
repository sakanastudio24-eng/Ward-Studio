import { Button } from "./ui/button";
import { getTooltipMessage } from "./HoverTooltip";
import { useState } from "react";

interface HeroProps {
  setTooltipText: (text: string) => void;
}

// Hero: Renders the landing section with interactive keyword-driven theme states.
export function Hero({ setTooltipText }: HeroProps) {
  // Tracks which keyword is being hovered ('design', 'engineering', or null)
  const [hoveredWord, setHoveredWord] = useState<'design' | 'engineering' | null>(null);

  // scrollToSection: Smooth-scrolls to the target section id.
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // getBackgroundClass: Maps the hovered keyword to the hero background class.
  const getBackgroundClass = () => {
    if (hoveredWord === 'design') return 'bg-orange-500';
    if (hoveredWord === 'engineering') return 'bg-black dark:bg-white';
    return '';
  };

  // getTextClass: Sets text color classes for high-contrast hover states.
  const getTextClass = () => {
    if (hoveredWord === 'design') return 'text-white';
    if (hoveredWord === 'engineering') return 'text-white dark:text-black';
    return '';
  };

  const getSubtextClass = () => {
    if (hoveredWord === 'design') return 'text-white/70';
    if (hoveredWord === 'engineering') return 'text-white/70 dark:text-black/70';
    return '';
  };

  const getTaglineClass = () => {
    if (hoveredWord === "design") return "text-orange-100";
    if (hoveredWord === "engineering") return "text-orange-400 dark:text-orange-600";
    return "text-orange-500 dark:text-orange-400";
  };

  return (
    <section
      id="hero"
      className={`flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 md:px-12 transition-colors duration-300 ${getBackgroundClass()}`}
    >
      <div className="max-w-5xl w-full">
        <div className="mb-4 sm:mb-6">
          <p
            className={`text-xs md:text-sm mb-4 transition-colors duration-300 ${hoveredWord ? getSubtextClass() : 'text-muted-foreground'}`}
          >
            by Zechariah Ward
          </p>
          <h1
            className={`mb-5 text-[2.15rem] leading-[0.97] tracking-tight transition-colors duration-300 sm:mb-6 sm:text-[3rem] md:text-[5rem] lg:text-[6rem] ${getTextClass()}`}
          >
            <span 
              className="cursor-default"
              onMouseEnter={() => setHoveredWord('design')}
              onMouseLeave={() => setHoveredWord(null)}
            >
              Design
            </span> meets <span 
              className="cursor-default"
              onMouseEnter={() => setHoveredWord('engineering')}
              onMouseLeave={() => setHoveredWord(null)}
            >
              engineering
            </span>.
            <span className={`mt-3 block text-[0.95rem] font-medium leading-[1.2] tracking-[0.08em] sm:mt-4 sm:text-[1.35rem] md:text-[1.8rem] ${getTaglineClass()}`}>
              Systems built to ship.
            </span>
          </h1>
          <p
            className={`max-w-2xl text-[0.98rem] leading-relaxed transition-colors duration-300 sm:text-lg md:text-xl ${hoveredWord ? getSubtextClass() : 'text-muted-foreground'}`}
          >
            I design and engineer production-ready systems for clear execution and reliable delivery.
          </p>
        </div>
        <div
          className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-4"
        >
          <Button 
            size="lg" 
            onClick={() => scrollToSection('contact')}
            className="w-full px-8 sm:w-auto"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Let's Work
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => scrollToSection('work')}
            className="w-full px-8 sm:w-auto"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            View Work
          </Button>
        </div>
      </div>
    </section>
  );
}
