import type { Context } from "jsr:@hono/hono";

import type { AppEnv } from "../../types.ts";
import { getDefaultEnv, getKyivTimestamp } from "../../config.ts";

export const getCombined = async (c: Context<AppEnv>) => {
  const env = getDefaultEnv();
  const supabase = c.get("supabase");

  try {
    const [infoResult, columnsResult, websitesResult] = await Promise.all([
      supabase
        .from("info")
        .select("commit")
        .eq("env", env)
        .single(),

      supabase
        .from("columns")
        .select("columns")
        .eq("env", env)
        .single(),

      supabase
        .from("websites")
        .select("data")
        .eq("env", env),
    ]);

    if (infoResult.error && infoResult.error.code !== "PGRST116") {
      throw new Error(`Failed to fetch info data: ${infoResult.error.message}`);
    }
    const { commit } = infoResult.data ?? {};
    const timestamp = getKyivTimestamp();

    if (columnsResult.error && columnsResult.error.code !== "PGRST116") {
      throw new Error(
        `Failed to fetch columns data: ${columnsResult.error.message}`,
      );
    }
    const columns = columnsResult.data?.columns ?? [];

    if (websitesResult.error) {
      throw new Error(
        `Failed to fetch websites data: ${websitesResult.error.message}`,
      );
    }
    const websites = websitesResult.data?.map((row) => row.data) ?? [];

    console.log("websites", websites.length, "commit", commit);

    return c.json({
      commit,
      timestamp,
      columns,
      websites,
    });
  } catch (e) {
    console.log("failed to fetch full data", e.message);
    return c.json(
      {
        error: "failed to fetch full data",
        message: e.message,
      },
      500,
    );
  }
};
