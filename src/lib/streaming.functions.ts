import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugInput = (data: unknown) => z.object({ slug: z.string().min(1) }).parse(data);

export const fetchTrailer = createServerFn({ method: "POST" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const { issuePlaybackSource } = await import("./playback.server");
    const source = await issuePlaybackSource(data.slug, "trailer", 60 * 30);
    if (!source) {
      return { available: false as const, url: null, type: "mp4" as const };
    }

    return { available: true as const, ...source };
  });

export const fetchSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", context.userId)
      .maybeSingle();

    const active =
      data?.status === "active" &&
      (!data.current_period_end || new Date(data.current_period_end) > new Date());

    return { active: Boolean(active), subscription: data ?? null };
  });

export const fetchFilmStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(slugInput)
  .handler(async ({ data, context }) => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", context.userId)
      .maybeSingle();

    const active =
      sub?.status === "active" &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

    if (!active) {
      return { allowed: false as const };
    }

    const { issuePlaybackSource } = await import("./playback.server");
    const source = await issuePlaybackSource(data.slug, "film", 60 * 90);
    return source ? { allowed: true as const, source } : { allowed: false as const };
  });

// Film access is granted only by a confirmed Pesapal payment
// (see src/lib/pesapal.functions.ts).
