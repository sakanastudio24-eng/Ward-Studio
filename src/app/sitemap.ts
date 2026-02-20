import type { MetadataRoute } from "next";
import { toAbsoluteUrl } from "../config/site";

/**
 * Central sitemap output for App Router.
 * This takes priority over static public/sitemap.xml in production.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-02-20T00:00:00.000Z");

  return [
    {
      url: toAbsoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/products"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: toAbsoluteUrl("/projects"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: toAbsoluteUrl("/terms"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
