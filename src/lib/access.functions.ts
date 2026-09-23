import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Exchanges a stored rental ticket for a fresh, short-lived playback link.
 * This is what makes a refresh keep working without any login.
 */
export const redeemAccess = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1), token: z.string().min(10) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { verifyEntitlement } = await import("./entitlement.server");
    const entitlement = await verifyEntitlement(data.token);

    if (!entitlement || entitlement.slug !== data.slug) {
      return { ok: false as const, reason: "expired" as const };
    }

    const remainingSeconds = Math.floor((entitlement.exp - Date.now()) / 1000);
    const ttl = Math.min(60 * 60 * 4, Math.max(60, remainingSeconds));
    const { issuePlaybackSource } = await import("./playback.server");
    const source = await issuePlaybackSource(data.slug, "film", ttl);
    if (!source) return { ok: false as const, reason: "missing" as const };

    return {
      ok: true as const,
      expiresAt: entitlement.exp,
      source,
    };
  });
