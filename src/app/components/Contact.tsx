import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { getTooltipMessage } from "./HoverTooltip";
import { CAL_LINKS } from "../../config/cal";

interface ContactProps {
  setTooltipText: (text: string) => void;
}

const INITIAL_FORM_DATA = {
  name: "",
  company: "",
  email: "",
  budget: "",
  timeline: "",
  projectType: "",
  goals: ""
};

// Contact: Captures project inquiry details and handles contact form submission.
export function Contact({ setTooltipText }: ContactProps) {
  const buildServices = [
    "Landing Pages",
    "Portfolio Sites",
    "Booking Platforms",
    "SaaS Dashboards",
    "Design Systems",
    "Discord Bots",
    "Automation Workflows",
    "API Backends",
    "Internal Tools",
    "UX Case Studies",
    "Brand + Product Sites",
    "Interactive Web Apps",
    "Marketing Sites",
    "Admin Panels",
    "Client Portals",
    "Payment Integrations",
    "Email Automations",
    "AI-Enhanced Features",
  ];
  const carouselServices = [...buildServices, ...buildServices, ...buildServices];

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // handleSubmit: Sends form data to the contact API and updates UI status.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseData?.error || "Could not send your message right now.");
      }

      setSubmitStatus("success");
      setSubmitMessage("Thanks for reaching out. Your message was sent to the owner email.");
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Something went wrong while sending your message."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // handleChange: Updates text and textarea fields in the contact form state.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // handleBudgetChange: Normalizes and rounds budget input to a clean numeric value.
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setFormData({ ...formData, budget: '' });
      return;
    }
    const numValue = parseInt(value);
    const rounded = Math.ceil(numValue / 10) * 10;
    setFormData({ ...formData, budget: rounded.toString() });
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-4 sm:px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            What I Can Build For You
          </p>
          <div className="relative overflow-hidden py-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
            <div className="word-carousel-right-track flex items-center gap-3 whitespace-nowrap">
              {carouselServices.map((service, idx) => (
                <div key={`${service}-${idx}`} className="flex items-center gap-3">
                  <span className="text-sm sm:text-base text-muted-foreground">{service}</span>
                  <span className="text-muted-foreground/40">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[4rem] mb-4 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            I work with 3-5 clients at a time. If you're looking for design or engineering support, let's talk.
          </p>
          <a
            href={CAL_LINKS.customProjectConsultation}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Book Custom Consultation
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget ? `$${formData.budget}` : ''}
                onChange={handleBudgetChange}
                placeholder="$10,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="e.g., 2-3 months"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Input
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              placeholder="e.g., Web App Development, Brand System, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Project Goals</Label>
            <Textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              rows={6}
              placeholder="Tell me about what you're trying to build..."
              required
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto px-12"
            disabled={isSubmitting}
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>

          {submitStatus !== "idle" && (
            <p
              role="status"
              className={`text-sm ${submitStatus === "success" ? "text-emerald-600" : "text-destructive"}`}
            >
              {submitMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
