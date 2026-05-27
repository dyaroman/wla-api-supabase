import type { Context } from "jsr:@hono/hono";

import type { AppEnv } from "../../types.ts";
import { getDefaultEnv } from "../../config.ts";

export const getCommit = async (c: Context<AppEnv>) => {
  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  try {
    const { data, error } = await supabase
      .from("info")
      .select("commit")
      .eq("env", env)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`No commit found for env: ${env}`);
        return c.json({ commit: null });
      }
      throw new Error(`Failed to fetch commit: ${error.message}`);
    }

    console.log("commit", data);
    return c.json(data);
  } catch (e) {
    console.log("failed to fetch info data", e.message);
    return c.json(
      {
        error: "failed to fetch info data",
        message: e.message,
      },
      500,
    );
  }
};
