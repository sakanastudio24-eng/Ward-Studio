import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// KeyboardIndicator: Displays a temporary keyboard navigation hint banner.
export function KeyboardIndicator() {
  // Controls visibility of the keyboard hint
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // handleInteraction: Hides the hint after the first user interaction.
    const handleInteraction = () => {
      setShowHint(false);
    };

    // Listen for first scroll event (once: true means listener auto-removes)
    window.addEventListener('scroll', handleInteraction, { once: true });
    
    // Listen for first keypress event
    window.addEventListener('keydown', handleInteraction, { once: true });

    // Auto-hide after 5 seconds even if no interaction
    const timer = setTimeout(() => setShowHint(false), 5000);

    // Cleanup: remove listeners and clear timer on unmount
    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-40 bg-background border border-border rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">↑</kbd>
                <span className="text-xs">or</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">W</kbd>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">↓</kbd>
                <span className="text-xs">or</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">S</kbd>
              </div>
            </div>
            <span>Navigate sections</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
