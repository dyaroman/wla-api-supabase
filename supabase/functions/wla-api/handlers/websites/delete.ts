import type { Context } from "jsr:@hono/hono";

import type { AppEnv } from "../../types.ts";
import { getDefaultEnv } from "../../config.ts";

export const deleteWebsites = async (c: Context<AppEnv>) => {
  let websitesToDelete: unknown;
  try {
    websitesToDelete = await c.req.json();
  } catch {
    console.log("invalid json payload");
    return c.json({ error: "invalid payload" }, 400);
  }

  if (
    !Array.isArray(websitesToDelete) ||
    websitesToDelete.length === 0
  ) {
    console.log("invalid payload", websitesToDelete);
    return c.json({ error: "invalid payload" }, 400);
  }

  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  try {
    const { error, data } = await supabase
      .from("websites")
      .delete()
      .eq("env", env)
      .in("website", websitesToDelete.map((w) => String(w).toLowerCase()))
      .select();

    if (error) {
      throw new Error(`Failed to delete websites: ${error.message}`);
    }

    console.log("Deleted websites:", websitesToDelete, "Count:", data?.length);
    return c.json({ count: data?.length ?? 0 });
  } catch (e) {
    console.log("failed to delete websites", e.message);
    return c.json({ error: e.message }, 500);
  }
};
