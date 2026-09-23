import { mergeContent, type SiteContent } from "./site-content";

export const SITEMAP_SITE_URL = "https://hassanmageye.com";

const CONTENT_URL = "https://mageye-hassan-8a3ee-default-rtdb.firebaseio.com/site.json";

export type SitemapImage = {
  location: string;
  title?: string;
  caption?: string;
};

export type SitemapImagePage = {
  path: string;
  images: SitemapImage[];
};

export function escapeSitemapXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character,
  );
}

export function sitemapUrl(path: string) {
  return `${SITEMAP_SITE_URL}${path}`;
}

export function filmPath(slug: string) {
  const encodedSlug = slug
    .split("/")
    .map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
  return `/films/${encodedSlug}`;
}

export function absoluteImageUrl(value: string) {
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return sitemapUrl(value);
  return null;
}

export async function fetchSitemapContent(): Promise<SiteContent> {
  const response = await fetch(CONTENT_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Site content request failed with status ${response.status}`);
  return mergeContent(await response.json());
}

export function collectSitemapImagePages(content: SiteContent): SitemapImagePage[] {
  const pages: SitemapImagePage[] = [];
  const homeImages: SitemapImage[] = [];
  const heroImage = absoluteImageUrl(content.hero.image);

  if (heroImage) {
    homeImages.push({
      location: heroImage,
      title: "Hassan Mageye — film director, writer and producer",
      caption: content.hero.title,
    });
  }

  for (const item of content.media.items) {
    const location = absoluteImageUrl(item.src);
    if (!location) continue;
    homeImages.push({ location, title: item.title || item.alt, caption: item.alt || item.meta });
  }
  if (homeImages.length) pages.push({ path: "/", images: homeImages });

  const seenSlugs = new Set<string>();
  for (const film of [...content.films, ...content.upcoming]) {
    if (!film.slug || seenSlugs.has(film.slug)) continue;
    seenSlugs.add(film.slug);
    const location = absoluteImageUrl(film.image);
    if (!location) continue;
    pages.push({
      path: filmPath(film.slug),
      images: [{ location, title: `${film.name} film artwork`, caption: film.logline || film.synopsis }],
    });
  }

  const galleryImages = content.gallery.items.flatMap((item) => {
    const location = absoluteImageUrl(item.src);
    if (!location) return [];
    return [{
      location,
      title: item.title || item.alt || "Hassan Mageye film production image",
      caption: item.alt || item.title,
    }];
  });
  if (galleryImages.length) pages.push({ path: "/gallery", images: galleryImages });

  return pages;
}

export const SITEMAP_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
  "X-Robots-Tag": "noindex",
};

export function sitemapError() {
  return new Response("Sitemap temporarily unavailable", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "300",
    },
  });
}