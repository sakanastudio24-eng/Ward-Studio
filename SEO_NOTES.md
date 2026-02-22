# SEO Notes (Ward Studio)

This file tracks SEO guardrails and deployment checks for the public site.

## Canonical and Metadata

- Root metadata lives in `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/layout.tsx`.
- Page-level metadata is set in:
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/products/page.tsx`
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/projects/page.tsx`
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/products/success/page.tsx`
- `SITE_URL`/`NEXT_PUBLIC_SITE_URL` must resolve to the production host with protocol.

## Indexing Rules

- Public pages intended for indexing:
  - `/`
  - `/products`
  - `/projects`
  - `/terms`
  - `/privacy`
- Non-indexed page:
  - `/products/success` (`robots.index=false`, `robots.follow=false`)

## Sitemap and Robots

- Primary generators:
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/sitemap.ts`
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/src/app/robots.ts`
- Static fallbacks also exist:
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/public/sitemap.xml`
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/public/robots.txt`
- Production checks:
  - [sitemap.xml](https://www.zward.studio/sitemap.xml)
  - [robots.txt](https://www.zward.studio/robots.txt)

## Social Previews

- OG/Twitter image path: `/og-image.png`
- Ensure the asset exists at:
  - `/Users/zech/Downloads/The-Big-One/Portfolio/Portfoli-website/public/og-image.png`

## Release Checklist

1. Verify page titles/descriptions on `/`, `/products`, `/projects`.
2. Verify `/products/success` remains noindex.
3. Verify sitemap includes `/projects` and `/privacy`.
4. Verify sitemap excludes `/products/success`.
5. Verify OG image renders in share debug tools.
