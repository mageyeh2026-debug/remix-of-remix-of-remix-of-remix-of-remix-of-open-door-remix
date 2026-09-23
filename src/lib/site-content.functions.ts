import { createServerFn } from "@tanstack/react-start";

import { mergeContent, type SiteContent } from "./site-content";

const REST_URL = "https://mageye-hassan-8a3ee-default-rtdb.firebaseio.com/site.json";
const FIRST_PAINT_TIMEOUT_MS = 650;

/** Short-lived server cache so repeat visits are answered instantly. */
let cache: { at: number; data: SiteContent } | null = null;
const MAX_AGE = 15_000;

/**
 * Reads the site content on the server while the page is being built, so the
 * very first HTML already contains every text and picture link.
 */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    if (cache && Date.now() - cache.at < MAX_AGE) return cache.data;
    try {
      const res = await fetch(REST_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(FIRST_PAINT_TIMEOUT_MS),
      });
      const raw = res.ok ? await res.json() : null;
      const merged = mergeContent(raw);
      cache = { at: Date.now(), data: merged };
      return merged;
    } catch {
      return cache?.data ?? mergeContent({});
    }
  },
);
