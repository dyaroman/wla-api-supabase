import { z } from "npm:zod@4";
import type { Context } from "jsr:@hono/hono";

import type { AppEnv } from "../../types.ts";
import { getDefaultEnv } from "../../config.ts";

const websiteSchema = z.object({ website: z.string().min(1) }).passthrough();

const postBodySchema = z.object({
  websites: z.array(websiteSchema).min(1),
  commit: z.string().min(1),
  columns: z.array(z.record(z.unknown())),
});

export const postWebsites = async (c: Context<AppEnv>) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    console.log("invalid json payload");
    return c.json({ error: "invalid payload" }, 400);
  }

  const result = postBodySchema.safeParse(body);
  if (!result.success) {
    console.log("invalid payload", result.error.flatten());
    return c.json(
      { error: "invalid payload", details: result.error.flatten() },
      400,
    );
  }

  const { websites, commit, columns } = result.data;
  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  try {
    const { data: count, error } = await supabase.rpc("upsert_websites_data", {
      p_env: env,
      p_commit: commit,
      p_columns: columns,
      p_websites: websites,
    });

    if (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }

    console.log("websites", websites.length, commit);
    return c.json({ count: count ?? 0 });
  } catch (e) {
    console.log("failed to save websites", e.message);
    return c.json({ error: e.message }, 500);
  }
};
