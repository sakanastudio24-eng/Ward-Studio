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
      const progress = Math.max(0, Math.min(1, 1 - rect.top / windowHeight));

      // Scale from 0.3 to 1 (30% to 100%)
      const newScale = 0.3 + progress * 0.7;
      setScale(newScale);
    };

    // Add scroll listener and run initial calculation
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // Cleanup: remove scroll listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // scrollToSection: Smooth-scrolls to the specified section.
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  // scrollToTop: Smooth-scrolls the page back to the top.
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItemClass = `text-sm font-medium leading-[1.5] transition-colors ${
    isHoveringWard ? "hover:text-white/70" : "hover:text-muted-foreground"
  }`;

  return (
    <footer
      id="footer"
      ref={footerRef}
      className={`flex min-h-[78vh] flex-col items-center justify-center border-t border-border px-4 py-10 transition-colors duration-300 sm:min-h-screen sm:px-6 sm:py-12 md:px-12 ${isHoveringWard ? "bg-orange-500" : ""}`}
    >
      <div className="flex flex-1 w-full items-center justify-center overflow-hidden">
        <h2
          className={`w-full cursor-default whitespace-nowrap px-2 text-center text-[26vw] leading-none tracking-tighter transition-all duration-300 ease-out sm:w-auto sm:px-0 sm:text-[8rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] ${isHoveringWard ? "text-white" : ""}`}
          style={{ transform: `scale(${scale})` }}
          onMouseEnter={() => setIsHoveringWard(true)}
          onMouseLeave={() => setIsHoveringWard(false)}
        >
          WARD
        </h2>
      </div>

      <nav
        className={`flex w-full max-w-[21rem] flex-col items-center justify-center gap-3 text-sm sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3 md:gap-x-12 ${isHoveringWard ? "text-white" : ""}`}
      >
        <button
          onClick={scrollToTop}
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Home
        </button>
        <button
          onClick={() => scrollToSection("services")}
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Services
        </button>
        <button
          onClick={() => scrollToSection("projects")}
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Projects
        </button>
        <button
          onClick={() => scrollToSection("about")}
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          About
        </button>
        <button
          onClick={() => scrollToSection("contact")}
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Contact
        </button>
      </nav>

      <nav
        className={`mt-5 flex w-full max-w-[21rem] flex-col items-center justify-center gap-3 text-sm sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3 md:gap-x-12 ${isHoveringWard ? "text-white" : ""}`}
      >
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
        <a
          href="/privacy"
          className={navItemClass}
          onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
          onMouseLeave={() => setTooltipText("")}
        >
          Privacy Policy
        </a>
      </nav>

      <div className={`mt-7 flex flex-col items-center gap-2 md:mt-8 md:flex-row md:gap-4 ${isHoveringWard ? "text-white" : ""}`}>
        <p className={`text-xs ${isHoveringWard ? "text-white/70" : "text-muted-foreground"}`}>
          © {new Date().getFullYear()} Ward Studio
        </p>
        <span className={`hidden text-xs md:inline ${isHoveringWard ? "text-white/70" : "text-muted-foreground"}`}>
          •
        </span>
        <p className={`text-xs ${isHoveringWard ? "text-white/70" : "text-muted-foreground"}`}>
          by Zechariah Ward
        </p>
      </div>
    </footer>
  );
}
