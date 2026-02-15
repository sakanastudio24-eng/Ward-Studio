// Capabilities: Lists the core services and technical offerings.
export function Capabilities() {
  const capabilities = [
    "Brand identity",
    "UI systems",
    "Visual direction",
    "Design tokens",
    "Next.js / React builds",
    "TypeScript production apps",
    "Python backends (Django)",
    "Performance optimization",
    "Booking flows",
    "Email systems",
    "Webhooks",
    "API integrations"
  ];

  return (
    <section id="capabilities" className="py-24 md:py-32 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-[1.75rem] sm:text-[2rem] md:text-[3rem] mb-12 md:mb-16 tracking-tight">
          Capabilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {capabilities.map((capability, idx) => (
            <div key={idx} className="border-l-2 border-foreground pl-4">
              <p className="text-muted-foreground">{capability}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
