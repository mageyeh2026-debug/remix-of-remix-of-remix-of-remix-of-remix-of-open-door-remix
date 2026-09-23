import { lazy, Suspense, useEffect, useState } from "react";
import { X } from "lucide-react";

import { fetchTrailer } from "@/lib/streaming.functions";
import type { PlaybackKind } from "@/lib/playback";

const ShakaPlayer = lazy(() => import("@/components/ShakaPlayer"));
const DrivePlayer = lazy(() => import("@/components/DrivePlayer"));

type TrailerResult = { available: boolean; url: string | null; type: PlaybackKind };

// Playback links are requested once per film and reused, so opening the player
// feels instant instead of waiting for a round trip on click.
const cache = new Map<string, Promise<TrailerResult>>();

export function prefetchTrailer(slug: string | null | undefined) {
  if (!slug) return;
  if (!cache.has(slug)) {
    cache.set(
      slug,
      fetchTrailer({ data: { slug } }).then((result) => result as TrailerResult),
    );
    // A failed link should not be remembered.
    cache.get(slug)!.catch(() => cache.delete(slug));
  }
}

type Props = {
  slug: string | null;
  title?: string | undefined;
  poster?: string | undefined;
  onClose: () => void;
};

/** Floating trailer player — no page change, plays over the current screen. */
export function PlayerModal({ slug, title, poster, onClose }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [kind, setKind] = useState<PlaybackKind>("mp4");
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setStatus("loading");
    if (!slug) return;

    prefetchTrailer(slug);
    cache
      .get(slug)!
      .then((result) => {
        if (cancelled) return;
        if (!result.available || !result.url) {
          setStatus("missing");
          return;
        }
        setSrc(result.url);
        setKind(result.type);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("failed"));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [slug, onClose]);

  if (!slug) return null;

  return (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-label={`${title ?? "Film"} trailer`}>
      <div className="player-backdrop" onClick={onClose} />
      <div className="player-shell">
        <button type="button" className="player-close" onClick={onClose} aria-label="Close player">
          <X size={18} />
        </button>
        {src ? (
          <Suspense fallback={<div className="player-loading">Loading player…</div>}>
            {kind === "drive" ? (
              <DrivePlayer src={src} title={title ? `${title} — Trailer` : "Trailer"} />
            ) : (
              <ShakaPlayer src={src} kind={kind} poster={poster} title={title ? `${title} — Trailer` : "Trailer"} />
            )}
          </Suspense>
        ) : (
          <div className="player-loading">
            {status === "missing"
              ? "The trailer for this film hasn’t been uploaded yet."
              : status === "failed"
                ? "This trailer could not be loaded."
                : "Preparing secure playback…"}
          </div>
        )}
      </div>
    </div>
  );
}
