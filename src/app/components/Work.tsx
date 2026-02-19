import { useState, type MouseEvent } from "react";
import { ProjectCard } from "./ProjectCard";
import { getTooltipMessage } from "./HoverTooltip";
import { allWorkProjects, type WorkScope } from "./workData";

interface WorkProps {
  scope: WorkScope;
  setTooltipText: (text: string) => void;
}

// Work: Displays engineering and case-study project cards with scope-aware visibility.
export function Work({ scope, setTooltipText }: WorkProps) {
  const [isRoutingToProducts, setIsRoutingToProducts] = useState(false);

  const handleViewProductsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isRoutingToProducts) return;

    setTooltipText("");
    setIsRoutingToProducts(true);

    window.setTimeout(() => {
      window.location.href = "/products";
    }, 220);
  };

  const visibleProjects = allWorkProjects.filter((project) => project.visibility.includes(scope));
  const engineeringProjects = visibleProjects.filter((project) => project.section === "engineering");
  const caseStudyProjects = visibleProjects.filter((project) => project.section === "case-study");

  return (
    <section id="work" className="bg-muted/30 px-4 py-24 sm:px-6 md:px-12 md:py-32">
      <div
        className={`pointer-events-none fixed inset-0 z-40 bg-background transition-opacity duration-200 ${
          isRoutingToProducts ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-20">
          <h2 className="mb-4 text-[1.75rem] tracking-tight sm:text-[2rem] md:text-[3rem]">
            Engineering Work
          </h2>
          <p className="mb-12 text-muted-foreground">Production systems and automation builds</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {engineeringProjects.map((project, idx) => {
              const { section, visibility, ...cardProps } = project;
              return (
                <ProjectCard
                  key={`${project.title}-${section}-${idx}`}
                  {...cardProps}
                  setTooltipText={setTooltipText}
                />
              );
            })}
          </div>
        </div>

        <div>
          <div className={scope === "home" ? "text-center" : ""}>
            <h2 className="mb-4 text-[1.75rem] tracking-tight sm:text-[2rem] md:text-[3rem]">
              Product & UX Case Studies
            </h2>
            <p className="mb-12 text-muted-foreground">
              Interaction systems and interface execution across active projects
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseStudyProjects.map((project, idx) => {
              const { section, visibility, ...cardProps } = project;
              return (
                <ProjectCard
                  key={`${project.title}-${section}-${idx}`}
                  {...cardProps}
                  setTooltipText={setTooltipText}
                />
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {scope === "home" && (
              <a
                href="/projects"
                className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm text-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent sm:text-base"
                onMouseEnter={(e) =>
                  setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))
                }
                onMouseLeave={() => setTooltipText("")}
              >
                Show All Projects
              </a>
            )}

            <a
              href="/products"
              className={`inline-flex items-center rounded-md border border-orange-300/40 bg-orange-500/15 px-5 py-2.5 text-sm text-foreground transition-transform hover:bg-orange-500/25 sm:text-base ${
                isRoutingToProducts ? "pointer-events-none opacity-60" : "hover:-translate-y-0.5"
              }`}
              onClick={handleViewProductsClick}
              onMouseEnter={(e) =>
                setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))
              }
              onMouseLeave={() => setTooltipText("")}
            >
              View Products
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
