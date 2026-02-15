import { useEffect, useState } from 'react';

// Array of section IDs in order from top to bottom of page
const SECTIONS = ['hero', 'capabilities', 'work', 'how-i-work', 'contact', 'footer'];

// useKeyboardNavigation: Tracks section position and enables W/S and arrow navigation.
export function useKeyboardNavigation() {
  // Current section index (0 = hero, 1 = capabilities, etc.)
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // handleKeyDown: Moves between sections from keyboard shortcuts.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default only for our navigation keys
      if (['ArrowDown', 'ArrowUp', 's', 'w', 'S', 'W'].includes(e.key)) {
        // Don't interfere if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        e.preventDefault();

        let nextSection = currentSection;

        // Down navigation - move to next section (max: last section)
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          nextSection = Math.min(currentSection + 1, SECTIONS.length - 1);
        }
        // Up navigation - move to previous section (min: first section)
        else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          nextSection = Math.max(currentSection - 1, 0);
        }

        // Only scroll if section actually changed
        if (nextSection !== currentSection) {
          setCurrentSection(nextSection);
          scrollToSection(SECTIONS[nextSection]);
        }
      }
    };

    // scrollToSection: Smooth-scrolls to the requested section id.
    const scrollToSection = (sectionId: string) => {
      let element: HTMLElement | null = null;
      
      if (sectionId === 'hero') {
        // Scroll to top for hero section
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        element = document.getElementById(sectionId);
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // handleScroll: Detects which section is active based on viewport position.
    const handleScroll = () => {
      // Calculate scroll position at center of viewport
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      // Check sections from bottom to top to find which one is in view
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        let element: HTMLElement | null = null;
        
        // Special handling for hero - active when near top of page
        if (SECTIONS[i] === 'hero') {
          if (window.scrollY < 100) {
            setCurrentSection(0);
            return;
          }
          continue;
        }
        
        element = document.getElementById(SECTIONS[i]);
        
        // If scroll position is past this section's top, it's the current section
        if (element && element.offsetTop <= scrollPosition) {
          setCurrentSection(i);
          return;
        }
      }
    };

    // Add event listeners for keyboard and scroll
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);

    // Initialize current section on mount
    handleScroll();

    // Cleanup: remove event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentSection]);

  return { currentSection, totalSections: SECTIONS.length };
}
