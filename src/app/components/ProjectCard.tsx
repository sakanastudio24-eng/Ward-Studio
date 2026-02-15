import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getTooltipMessage } from "./HoverTooltip";

interface ProjectCardProps {
  title: string;
  outcome: string;
  stack: string[];
  context: string;
  problem: string;
  approach: string;
  tools: string[];
  resultDetail: string;
  link?: string;
  image: string;
  setTooltipText: (text: string) => void;
}

// ProjectCard: Renders a project preview card with an expandable case-study modal.
export function ProjectCard({
  title,
  outcome,
  stack,
  context,
  problem,
  approach,
  tools,
  resultDetail,
  link,
  image,
  setTooltipText
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer bg-muted"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setTooltipText(getTooltipMessage(title))}
        onMouseLeave={() => setTooltipText("")}
      >
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      
        {/* Default overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-xl md:text-2xl mb-2">{title}</h3>
          <p className="text-white/80 text-sm mb-3">{outcome}</p>
          <div className="flex flex-wrap gap-2">
            {stack.map((tech, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-white/20 text-white rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-white/60 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="max-w-4xl w-full text-white"
              >
                <h3 className="text-2xl sm:text-3xl md:text-5xl mb-8 tracking-tight">{title}</h3>
                
                <div className="space-y-8 text-sm sm:text-base md:text-lg">
                  <div>
                    <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Context</h4>
                    <p className="text-white/90 leading-relaxed">{context}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Problem</h4>
                    <p className="text-white/90 leading-relaxed">{problem}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Approach</h4>
                    <p className="text-white/90 leading-relaxed">{approach}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool, idx) => (
                        <span key={idx} className="text-sm px-3 py-1.5 bg-white/10 text-white rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Outcome</h4>
                    <p className="text-white/90 leading-relaxed">{resultDetail}</p>
                  </div>

                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-white underline hover:text-white/80 text-lg"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
