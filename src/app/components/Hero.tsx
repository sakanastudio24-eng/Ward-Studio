import { Button } from "./ui/button";
import { getTooltipMessage } from "./HoverTooltip";
import { useState } from "react";
import { motion } from "motion/react";

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

  return (
    <section id="hero" className={`min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 transition-colors duration-300 ${getBackgroundClass()}`}>
      <div className="max-w-5xl w-full">
        <div className="mb-6">
          <motion.p 
            className={`text-xs md:text-sm mb-4 transition-colors duration-300 ${hoveredWord ? getSubtextClass() : 'text-muted-foreground'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            by Zechariah Ward
          </motion.p>
          <motion.h1 
            className={`text-[2.5rem] sm:text-[3rem] md:text-[5rem] lg:text-[6rem] leading-[0.95] tracking-tight mb-6 transition-colors duration-300 ${getTextClass()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
            </span>.<br />
            Systems built to ship.
          </motion.h1>
          <motion.p 
            className={`text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed transition-colors duration-300 ${hoveredWord ? getSubtextClass() : 'text-muted-foreground'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            I design and engineer production-ready systems for clear execution and reliable delivery.
          </motion.p>
        </div>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            onClick={() => scrollToSection('contact')}
            className="px-8"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Let's Work
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => scrollToSection('work')}
            className="px-8"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            View Work
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
