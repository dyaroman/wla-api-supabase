import { Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { etag } from "jsr:@hono/hono/etag";

import type { AppEnv } from "./types.ts";
import { getAllowedOrigins } from "./config.ts";
import { supabaseMiddleware } from "./middlewares/supabase.ts";
import { websitesRoutes } from "./routes/websites.ts";
import { getCommit } from "./handlers/commit/get.ts";
import { getCombined } from "./handlers/combined/get.ts";

const functionName = "wla-api";
const app = new Hono<AppEnv>().basePath(`/${functionName}`);
const allowedOrigins = new Set(getAllowedOrigins());
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// CORS
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (allowedOrigins.has(origin) || localOriginPattern.test(origin)) {
        return origin;
      }
      return "";
    },
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    exposeHeaders: ["ETag"],
  }),
);

// ETag
app.use("/*", etag());

// supabase
app.use(supabaseMiddleware);

// routes
app.route("/websites", websitesRoutes);

// handlers
app.get("/commit", getCommit);
app.get("/combined", getCombined);

// 401 by default (security-by-obscurity: don't expose that a route doesn't exist)
app.notFound((c) => {
  console.log("401 by default");
  return c.text("Unauthorized", 401);
});

Deno.serve(app.fetch);
