// HowIWork: Summarizes delivery principles and collaboration approach.
export function HowIWork() {
  const principles = [
    {
      title: "Clear scope",
      description: "Detailed project briefs with defined deliverables and milestones"
    },
    {
      title: "Structured timelines",
      description: "Realistic schedules with buffer time for revisions and testing"
    },
    {
      title: "Weekly updates",
      description: "Regular async updates and scheduled check-ins to maintain alignment"
    },
    {
      title: "Clean handoff",
      description: "Complete documentation, code comments, and training materials"
    },
    {
      title: "Long-term maintainable builds",
      description: "Production-ready code with tests, type safety, and clear architecture"
    },
    {
      title: "Transparent pricing",
      description: "Fixed-rate contracts with no hidden fees or scope creep surprises"
    }
  ];

  return (
    <section id="how-i-work" className="py-24 md:py-32 px-4 sm:px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[1.75rem] sm:text-[2rem] md:text-[3rem] mb-12 md:mb-16 tracking-tight">
          How I Work
        </h2>
        <p className="mb-8 text-base text-muted-foreground">
          I am a systems-oriented contract creative developer. I build systems that reduce friction and help businesses move faster with clarity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((principle, idx) => (
            <div key={idx} className="border-l-2 border-foreground pl-4 sm:pl-6">
              <h3 className="text-lg sm:text-xl mb-2">{principle.title}</h3>
              <p className="text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
