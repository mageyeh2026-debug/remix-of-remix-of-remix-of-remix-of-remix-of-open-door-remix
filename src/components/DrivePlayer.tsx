import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

type Props = {
  src: string;
  title?: string | undefined;
};

export default function DrivePlayer({ src, title }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    await wrap.requestFullscreen().catch(() => {});
  }

  return (
    <div className="drive-player" ref={wrapRef}>
      <iframe
        src={src}
        title={title ?? "Google Drive video"}
        allow="autoplay; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <button
        type="button"
        className="drive-player-fullscreen"
        onClick={toggleFullscreen}
        aria-label={fullscreen ? "Exit full screen" : "Play full screen"}
        title={fullscreen ? "Exit full screen" : "Play full screen"}
      >
        {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}