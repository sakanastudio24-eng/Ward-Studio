import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
}

const DEFAULT_TITLE = "Ward Studio - Design & Engineering Contractor | Zechariah Ward";
const DEFAULT_DESCRIPTION =
  "Professional contractor specializing in design systems, brand identity, web engineering with Next.js/React, and digital integrations. Building production-ready tools for growing businesses.";
const DEFAULT_CANONICAL = "https://wardstudio.com/";
const DEFAULT_IMAGE = "https://wardstudio.com/favicon.svg";

// upsertMetaByName: Creates or updates a meta tag selected by name.
function upsertMetaByName(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// upsertMetaByProperty: Creates or updates a meta tag selected by property.
function upsertMetaByProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// upsertCanonicalLink: Creates or updates the canonical link tag.
function upsertCanonicalLink(href: string) {
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute("href", href);
}

// SEOHead: Keeps runtime metadata aligned for title, canonical, and social tags.
export function SEOHead({ 
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = DEFAULT_CANONICAL,
  image = DEFAULT_IMAGE,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    upsertMetaByName("title", title);
    upsertMetaByName("description", description);

    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:site_name", "Ward Studio");
    upsertMetaByProperty("og:title", title);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:url", canonical);
    upsertMetaByProperty("og:image", image);
    upsertMetaByProperty("og:image:alt", "Ward Studio brand mark");

    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", title);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:url", canonical);
    upsertMetaByName("twitter:image", image);

    upsertCanonicalLink(canonical);
  }, [title, description, canonical, image]);
  
  return null;
}
