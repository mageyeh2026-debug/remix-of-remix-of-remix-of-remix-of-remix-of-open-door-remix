import type { PlaybackSource } from "./playback";
import { getFilmSource, getTrailerSource, googleDrivePreviewUrl } from "./streaming.server";
import { signPlaybackToken } from "./stream-token.server";

export async function issuePlaybackSource(
  slug: string,
  kind: "film" | "trailer",
  ttlSeconds: number,
): Promise<PlaybackSource | null> {
  const source = kind === "film" ? await getFilmSource(slug) : await getTrailerSource(slug);
  if (!source) return null;

  if (source.type === "drive") {
    const url = googleDrivePreviewUrl(source.url);
    return url ? { url, type: "drive" } : null;
  }

  const token = await signPlaybackToken({ slug, kind }, ttlSeconds);
  return { url: `/api/public/stream/${token}`, type: source.type };
}