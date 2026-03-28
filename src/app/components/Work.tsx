import { useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { getRandomFeaturedProjectTooltip, getTooltipMessage } from "./HoverTooltip";
import { allWorkProjects, type WorkScope } from "./workData";

interface WorkProps {
  scope: WorkScope;
  setTooltipText: (text: string) => void;
}

// Work: Displays featured home projects and full project listings.
export function Work({ scope, setTooltipText }: WorkProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "engineering" | "design">(
    scope === "all-projects" ? "all" : "engineering",
  );
  const visibleProjects = allWorkProjects.filter((project) => project.visibility.includes(scope));
  const featuredHomeProjects = visibleProjects.filter((project) => project.homeFeatured);
  const engineeringProjects = visibleProjects.filter((project) => project.section === "engineering");
  const designProjects = visibleProjects.filter((project) => project.section === "case-study");
  const filteredProjects =
    activeFilter === "all"
      ? visibleProjects
      : activeFilter === "engineering"
        ? engineeringProjects
        : designProjects;

  if (scope === "home") {
    return (
      <section id="projects" className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-12 md:mb-14">
            <h2 className="mb-3 text-[1.55rem] tracking-tight sm:mb-4 sm:text-[2rem] md:text-[3rem]">
              Featured Projects
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-muted-foreground sm:text-base">
              Top contract-ready builds across mobile apps, interactive websites, and automation systems.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredHomeProjects.map((project, idx) => {
              const { section, visibility, homeFeatured, ...cardProps } = project;
              return (
                <ProjectCard
                  key={`${project.title}-${section}-${idx}`}
                  {...cardProps}
                  setTooltipText={setTooltipText}
                  getHoverTooltipText={() => getRandomFeaturedProjectTooltip(project.title)}
                />
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="/projects"
              className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm text-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent sm:text-base"
              onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
              onMouseLeave={() => setTooltipText("")}
            >
              Show All Projects
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h2 className="mb-3 text-[1.55rem] tracking-tight sm:mb-4 sm:text-[2rem] md:text-[3rem]">
            Projects
          </h2>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground sm:text-base">
            Filter by discipline to browse systems, apps, automation, and design work
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3 sm:mb-10">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              activeFilter === "all"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-border text-foreground hover:bg-accent"
            }`}
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            All Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("engineering")}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              activeFilter === "engineering"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-border text-foreground hover:bg-accent"
            }`}
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Engineering
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("design")}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              activeFilter === "design"
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-border text-foreground hover:bg-accent"
            }`}
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Design
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => {
            const { section, visibility, homeFeatured, ...cardProps } = project;
            return (
              <ProjectCard
                key={`${project.title}-${section}-${idx}`}
                {...cardProps}
                setTooltipText={setTooltipText}
                getHoverTooltipText={() => getRandomFeaturedProjectTooltip(project.title)}
              />
            );
          })}
        </div>
        {filteredProjects.length === 0 ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            No projects are available for this filter yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
