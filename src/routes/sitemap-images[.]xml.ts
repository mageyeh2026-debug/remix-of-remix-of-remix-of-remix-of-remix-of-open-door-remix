import { createFileRoute } from "@tanstack/react-router";

import {
  collectSitemapImagePages,
  escapeSitemapXml,
  fetchSitemapContent,
  SITEMAP_HEADERS,
  sitemapError,
  sitemapUrl,
} from "@/lib/sitemap.server";

function imageTag(value: string | undefined, tag: "title" | "caption") {
  return value ? `<image:${tag}>${escapeSitemapXml(value)}</image:${tag}>` : "";
}

export const Route = createFileRoute("/sitemap-images.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const pages = collectSitemapImagePages(await fetchSitemapContent());
          const entries = pages.map((page) => {
            const images = page.images.map((image) =>
              `<image:image><image:loc>${escapeSitemapXml(image.location)}</image:loc>${imageTag(image.title, "title")}${imageTag(image.caption, "caption")}</image:image>`,
            ).join("");
            return `<url><loc>${escapeSitemapXml(sitemapUrl(page.path))}</loc><changefreq>hourly</changefreq>${images}</url>`;
          }).join("");

          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}</urlset>`,
            { headers: SITEMAP_HEADERS },
          );
        } catch {
          return sitemapError();
        }
      },
    },
  },
});