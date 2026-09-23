export const SITE_URL = "https://hassanmageye.com";

export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/share/hassan-mageye.jpg`;

const filmShareImages: Record<string, string> = {
  "devils-chest": `${SITE_URL}/share/films/devils-chest.jpg`,
  "devil's-chest": `${SITE_URL}/share/films/devil's-chest.jpg`,
  "tinkas-story": `${SITE_URL}/share/films/tinkas-story.jpg`,
  "tinka's-story": `${SITE_URL}/share/films/tinka's-story.jpg`,
  kimote: `${SITE_URL}/share/films/kimote.jpg`,
  "bedroom-chain": `${SITE_URL}/share/films/bedroom-chain.jpg`,
  "bedroom-chains": `${SITE_URL}/share/films/bedroom-chains.jpg`,
  "galz-about": `${SITE_URL}/share/films/galz-about.jpg`,
  "kings-virgin": `${SITE_URL}/share/films/kings-virgin.jpg`,
  "the-silence-we-flee": `${SITE_URL}/share/films/the-silence-we-flee.jpg`,
  "modern-road": `${SITE_URL}/share/films/modern-road.jpg`,
  "mordern-road": `${SITE_URL}/share/films/mordern-road.jpg`,
  "john-bullock": `${SITE_URL}/share/films/john-bullock.jpg`,
};

export function absoluteSiteUrl(value: string | undefined | null) {
  if (!value) return undefined;
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SITE_URL}${value}`;
  return undefined;
}

export function filmShareImageUrl(slug: string, fallbackImage?: string) {
  return filmShareImages[slug] ?? absoluteSiteUrl(fallbackImage) ?? DEFAULT_SHARE_IMAGE;
}