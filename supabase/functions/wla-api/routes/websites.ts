import { Hono } from "jsr:@hono/hono";
import { bearerAuth } from "jsr:@hono/hono/bearer-auth";

import type { AppEnv } from "../types.ts";
import { getWebsites } from "../handlers/websites/get.ts";
import { postWebsites } from "../handlers/websites/post.ts";
import { deleteWebsites } from "../handlers/websites/delete.ts";

const websitesRoutes = new Hono<AppEnv>();

const auth = bearerAuth({
  verifyToken: (token) => {
    if (token !== Deno.env.get("API_KEY")) {
      console.log("invalid token attempt");
    }
    return token === Deno.env.get("API_KEY");
  },
});

websitesRoutes.get("/", getWebsites);
websitesRoutes.post("/", auth, postWebsites);
websitesRoutes.delete("/", auth, deleteWebsites);

export { websitesRoutes };
