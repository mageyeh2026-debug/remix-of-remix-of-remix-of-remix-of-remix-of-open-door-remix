import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

import { PayModal } from "@/components/PayModal";
import { fetchTrailer } from "@/lib/streaming.functions";
import { useSiteContent } from "@/hooks/useSiteContent";
import { redeemAccess } from "@/lib/access.functions";
import { clearAccess, formatRemaining, loadAccess, saveAccess } from "@/lib/access";
import type { PlaybackKind, PlaybackSource } from "@/lib/playback";

const ShakaPlayer = lazy(() => import("@/components/ShakaPlayer"));
const DrivePlayer = lazy(() => import("@/components/DrivePlayer"));

export const Route = createFileRoute("/watch/$slug")({
  validateSearch: (search) =>
    z.object({ kind: z.enum(["film", "trailer"]).default("film") }).parse(search),
  head: () => ({
    meta: [
      { title: "Watch | Mageye Streaming" },
      { name: "description", content: "Stream Mageye films. Trailers are free, pay once to watch a full film." },
      { property: "og:title", content: "Watch | Mageye Streaming" },
      { property: "og:description", content: "Stream Mageye films. Trailers are free, pay once to watch a full film." },
      { property: "og:type", content: "video.movie" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { kind } = Route.useSearch();
  const { content } = useSiteContent();
  const film = [...content.films, ...content.upcoming].find((item) => item.slug === slug);

  const trailer = useServerFn(fetchTrailer);
  const redeem = useServerFn(redeemAccess);
  const navigate = useNavigate();

  const [src, setSrc] = useState<string | null>(null);
  const [playbackKind, setPlaybackKind] = useState<PlaybackKind>("mp4");
  const [state, setState] = useState<"loading" | "ready" | "locked">("loading");
  const [payOpen, setPayOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (kind === "trailer") {
        const source = await trailer({ data: { slug } });
        if (!cancelled) {
          if (source.url) {
            setSrc(source.url);
            setPlaybackKind(source.type);
            setState("ready");
          } else {
            setState("locked");
          }
        }
        return;
      }

      // Already paid on this device? Swap the saved rental ticket for a fresh
      // playback link so a refresh never loses access.
      const saved = loadAccess(slug);
      if (saved) {
        try {
          const result = await redeem({ data: { slug, token: saved.token } });
          if (cancelled) return;
          if (result.ok) {
            setSrc(result.source.url);
            setPlaybackKind(result.source.type);
            setExpiresAt(result.expiresAt);
            setState("ready");
            setPayOpen(false);
            return;
          }
          clearAccess(slug);
        } catch (redeemError) {
          console.warn("access redeem failed", redeemError);
          clearAccess(slug);
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setState("locked");
        setPayOpen(true);
      }
    }

    setState("loading");
    setSrc(null);
    setExpiresAt(null);
    run().catch(() => {
      if (!cancelled) {
        setState("locked");
        setPayOpen(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug, kind]);

  return (
    <main>
      <SiteHeader />
      <section className="watch-page">
        {state === "ready" && src ? (
          <Suspense fallback={<p className="watch-note">Loading player…</p>}>
            {playbackKind === "drive" ? (
              <DrivePlayer src={src} title={film?.name} />
            ) : (
              <ShakaPlayer src={src} kind={playbackKind} poster={film?.image} title={film?.name} />
            )}
          </Suspense>
        ) : (
          <div className="watch-locked-player">
            {film?.image && <img src={film.image} alt="" loading="eager" decoding="async" fetchPriority="high" />}
            <div className="watch-locked-veil">
              <Lock size={26} />
              <span>{state === "loading" ? "Preparing secure playback…" : film?.name ?? "Film"}</span>
            </div>
          </div>
        )}
        {state === "ready" && kind === "film" && expiresAt ? (
          <p className="watch-note">
            Your access to this film stays open for {formatRemaining(expiresAt)}.
          </p>
        ) : null}
      </section>

      <PayModal
        open={payOpen}
        slug={slug}
        title={film?.name}
        onBack={() => navigate({ to: "/films/$slug", params: { slug } })}
        onPaid={(source: PlaybackSource, entitlement) => {
          saveAccess(slug, entitlement);
          setSrc(source.url);
          setPlaybackKind(source.type);
          setExpiresAt(entitlement.expiresAt);
          setState("ready");
          setPayOpen(false);
        }}
        paymentBackendUrl={content.integrations.paymentBackendUrl}
      />
      <SiteFooter />
    </main>
  );
}
