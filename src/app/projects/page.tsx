import type { Metadata } from "next";
import { ProjectsClient } from "./ProjectsClient";

export const metadata: Metadata = {
  title: "All Projects | Ward Studio",
  description:
    "Full project index with engineering builds and case studies, including Terminal Adventure Vr 1.",
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
