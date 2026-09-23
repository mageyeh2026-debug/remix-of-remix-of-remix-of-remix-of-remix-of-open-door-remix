import { createFileRoute } from "@tanstack/react-router";

import {
  escapeSitemapXml,
  fetchSitemapContent,
  filmPath,
  SITEMAP_HEADERS,
  sitemapError,
  sitemapUrl,
} from "@/lib/sitemap.server";

const STATIC_PAGES = ["/", "/films", "/gallery", "/about", "/contact"];

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const content = await fetchSitemapContent();
          const dynamicPaths = [...content.films, ...content.upcoming]
            .filter((film) => typeof film.slug === "string" && film.slug.length > 0)
            .map((film) => filmPath(film.slug));
          const paths = Array.from(new Set([...STATIC_PAGES, ...dynamicPaths]));
          const entries = paths
            .map((path) => `<url><loc>${escapeSitemapXml(sitemapUrl(path))}</loc><changefreq>hourly</changefreq></url>`)
            .join("");

          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
            { headers: SITEMAP_HEADERS },
          );
        } catch {
          return sitemapError();
        }
      },
    },
  },
});