import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getTooltipMessage } from "./HoverTooltip";
import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

export interface ProjectCardProps {
  title: string;
  outcome: string;
  stack: string[];
  context: string;
  problem: string;
  approach: string;
  tools: string[];
  resultDetail: string;
  link?: string;
  productLink?: string;
  image: string;
  galleryImages?: string[];
  summary?: string;
  whyBuilt?: string;
  howStarted?: string;
  whatItCanDo?: string[];
  testsAndEdgeCases?: string[];
  skillReflection?: string;
  skillsUsed?: string[];
  statusLabel?: string;
  linkLabel?: string;
  productLabel?: string;
  placeholderColor: string;
  setTooltipText: (text: string) => void;
  presentationMode?: "overlay" | "drawer-vr1";
  hidePreviewImage?: boolean;
  interactiveOverlayParts?: Array<{
    id: string;
    label: string;
    title: string;
    description: string;
    bullets: string[];
  }>;
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
  productLink,
  image,
  galleryImages,
  summary,
  whyBuilt,
  howStarted,
  whatItCanDo,
  testsAndEdgeCases,
  skillReflection,
  skillsUsed,
  statusLabel,
  linkLabel,
  productLabel,
  placeholderColor,
  setTooltipText,
  presentationMode = "overlay",
  hidePreviewImage = false,
  interactiveOverlayParts,
}: ProjectCardProps) {
  type PreviewTheme = "dark" | "light";
  const [isOpen, setIsOpen] = useState(false);
  const [activeFlowPartIdx, setActiveFlowPartIdx] = useState(0);
  const [isPartPreviewOpen, setIsPartPreviewOpen] = useState(false);
  const [previewFlowPartIdx, setPreviewFlowPartIdx] = useState(0);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("dark");
  const interactiveParts = interactiveOverlayParts ?? [];
  const gallery = galleryImages && galleryImages.length > 0 ? galleryImages : [image];
  const isDrawerVr1 = presentationMode === "drawer-vr1";
  const hasInteractiveOverlay = interactiveParts.length > 0;
  const activeInteractivePart = hasInteractiveOverlay
    ? interactiveParts[Math.min(activeFlowPartIdx, interactiveParts.length - 1)]
    : null;
  const previewInteractivePart = hasInteractiveOverlay
    ? interactiveParts[Math.min(previewFlowPartIdx, interactiveParts.length - 1)]
    : null;
  const isBottomPartPreview =
    previewInteractivePart?.id === "part-1" ||
    previewInteractivePart?.id === "part-2" ||
    previewInteractivePart?.id === "part-3" ||
    previewInteractivePart?.id === "part-4";
  const partPreviewDirection = isBottomPartPreview ? "bottom" : "right";
  const renderedSummary = summary || context;
  const renderedWhyBuilt = whyBuilt || problem;
  const renderedHowStarted = howStarted || approach;
  const renderedWhatItCanDo = whatItCanDo && whatItCanDo.length > 0 ? whatItCanDo : [approach];
  const renderedTestsAndEdgeCases =
    testsAndEdgeCases && testsAndEdgeCases.length > 0 ? testsAndEdgeCases : [resultDetail];
  const renderedSkillReflection = skillReflection || resultDetail;
  const renderedSkillsUsed = skillsUsed && skillsUsed.length > 0 ? skillsUsed : tools;
  const isPreviewThemeDark = previewTheme === "dark";
  const interactivePanelClass = isPreviewThemeDark
    ? "mb-8 rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5"
    : "mb-8 rounded-lg border border-border bg-background p-4 sm:p-5";
  const interactiveEyebrowClass = isPreviewThemeDark
    ? "text-white/60"
    : "text-muted-foreground";
  const interactiveHintClass = isPreviewThemeDark ? "text-white/70" : "text-muted-foreground";
  const themeToggleInactiveClass = isPreviewThemeDark
    ? "border-white/20 bg-white/10 text-white/85"
    : "border-border bg-muted text-foreground";
  const interactiveChipActiveClass = isPreviewThemeDark
    ? "border-orange-300/60 bg-orange-500/20 text-orange-100"
    : "border-orange-400/70 bg-orange-100 text-orange-900";
  const interactiveChipInactiveClass = isPreviewThemeDark
    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
    : "border-border bg-muted text-foreground hover:bg-muted/70";
  const interactiveDetailClass = isPreviewThemeDark
    ? "rounded-md border border-white/10 bg-black/30 p-4"
    : "rounded-md border border-border bg-muted/20 p-4";
  const interactiveDetailTitleClass = isPreviewThemeDark ? "text-white" : "text-foreground";
  const interactiveDetailBodyClass = isPreviewThemeDark ? "text-white/85" : "text-foreground";
  const interactiveDetailBulletClass = isPreviewThemeDark ? "text-white/90" : "text-foreground";
  const unifiedBlockClass = isPreviewThemeDark
    ? "mt-4 rounded-md border border-white/10 bg-white/5 p-3"
    : "mt-4 rounded-md border border-border bg-background p-3";
  const unifiedPillClass = isPreviewThemeDark
    ? "rounded border border-white/20 px-2.5 py-1 text-xs text-white"
    : "rounded border border-border bg-muted px-2.5 py-1 text-xs text-foreground";
  const openInteractivePartPreview = (idx: number) => {
    if (!hasInteractiveOverlay) return;
    setActiveFlowPartIdx(idx);
    setPreviewFlowPartIdx(idx);
    setIsPartPreviewOpen(true);
  };

  const renderDetailflowPartPreview = (partId: string, theme: PreviewTheme) => {
    const isDark = theme === "dark";
    const shell = isDark
      ? "mb-3 space-y-2 rounded-md border border-white/10 bg-white/5 p-3"
      : "mb-3 space-y-2 rounded-md border border-border bg-muted/20 p-3";
    const eyebrow = isDark
      ? "text-[11px] uppercase tracking-wide text-white/60"
      : "text-[11px] uppercase tracking-wide text-muted-foreground";
    const textMain = isDark ? "text-white" : "text-foreground";
    const textMuted = isDark ? "text-white/70" : "text-muted-foreground";
    const neutralCard = isDark
      ? "rounded border border-white/15 bg-black/20 p-2"
      : "rounded border border-border bg-background p-2";
    const neutralPill = isDark
      ? "rounded border border-white/20 bg-black/20 px-2 py-1 text-[11px] text-white/80"
      : "rounded border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground";
    const accentTone = isDark
      ? "border-orange-300/50 bg-orange-500/15 text-orange-100"
      : "border-orange-400/70 bg-orange-100 text-orange-900";
    const accentToneStrong = isDark
      ? "border-orange-300/60 bg-orange-500/20 text-orange-100"
      : "border-orange-400/70 bg-orange-100 text-orange-900";
    const warningTone = isDark
      ? "rounded border border-orange-300/40 bg-orange-500/10 px-2 py-1 text-orange-100"
      : "rounded border border-orange-400/70 bg-orange-100 px-2 py-1 text-orange-900";

    if (partId === "part-1") {
      return (
        <div className={shell}>
          <p className={eyebrow}>Tier Selector</p>
          <div className="space-y-2">
            {[
              { label: "Starter", meta: "$369 total • $185 deposit", active: true },
              { label: "Growth", meta: "$749 total • $375 deposit", active: false },
              { label: "Pro Launch", meta: "$1299 total • $650 deposit", active: false },
            ].map((tier) => (
              <div
                key={tier.label}
                className={`rounded border p-2 text-xs ${
                  tier.active
                    ? accentTone
                    : isDark
                      ? "border-white/15 bg-black/20 text-white/90"
                      : "border-border bg-background text-foreground"
                }`}
              >
                <p className={`font-medium ${textMain}`}>{tier.label}</p>
                <p className={textMuted}>{tier.meta}</p>
              </div>
            ))}
          </div>
          <p className={`pt-1 ${eyebrow}`}>Booking Preference</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <span className={`rounded border px-2 py-1 text-[11px] ${accentTone}`}>
              External link
            </span>
            <span className={neutralPill}>Iframe</span>
            <span className={neutralPill}>Contact only</span>
          </div>
        </div>
      );
    }

    if (partId === "part-2") {
      return (
        <div className={shell}>
          <p className={eyebrow}>Addon Selector</p>
          {[
            {
              label: "Advanced Email Styling",
              note: "Selected",
              price: "+$120",
              checked: true,
            },
            {
              label: "Booking Setup Assistance",
              note: "Optional",
              price: "+$180",
              checked: false,
            },
          ].map((addon) => (
            <div key={addon.label} className={`flex items-start justify-between gap-3 ${neutralCard}`}>
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    addon.checked
                      ? accentToneStrong
                      : isDark
                        ? "border-white/30 bg-black/30 text-transparent"
                        : "border-border bg-muted/40 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <div>
                  <p className={`text-xs font-medium ${textMain}`}>{addon.label}</p>
                  <p className={`text-[11px] ${textMuted}`}>{addon.note}</p>
                </div>
              </div>
              <span className={`text-xs ${textMuted}`}>{addon.price}</span>
            </div>
          ))}
        </div>
      );
    }

    if (partId === "part-3") {
      return (
        <div className={shell}>
          <p className={eyebrow}>Readiness Gate</p>
          <div className={`h-2 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-muted"}`}>
            <div className="h-full w-2/3 bg-orange-500" />
          </div>
          <p className={`text-[11px] ${textMuted}`}>2/3 readiness checks complete</p>
          <div className="space-y-1 text-xs">
            <div className={`${neutralCard} ${textMain}`}>✓ Brand identity confirmed</div>
            <div className={`${neutralCard} ${textMain}`}>✓ Photos prepared</div>
            <div className={warningTone}>
              Missing: booking method finalization
            </div>
          </div>
        </div>
      );
    }

    if (partId === "part-4") {
      return (
        <div className={shell}>
          <p className={eyebrow}>Success Drawer</p>
          <button
            type="button"
            className={`w-full rounded border px-3 py-2 text-xs font-medium ${accentToneStrong}`}
          >
            Book Your Free Strategy Call
          </button>
          <div className={`${neutralCard} text-xs`}>
            <p className={`font-medium ${textMain}`}>Payment confirmed</p>
            <p className={textMuted}>Order ID: DF-2048</p>
          </div>
          <div className={`${neutralCard} text-xs`}>
            <p className={`mb-1 font-medium ${textMain}`}>Generated configuration</p>
            <p className={`truncate ${textMuted}`}>
              Biz name selected Starter with advanced_email_styling...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={shell}>
        <p className={eyebrow}>Combined Flow</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {["PlanSelector", "AddonSelector", "ReadinessGate", "SuccessDrawer"].map((piece, idx) => (
            <div key={piece} className={neutralCard}>
              <p className={`text-xs font-medium ${textMain}`}>
                {idx + 1}. {piece}
              </p>
            </div>
          ))}
        </div>
        <p className={`text-xs ${textMuted}`}>
          Flow: tier -&gt; add-ons -&gt; readiness -&gt; checkout -&gt; post-purchase handoff.
        </p>
      </div>
    );
  };

  return (
    <>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer bg-muted"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setTooltipText(getTooltipMessage(title))}
        onMouseLeave={() => setTooltipText("")}
      >
        {!hidePreviewImage && (
          <ImageWithFallback
            src={gallery[0]}
            alt={`${title} preview`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: hidePreviewImage
              ? `linear-gradient(135deg, ${placeholderColor}40 0%, rgba(17,17,17,0.94) 70%), repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 9px)`
              : `linear-gradient(to top, rgba(0,0,0,0.86), rgba(0,0,0,0.4), transparent), radial-gradient(circle at top right, ${placeholderColor}22, transparent 45%)`,
          }}
        />

        {/* Default overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
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

      {isDrawerVr1 ? (
        <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-full w-full sm:max-w-[42rem]">
            <DrawerHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <DrawerTitle className="text-xl">{title}</DrawerTitle>
                <span className="rounded-full border border-orange-400/40 bg-orange-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wide text-orange-600">
                  Vr 1
                </span>
                {statusLabel && statusLabel !== "Vr 1" && (
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {statusLabel}
                  </span>
                )}
              </div>
              <DrawerDescription>{outcome}</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 overflow-y-auto px-4 pb-2">
              <section className="rounded-lg border border-border p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Part 1: Overview
                </h4>
                <p className="text-sm text-foreground">{renderedSummary}</p>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Part 2: Build Story
                </h4>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Why:</span> {renderedWhyBuilt}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-medium">How:</span> {renderedHowStarted}
                </p>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Part 3: Case Studies
                </h4>

                {gallery.length > 1 ? (
                  <Carousel opts={{ loop: true }} className="mb-4 w-full">
                    <CarouselContent className="ml-0">
                      {gallery.map((galleryImage, idx) => (
                        <CarouselItem key={`${galleryImage}-${idx}`} className="pl-0">
                          <div className="overflow-hidden rounded-lg border border-border">
                            <ImageWithFallback
                              src={galleryImage}
                              alt={`${title} case study image ${idx + 1}`}
                              className="w-full aspect-[16/9] object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 h-9 w-9 border-border bg-background text-foreground hover:bg-accent" />
                    <CarouselNext className="right-3 top-1/2 -translate-y-1/2 h-9 w-9 border-border bg-background text-foreground hover:bg-accent" />
                  </Carousel>
                ) : (
                  <div className="mb-4 overflow-hidden rounded-lg border border-border">
                    <ImageWithFallback
                      src={gallery[0]}
                      alt={`${title} case study image`}
                      className="w-full aspect-[16/9] object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Capabilities</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                      {renderedWhatItCanDo.map((item, idx) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tests and Edge Cases
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                      {renderedTestsAndEdgeCases.map((item, idx) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Part 4: Skills and Links
                </h4>
                <p className="text-sm text-foreground">{renderedSkillReflection}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {renderedSkillsUsed.map((tool, idx) => (
                    <span key={`${tool}-${idx}`} className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground">
                      {tool}
                    </span>
                  ))}
                </div>

                {(productLink || link) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {productLink && (
                      <a
                        href={productLink}
                        className="inline-flex items-center rounded-md border border-orange-300/40 bg-orange-500/15 px-4 py-2 text-sm text-foreground hover:bg-orange-500/25"
                        onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
                        onMouseLeave={() => setTooltipText("")}
                      >
                        {productLabel || "View Product"}
                      </a>
                    )}
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
                        onMouseLeave={() => setTooltipText("")}
                      >
                        {linkLabel || "GitHub"}
                      </a>
                    )}
                  </div>
                )}
              </section>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button className="bg-orange-500 text-white hover:bg-orange-600">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
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
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl sm:text-3xl md:text-5xl tracking-tight">{title}</h3>
                    {statusLabel && (
                      <span className="rounded-full border border-orange-400/40 bg-orange-500/20 px-3 py-1 text-xs uppercase tracking-wider text-orange-300">
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-8 text-sm sm:text-base md:text-lg">{renderedSummary}</p>

                  {hasInteractiveOverlay ? (
                    <div className={interactivePanelClass}>
                      <p className={`mb-3 text-xs uppercase tracking-wider ${interactiveEyebrowClass}`}>
                        Interactive Flow
                      </p>
                      <p className={`mb-3 text-xs ${interactiveHintClass}`}>
                        Click a part to preview it in a live drawer.
                      </p>
                      <div className="mb-4 flex items-center gap-2">
                        <span className={`text-[11px] uppercase tracking-wide ${interactiveEyebrowClass}`}>Theme</span>
                        <button
                          type="button"
                          onClick={() => setPreviewTheme("dark")}
                          className={`rounded-md border px-2.5 py-1 text-xs ${
                            previewTheme === "dark"
                              ? interactiveChipActiveClass
                              : themeToggleInactiveClass
                          }`}
                        >
                          Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTheme("light")}
                          className={`rounded-md border px-2.5 py-1 text-xs ${
                            previewTheme === "light"
                              ? interactiveChipActiveClass
                              : themeToggleInactiveClass
                          }`}
                        >
                          Light
                        </button>
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {interactiveParts.map((part, idx) => (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => {
                              setActiveFlowPartIdx(idx);
                              setPreviewFlowPartIdx(idx);
                            }}
                            className={`rounded-md border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                              idx === activeFlowPartIdx
                                ? interactiveChipActiveClass
                                : interactiveChipInactiveClass
                            }`}
                          >
                            {part.label}
                          </button>
                        ))}
                      </div>

                      {activeInteractivePart && (
                        <div className={interactiveDetailClass}>
                          <h4 className={`mb-2 text-base sm:text-lg ${interactiveDetailTitleClass}`}>
                            {activeInteractivePart.title}
                          </h4>
                          {renderDetailflowPartPreview(activeInteractivePart.id, previewTheme)}
                          <p className={`mb-3 text-sm leading-relaxed sm:text-base ${interactiveDetailBodyClass}`}>
                            {activeInteractivePart.description}
                          </p>
                          <ul className={`list-disc space-y-2 pl-5 text-sm ${interactiveDetailBulletClass}`}>
                            {activeInteractivePart.bullets.map((item, idx) => (
                              <li key={`${activeInteractivePart.id}-${idx}`}>{item}</li>
                            ))}
                          </ul>

                          {activeInteractivePart.id === "part-5" && (
                            <div className={unifiedBlockClass}>
                              <p className={`mb-2 text-xs uppercase tracking-wider ${interactiveEyebrowClass}`}>
                                Unified Sequence
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {["PlanSelector", "AddonSelector", "ReadinessGate", "SuccessDrawer"].map(
                                  (piece) => (
                                    <span
                                      key={piece}
                                      className={unifiedPillClass}
                                    >
                                      {piece}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          <Button
                            type="button"
                            className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => openInteractivePartPreview(activeFlowPartIdx)}
                          >
                            Open Drawer Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : gallery.length === 1 ? (
                    <div className="mb-8 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <ImageWithFallback
                        src={gallery[0]}
                        alt={`${title} case study image`}
                        className="w-full aspect-[16/9] object-cover"
                      />
                    </div>
                  ) : (
                    <Carousel opts={{ loop: true }} className="mb-8 w-full">
                      <CarouselContent className="ml-0">
                        {gallery.map((galleryImage, idx) => (
                          <CarouselItem key={`${galleryImage}-${idx}`} className="pl-0">
                            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                              <ImageWithFallback
                                src={galleryImage}
                                alt={`${title} case study image ${idx + 1}`}
                                className="w-full aspect-[16/9] object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 h-9 w-9 border-white/20 bg-black/60 text-white hover:bg-black/80" />
                      <CarouselNext className="right-3 top-1/2 -translate-y-1/2 h-9 w-9 border-white/20 bg-black/60 text-white hover:bg-black/80" />
                    </Carousel>
                  )}

                  <div className="space-y-8 text-sm sm:text-base md:text-lg">
                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Why I Built It</h4>
                      <p className="text-white/90 leading-relaxed">{renderedWhyBuilt}</p>
                    </div>

                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">How It Started</h4>
                      <p className="text-white/90 leading-relaxed">{renderedHowStarted}</p>
                    </div>

                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">What It Can Do</h4>
                      <ul className="space-y-2 text-white/90 leading-relaxed list-disc pl-5">
                        {renderedWhatItCanDo.map((item, idx) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Tests & Edge Cases</h4>
                      <ul className="space-y-2 text-white/90 leading-relaxed list-disc pl-5">
                        {renderedTestsAndEdgeCases.map((item, idx) => (
                          <li key={`${item}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Skill Reflection</h4>
                      <p className="text-white/90 leading-relaxed">{renderedSkillReflection}</p>
                    </div>

                    <div>
                      <h4 className="text-white/60 uppercase text-xs tracking-wider mb-3">Skills Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {renderedSkillsUsed.map((tool, idx) => (
                          <span key={idx} className="text-sm px-3 py-1.5 bg-white/10 text-white rounded">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(productLink || link) && (
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {productLink && (
                          <a
                            href={productLink}
                            className="inline-flex items-center rounded-md border border-orange-300/40 bg-orange-500/20 px-4 py-2 text-orange-100 hover:bg-orange-500/30 text-sm sm:text-base"
                            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
                            onMouseLeave={() => setTooltipText("")}
                          >
                            {productLabel || "View Product"}
                          </a>
                        )}
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-md border border-white/30 bg-white/10 px-4 py-2 text-white hover:bg-white/20 text-sm sm:text-base"
                            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
                            onMouseLeave={() => setTooltipText("")}
                          >
                            {linkLabel || "GitHub"}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {hasInteractiveOverlay && previewInteractivePart && (
        <Drawer direction={partPreviewDirection} open={isPartPreviewOpen} onOpenChange={setIsPartPreviewOpen}>
          <DrawerContent
            className={
              isBottomPartPreview
                ? "w-full max-h-[88vh]"
                : "h-full w-full sm:max-w-[34rem]"
            }
          >
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-lg">
                {previewInteractivePart.label}: {previewInteractivePart.title}
              </DrawerTitle>
              <DrawerDescription>DetailFlow component preview drawer.</DrawerDescription>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Theme</span>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("dark")}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    previewTheme === "dark"
                      ? "border-orange-300/60 bg-orange-500/15 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    previewTheme === "light"
                      ? "border-orange-300/60 bg-orange-500/15 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  Light
                </button>
              </div>
            </DrawerHeader>

            <div className="space-y-4 overflow-y-auto px-4 pb-2">
              <section className="rounded-lg border border-border p-3">
                {renderDetailflowPartPreview(previewInteractivePart.id, previewTheme)}
              </section>

              <section className="rounded-lg border border-border p-3">
                <p className="text-sm text-foreground">{previewInteractivePart.description}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {previewInteractivePart.bullets.map((item, idx) => (
                    <li key={`${previewInteractivePart.id}-bullet-${idx}`}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button className="bg-orange-500 text-white hover:bg-orange-600">Close Preview</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
