"use client";

import { HoverTooltip, useHoverTooltip } from "../components/HoverTooltip";
import { TopRightNav } from "../components/TopRightNav";
import { Work } from "../components/Work";

export function ProjectsClient() {
  const { tooltipText, mousePosition, setTooltipText } = useHoverTooltip();

  return (
    <>
      <TopRightNav setTooltipText={setTooltipText} />
      <main className="min-h-screen pb-16 sm:pb-24">
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pb-10 md:px-12">
          <h1 className="mt-6 text-[2rem] tracking-tight sm:text-[2.6rem]">All Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Built work across product systems, automation, mobile interfaces, and brand-driven design.
          </p>
        </section>

        <Work scope="all-projects" setTooltipText={setTooltipText} />
      </main>

      <HoverTooltip text={tooltipText} mouseX={mousePosition.x} mouseY={mousePosition.y} />
    </>
  );
}
