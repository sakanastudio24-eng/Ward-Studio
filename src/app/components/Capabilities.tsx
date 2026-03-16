"use client";

import { useEffect, useRef, useState } from "react";
import { getTooltipMessage } from "./HoverTooltip";

interface CapabilitiesProps {
  setTooltipText: (text: string) => void;
}

// Capabilities: Home services section grouped by delivery area.
export function Capabilities({ setTooltipText }: CapabilitiesProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [lingerService, setLingerService] = useState<string | null>(null);
  const lingerTimerRef = useRef<number | null>(null);
  const ACCORDION_DURATION_MS = 650;
  const EXPANDED_HEIGHT_CLASS = "h-[22.5rem]";
  const COLLAPSED_HEIGHT_CLASS = "h-[15rem]";
  const COLLAPSED_VIEWPORT_HEIGHT_CLASS = "h-[8.5rem]";

  const serviceGroups = [
    {
      title: "Websites",
      items: [
        "Landing pages",
        "Business websites",
        "Portfolio sites",
        "Marketing pages",
        "Conversion-focused page systems",
      ],
    },
    {
      title: "App Development",
      items: [
        "MVP mobile apps",
        "Product prototypes",
        "Full-stack applications",
        "API-connected app features",
        "Scalable product architecture",
      ],
    },
    {
      title: "Automation",
      items: [
        "Discord bots",
        "Workflow tools",
        "API integrations",
        "Webhook automation",
        "Operational notifications",
      ],
    },
    {
      title: "Design Services",
      items: [
        "Brand identity systems",
        "UI systems",
        "Visual direction",
        "Design token planning",
        "Interaction and layout refinement",
      ],
    },
  ];

  function getServiceTooltip(title: string): string {
    const key = title.toLowerCase();
    if (key === "websites") {
      return "Web builds for brand presentation and conversion.";
    }
    if (key === "app development") {
      return "Product apps from prototype to production architecture.";
    }
    if (key === "automation") {
      return "Workflow and integration automation to reduce manual ops.";
    }
    if (key === "design services") {
      return "Brand and UI direction for clear product presentation.";
    }
    return getTooltipMessage(title);
  }

  function toggleService(title: string) {
    setExpandedService((current) => {
      if (current === title) {
        setLingerService(null);
        return null;
      }

      if (current && current !== title) {
        setLingerService(current);
        if (lingerTimerRef.current) {
          window.clearTimeout(lingerTimerRef.current);
        }
        lingerTimerRef.current = window.setTimeout(() => {
          setLingerService((active) => (active === current ? null : active));
          lingerTimerRef.current = null;
        }, ACCORDION_DURATION_MS);
      } else {
        setLingerService(null);
      }

      return title;
    });
  }

  useEffect(() => {
    return () => {
      if (lingerTimerRef.current) {
        window.clearTimeout(lingerTimerRef.current);
      }
    };
  }, []);

  return (
    <section id="services" className="px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-4 text-[1.75rem] tracking-tight text-foreground dark:text-white sm:text-[2rem] md:mb-6 md:text-[3rem]">
          Services
        </h2>
        <p className="mb-10 max-w-3xl text-sm text-muted-foreground dark:text-white/70 sm:text-base md:mb-12">
          Independent developer building websites, apps, and automation tools for startups and businesses.
        </p>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {serviceGroups.map((group, index) => {
            const isExpanded = expandedService === group.title || lingerService === group.title;
            const isUpTrack = index % 2 === 0;
            const previewItems = [...group.items, ...group.items];

            return (
              <button
                key={group.title}
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleService(group.title)}
                onMouseEnter={() => setTooltipText(getServiceTooltip(group.title))}
                onMouseLeave={() => setTooltipText("")}
                onFocus={() => setTooltipText(getServiceTooltip(group.title))}
                onBlur={() => setTooltipText("")}
                className={`${isExpanded ? EXPANDED_HEIGHT_CLASS : COLLAPSED_HEIGHT_CLASS} w-full rounded-xl border p-5 text-left transition-[height,border-color,background-color,color] duration-300 ${
                  isExpanded
                    ? "border-white/85 bg-black text-white shadow-[0_10px_35px_-15px_rgba(255,255,255,0.2)]"
                    : "border-white/40 bg-black text-white hover:border-white/80 hover:bg-black"
                }`}
              >
                <div className="mb-4 flex items-center justify-center">
                  <h3 className="text-center text-lg font-medium sm:text-xl">{group.title}</h3>
                </div>

                <div className={`relative ${isExpanded ? "h-[13.75rem]" : COLLAPSED_VIEWPORT_HEIGHT_CLASS}`}>
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] ease-out ${
                      isExpanded ? "max-h-[13.75rem] opacity-100" : "max-h-0 opacity-0"
                    }`}
                    style={{ transitionDuration: `${ACCORDION_DURATION_MS}ms` }}
                  >
                    <ul className="h-[13.75rem] space-y-2 overflow-y-auto pr-1 text-sm sm:text-base">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-md px-3 py-2 text-center text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`overflow-hidden transition-[max-height,opacity] ease-out ${
                      isExpanded ? "max-h-0 opacity-0" : "max-h-[8.5rem] opacity-100"
                    }`}
                    style={{ transitionDuration: `${ACCORDION_DURATION_MS}ms` }}
                  >
                    <div className={`services-preview-viewport ${COLLAPSED_VIEWPORT_HEIGHT_CLASS} rounded-md bg-black`}>
                      <div
                        className={
                          isUpTrack
                            ? "services-preview-track services-preview-track-up"
                            : "services-preview-track services-preview-track-down"
                        }
                      >
                        {previewItems.map((item, itemIndex) => (
                          <p
                            key={`${group.title}-${item}-${itemIndex}`}
                            className="services-preview-line px-3 py-2 text-center text-sm text-white/85 sm:text-base"
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
