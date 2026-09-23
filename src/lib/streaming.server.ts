// Server-only media sources. These URLs never reach the client bundle: the
// player always talks to /api/public/stream/<token>, which proxies them.
import { firebaseConfig, SITE_PATH } from "./firebase";
import type { PlaybackKind } from "./playback";

export type Source = { url: string; type: PlaybackKind };

type StoredFilm = { slug?: string; name?: string; videoUrl?: string; trailerUrl?: string };

const CONTENT_URL = `${firebaseConfig.databaseURL}/${SITE_PATH}.json`;
const CACHE_MS = 30_000;

let cache: { at: number; films: StoredFilm[] } | null = null;

function list(value: unknown): StoredFilm[] {
  if (Array.isArray(value)) return value.filter(Boolean) as StoredFilm[];
  if (value && typeof value === "object") return Object.values(value).filter(Boolean) as StoredFilm[];
  return [];
}

/** "Tinka's Story" and "tinkas-story" must match the same film. */
function key(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function loadFilms(): Promise<StoredFilm[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.films;
  try {
    const response = await fetch(CONTENT_URL, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as Record<string, unknown> | null;
    const films = [...list(data?.["films"]), ...list(data?.["upcoming"])];
    cache = { at: Date.now(), films };
    return films;
  } catch (error) {
    console.warn("stream: could not read dashboard content", error);
    return cache?.films ?? [];
  }
}

async function findFilm(slug: string): Promise<StoredFilm | undefined> {
  const wanted = key(decodeURIComponent(slug));
  const films = await loadFilms();
  return films.find(
    (film) => key(film.slug ?? "") === wanted || key(film.name ?? "") === wanted,
  );
}

function usable(url: string | undefined): string | null {
  const trimmed = (url ?? "").trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function googleDriveFile(url: string): { id: string; resourceKey: string | null } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "drive.google.com" && parsed.hostname !== "docs.google.com") return null;
    const pathMatch = parsed.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/);
    const id = pathMatch?.[1] ?? parsed.searchParams.get("id");
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
    const resourceKey = parsed.searchParams.get("resourcekey");
    return {
      id,
      resourceKey: resourceKey && /^[A-Za-z0-9_-]+$/.test(resourceKey) ? resourceKey : null,
    };
  } catch {
    return null;
  }
}

export function googleDrivePreviewUrl(url: string): string | null {
  const file = googleDriveFile(url);
  if (!file) return null;
  const preview = new URL(`https://drive.google.com/file/d/${file.id}/preview`);
  if (file.resourceKey) preview.searchParams.set("resourcekey", file.resourceKey);
  return preview.toString();
}

function source(url: string): Source {
  if (googleDriveFile(url)) return { url, type: "drive" };
  const path = (url.split("?")[0] ?? "").toLowerCase();
  const type: Source["type"] = path.endsWith(".m3u8")
    ? "hls"
    : path.endsWith(".mpd")
      ? "dash"
      : "mp4";
  return { url, type };
}

/** Only the trailer the admin uploaded for this exact film — never another film's. */
export async function getTrailerSource(slug: string): Promise<Source | null> {
  const film = await findFilm(slug);
  const url = usable(film?.trailerUrl) ?? usable(film?.videoUrl);
  return url ? source(url) : null;
}

export async function getFilmSource(slug: string): Promise<Source | null> {
  const film = await findFilm(slug);
  const url = usable(film?.videoUrl) ?? usable(film?.trailerUrl);
  return url ? source(url) : null;
}

/** True when the dashboard has a real video (not just a trailer) for this film. */
export async function hasFilmVideo(slug: string): Promise<boolean> {
  const film = await findFilm(slug);
  return Boolean(usable(film?.videoUrl));
}
