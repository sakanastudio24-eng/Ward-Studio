import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type KeyboardIndicatorProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

// KeyboardIndicator: Displays real section navigation controls with keyboard hints.
export function KeyboardIndicator({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: KeyboardIndicatorProps) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const handleInteraction = () => {
      setShowHint(false);
    };

    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    const timer = setTimeout(() => setShowHint(false), 5000);

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
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
          className="fixed bottom-8 right-8 z-40 hidden rounded-lg border border-border bg-background p-4 shadow-lg md:block"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Navigate sections</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Navigate to previous section"
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">↑</kbd>
                <span className="text-xs">W</span>
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Navigate to next section"
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">↓</kbd>
                <span className="text-xs">S</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
