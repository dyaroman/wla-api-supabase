import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import type { MiddlewareHandler } from "jsr:@hono/hono";
import type { AppEnv } from "../types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey =
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL or SERVICE_ROLE_KEY is not set in environment variables.",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set("supabase", supabase);
  await next();
};
