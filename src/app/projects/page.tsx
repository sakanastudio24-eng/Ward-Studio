import type { Metadata } from "next";
import { ProjectsClient } from "./ProjectsClient";
import { toAbsoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Projects — Ward Studio",
  description:
    "Selected product, mobile, automation, and design work focused on structured execution and real-world delivery.",
  openGraph: {
    title: "Projects — Ward Studio",
    description:
      "Selected product, mobile, automation, and design work focused on structured execution and real-world delivery.",
    url: toAbsoluteUrl("/projects"),
    siteName: "Ward Studio",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ward Studio projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects — Ward Studio",
    description:
      "Selected product, mobile, automation, and design work focused on structured execution and real-world delivery.",
    images: ["/og-image.png"],
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
