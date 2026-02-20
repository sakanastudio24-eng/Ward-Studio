import type { MetadataRoute } from "next";
import { SITE_URL, toAbsoluteUrl } from "../config/site";

/**
 * Canonical robots output so host/sitemap stay aligned with deployment domain.
 */
export default function robots(): MetadataRoute.Robots {
  const host = new URL(SITE_URL).host;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host,
  };
}
