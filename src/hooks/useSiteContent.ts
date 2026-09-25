import { useEffect, useState } from "react";
import { useLoaderData } from "@tanstack/react-router";
import { onValue, ref, set } from "firebase/database";

import { firebaseDb, SITE_PATH } from "@/lib/firebase";
import { uploadToR2, type UploadProgress } from "@/lib/r2-upload";
import { mergeContent, type SiteContent } from "@/lib/site-content";

const CACHE_KEY = "mageye-site-content";
const EMPTY_LIVE_CONTENT = mergeContent({});

/** Keeps the last database snapshot so pages paint real content instantly. */
let memoryCache: SiteContent | null = null;

/**
 * No picture is fetched ahead of time. Every image loads exactly where it is
 * shown, the same way the film posters do, so no extra data is used.
 */
function warmImageCache(_content: SiteContent) {
  /* intentionally empty: images load where they are displayed */
}


/** Only safe after hydration — reading storage during render breaks SSR matching. */
function readStoredCache(): SiteContent | null {
  if (memoryCache) return memoryCache;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    memoryCache = mergeContent(JSON.parse(raw));
    return memoryCache;
  } catch {
    return null;
  }
}

function writeCache(raw: unknown, merged: SiteContent) {
  memoryCache = merged;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(raw ?? {}));
  } catch {
    /* storage may be full or blocked */
  }
}

/**
 * The realtime connection needs a websocket handshake before the first value
 * arrives. A plain HTTPS read of the same record answers much sooner, so we
 * fire it the moment the app script loads and paint with whatever lands first.
 */
const REST_URL = "https://mageye-hassan-8a3ee-default-rtdb.firebaseio.com/site.json";
let firstLoad: Promise<SiteContent | null> | null = null;

function fetchSiteContentFast(): Promise<SiteContent | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!firstLoad) {
    firstLoad = fetch(REST_URL, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        if (!raw) return null;
        const merged = mergeContent(raw);
        writeCache(raw, merged);
        warmImageCache(merged);
        return merged;
      })
      .catch(() => null);
  }
  return firstLoad;
}

// Start the read before any component mounts.
void fetchSiteContentFast();

export function useSiteContent() {
  // The content was already read on the server, so the first paint (server and
  // client alike) shows the real texts and pictures with no waiting.
  const ssrContent = useLoaderData({ from: "__root__" }) as SiteContent | undefined;
  const [content, setContent] = useState<SiteContent>(
    ssrContent ?? memoryCache ?? EMPTY_LIVE_CONTENT,
  );
  const [loaded, setLoaded] = useState(Boolean(ssrContent));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    let unsub = () => {};
    const stored = readStoredCache();
    if (stored) setContent(stored);
    warmImageCache(stored ?? EMPTY_LIVE_CONTENT);
    let live = false;
    // Whichever read answers first paints; the realtime one always wins later.
    void fetchSiteContentFast().then((fast) => {
      if (!active || live || !fast) return;
      setContent(fast);
      setLoaded(true);
      setLoadError(false);
    });
    try {
      unsub = onValue(
        ref(firebaseDb(), SITE_PATH),
        (snap) => {
          if (!active) return;
          live = true;
          const raw = snap.val();
          const merged = mergeContent(raw);
          writeCache(raw, merged);
          setContent(merged);
          setLoaded(true);
          setLoadError(false);
          warmImageCache(merged);
        },
        () => {
          if (!active) return;
          setLoadError(true);
        },
      );
    } catch {
      /* Keep the cached content visible when the live read is unavailable. */
      setLoadError(true);
    }
    return () => {
      active = false;
      unsub();
    };
  }, []);

  return { content, loaded, ready: loaded, loadError };
}

export async function saveSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
  await set(ref(firebaseDb(), `${SITE_PATH}/${String(key)}`), value);
}

/** Every item id the dashboard has ever been shown. */
const seenIds = new Set<string>();
const itemKey = (item: any) => String(item?.id ?? item?.slug ?? item?.src ?? "");

export function rememberItems(content: SiteContent) {
  const c: any = content;
  for (const list of [c.films, c.upcoming, c.gallery?.items, c.media?.items, c.services?.items]) {
    if (Array.isArray(list)) for (const item of list) seenIds.add(itemKey(item));
  }
}

/**
 * Keeps anything stored online that this dashboard never saw (uploaded from
 * another tab/device, or before the page loaded). Only items the admin could
 * see and chose to remove are left out.
 */
function mergeList(draft: unknown, stored: unknown) {
  const mine = Array.isArray(draft) ? draft : [];
  if (!Array.isArray(stored)) return mine;
  const have = new Set(mine.map(itemKey));
  const extra = stored.filter((item) => {
    const key = itemKey(item);
    return key && !have.has(key) && !seenIds.has(key);
  });
  return [...mine, ...extra];
}

/** Saves the dashboard without ever wiping content stored online. */
export async function saveAll(content: SiteContent) {
  const { get, update } = await import("firebase/database");
  const snap = await get(ref(firebaseDb(), SITE_PATH));
  const current = (snap.val() ?? {}) as any;
  const next: any = JSON.parse(JSON.stringify(content));
  next.films = mergeList(next.films, current.films);
  next.upcoming = mergeList(next.upcoming, current.upcoming);
  for (const key of ["gallery", "media", "services"]) {
    if (!next[key]) continue;
    next[key].items = mergeList(next[key].items, current[key]?.items);
  }
  rememberItems(next);
  // update() only touches the sections sent — nothing else in the database is removed.
  await update(ref(firebaseDb(), SITE_PATH), next);
}

/** Media (images, videos, trailers) go straight to Cloudflare R2. */
export async function uploadImage(
  file: File,
  folder = "uploads",
  onProgress?: (p: UploadProgress) => void,
) {
  return uploadToR2(`media/${folder}`, file, onProgress);
}
