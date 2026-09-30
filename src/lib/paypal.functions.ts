import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PAYPAL_API = "https://api-m.paypal.com";
const FILM_PRICE = "5.99";

async function paypalToken() {
  const id = process.env["PAYPAL_CLIENT_ID"];
  const secret = process.env["PAYPAL_CLIENT_SECRET"];
  if (!id || !secret) throw new Error("PayPal is not configured.");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal could not be authorised.");
  return json.access_token;
}

/** Public client id for the PayPal buttons (safe to expose). */
export const getPaypalClientId = createServerFn({ method: "GET" }).handler(async () => ({
  clientId: process.env["PAYPAL_CLIENT_ID"] ?? "",
}));

export const createPaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1), title: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const token = await paypalToken();
      const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              custom_id: `film:${data.slug}`.slice(0, 127),
              description: `Film: ${data.title ?? data.slug}`.slice(0, 127),
              amount: { currency_code: "USD", value: FILM_PRICE },
            },
          ],
        }),
      });
      const json = (await res.json()) as { id?: string; message?: string };
      if (!json.id) return { ok: false as const, message: json.message ?? "PayPal order failed." };
      return { ok: true as const, orderId: json.id };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "PayPal order failed." };
    }
  });

type Capture = {
  status?: string;
  message?: string;
  details?: { issue?: string; description?: string }[];
  purchase_units?: {
    payments?: {
      captures?: { id?: string; status?: string; custom_id?: string; amount?: { value?: string; currency_code?: string } }[];
    };
  }[];
};

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string().min(1), orderId: z.string().min(5), guestId: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const token = await paypalToken();
      const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(data.orderId)}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = (await res.json()) as Capture;
      const issue = json.details?.[0]?.issue;
      if (issue === "INSTRUMENT_DECLINED") {
        return { status: "retry" as const, message: "Your payment method was declined. Please choose another." };
      }
      const cap = json.purchase_units?.[0]?.payments?.captures?.[0];
      if (!cap || cap.status !== "COMPLETED") {
        return {
          status: "failed" as const,
          message: cap?.status === "PENDING" ? "PayPal is still reviewing this payment." : json.details?.[0]?.description ?? json.message ?? "Payment failed.",
        };
      }
      if (cap.custom_id !== `film:${data.slug}`.slice(0, 127) || cap.amount?.value !== FILM_PRICE || cap.amount?.currency_code !== "USD") {
        return { status: "failed" as const, message: "This payment does not match this film." };
      }

      const { issuePlaybackSource } = await import("./playback.server");
      const source = await issuePlaybackSource(data.slug, "film", 60 * 60 * 4);
      if (!source) return { status: "failed" as const, message: "This film does not have a playable video yet." };
      const { signEntitlement } = await import("./entitlement.server");
      const entitlement = await signEntitlement({
        slug: data.slug,
        guestId: data.guestId ?? "guest",
        provider: "paypal",
        ref: cap.id ?? data.orderId,
      });
      return { status: "success" as const, source, entitlement };
    } catch (e) {
      return { status: "failed" as const, message: e instanceof Error ? e.message : "Payment failed." };
    }
  });
