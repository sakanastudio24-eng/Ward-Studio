"use client";

import { HoverTooltip, useHoverTooltip } from "../components/HoverTooltip";
import { Work } from "../components/Work";

export function ProjectsClient() {
  const { tooltipText, mousePosition, setTooltipText } = useHoverTooltip();

  return (
    <>
      <main className="min-h-screen">
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:px-12">
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Back to Home
          </a>
          <h1 className="mt-6 text-[2rem] tracking-tight sm:text-[2.6rem]">All Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Engineering builds and product case studies, including Drawer Flow Vr 1 and Terminal Adventure.
          </p>
        </section>

        <Work scope="all-projects" setTooltipText={setTooltipText} />
      </main>

      <HoverTooltip text={tooltipText} mouseX={mousePosition.x} mouseY={mousePosition.y} />
    </>
  );
}
