import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { capturePaypalOrder, createPaypalOrder, getPaypalClientId } from "@/lib/paypal.functions";
import type { PlaybackSource } from "@/lib/playback";
import type { StoredAccess } from "@/lib/access";

type PaypalSdk = {
  Buttons: (opts: Record<string, unknown>) => {
    isEligible: () => boolean;
    render: (el: HTMLElement) => Promise<void>;
    close?: () => void;
  };
  FUNDING: Record<string, string>;
};

let sdkPromise: Promise<PaypalSdk> | null = null;
function loadSdk(clientId: string) {
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons&enable-funding=venmo,paylater,card`;
      s.async = true;
      s.onload = () => resolve((window as unknown as { paypal: PaypalSdk }).paypal);
      s.onerror = () => {
        sdkPromise = null;
        reject(new Error("PayPal could not load."));
      };
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

export function PaypalButtons({
  slug,
  title,
  guestId,
  onPaid,
  onMessage,
}: {
  slug: string;
  title?: string | undefined;
  guestId?: string | undefined;
  onPaid: (source: PlaybackSource, entitlement: StoredAccess) => void;
  onMessage: (kind: "error" | "status" | null, text: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const getId = useServerFn(getPaypalClientId);
  const createOrder = useServerFn(createPaypalOrder);
  const capture = useServerFn(capturePaypalOrder);
  const [loading, setLoading] = useState(true);
  const cb = useRef({ onPaid, onMessage });
  cb.current = { onPaid, onMessage };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { clientId } = await getId();
        const paypal = await loadSdk(clientId);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = "";
        const button = paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "pay", height: 44 },
          createOrder: async () => {
            cb.current.onMessage(null, null);
            const r = await createOrder({ data: { slug, ...(title ? { title } : {}) } });
            if (!r.ok) throw new Error(r.message);
            return r.orderId;
          },
          onApprove: async (d: { orderID: string }, actions: { restart: () => void }) => {
            cb.current.onMessage("status", "Confirming your payment…");
            const r = await capture({ data: { slug, orderId: d.orderID, ...(guestId ? { guestId } : {}) } });
            if (r.status === "retry") {
              cb.current.onMessage("error", r.message);
              return actions.restart();
            }
            if (r.status === "success") {
              cb.current.onMessage("status", "Payment successful. Starting your film…");
              cb.current.onPaid(r.source, r.entitlement);
              return;
            }
            cb.current.onMessage("error", r.message);
          },
          onCancel: () => cb.current.onMessage("error", "Payment cancelled. You were not charged."),
          onError: () => cb.current.onMessage("error", "PayPal payment failed. Please try again."),
        });
        await button.render(ref.current);
      } catch {
        if (!cancelled) cb.current.onMessage("error", "PayPal is temporarily unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="paypal-buttons">
      {loading ? <p className="pay-note">Loading PayPal…</p> : null}
      <div ref={ref} />
    </div>
  );
}
