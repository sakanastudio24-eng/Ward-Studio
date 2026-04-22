import { useCallback, useEffect, useState } from "react";

const SECTIONS = ["home", "services", "projects", "about", "contact", "footer"];

function scrollToSection(sectionId: string) {
  if (sectionId === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// useKeyboardNavigation: Tracks section position and exposes keyboard and button navigation.
export function useKeyboardNavigation() {
  const [currentSection, setCurrentSection] = useState(0);
  const totalSections = SECTIONS.length;

  const navigateToIndex = useCallback((index: number) => {
    const nextSection = Math.max(0, Math.min(index, SECTIONS.length - 1));
    setCurrentSection(nextSection);
    scrollToSection(SECTIONS[nextSection]);
  }, []);

  const goToPreviousSection = useCallback(() => {
    navigateToIndex(currentSection - 1);
  }, [currentSection, navigateToIndex]);

  const goToNextSection = useCallback(() => {
    navigateToIndex(currentSection + 1);
  }, [currentSection, navigateToIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "s", "w", "S", "W"].includes(e.key)) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        e.preventDefault();

        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          goToNextSection();
        } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          goToPreviousSection();
        }
      }
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        let element: HTMLElement | null = null;

        if (SECTIONS[i] === "home") {
          if (window.scrollY < 100) {
            setCurrentSection(0);
            return;
          }
          continue;
        }

        element = document.getElementById(SECTIONS[i]);

        if (element && element.offsetTop <= scrollPosition) {
          setCurrentSection(i);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [goToNextSection, goToPreviousSection]);

  return {
    currentSection,
    totalSections,
    canGoPrevious: currentSection > 0,
    canGoNext: currentSection < totalSections - 1,
    goToPreviousSection,
    goToNextSection,
  };
}
