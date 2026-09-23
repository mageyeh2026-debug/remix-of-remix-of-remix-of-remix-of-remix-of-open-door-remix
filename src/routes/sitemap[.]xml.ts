import { createFileRoute } from "@tanstack/react-router";

import { SITEMAP_HEADERS, sitemapUrl } from "@/lib/sitemap.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${sitemapUrl("/sitemap-pages.xml")}</loc></sitemap><sitemap><loc>${sitemapUrl("/sitemap-images.xml")}</loc></sitemap></sitemapindex>`,
        { headers: SITEMAP_HEADERS },
      ),
    },
  },
});
