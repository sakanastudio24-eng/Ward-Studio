import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { getTooltipMessage } from "./HoverTooltip";

interface ContactProps {
  setTooltipText: (text: string) => void;
}

// Contact: Captures project inquiry details and handles contact form submission.
export function Contact({ setTooltipText }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    budget: "",
    timeline: "",
    projectType: "",
    goals: ""
  });

  // handleSubmit: Handles form submission and resets the form after confirmation.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log("Form submitted:", formData);
    alert("Thanks for reaching out! I'll respond within 24-48 hours.");
    setFormData({
      name: "",
      company: "",
      email: "",
      budget: "",
      timeline: "",
      projectType: "",
      goals: ""
    });
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
        <div className="mb-12">
          <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[4rem] mb-4 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            I work with 3-5 clients at a time. If you're looking for design or engineering support, let's talk.
          </p>
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
            onMouseEnter={(e) => setTooltipText(getTooltipMessage(e.currentTarget.textContent || ""))}
            onMouseLeave={() => setTooltipText("")}
          >
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}
