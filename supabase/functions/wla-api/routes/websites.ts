import { Hono } from 'jsr:@hono/hono'
import {bearerAuth} from 'jsr:@hono/hono/bearer-auth'

import { getWebsites } from '../handlers/websites/get.ts';
import { postWebsites } from '../handlers/websites/post.ts';
import { deleteWebsites } from '../handlers/websites/delete.ts';

const websitesRoutes = new Hono();

websitesRoutes.get('/', getWebsites);

websitesRoutes.post(
    '/',
    bearerAuth({
        verifyToken: (token, c) => {
            // todo: replace c.env with Deno.env.get()
            if (token !== c.env.API_KEY) {
                console.log('invalid token:', token);
            }
            return token === c.env.API_KEY;
        },
    }),
    postWebsites,
);

websitesRoutes.delete(
    '/',
    bearerAuth({
        verifyToken: (token, c) => {
            if (token !== c.env.API_KEY) {
                console.log('invalid token:', token);
            }
            return token === c.env.API_KEY;
        },
    }),
    deleteWebsites,
);

export { websitesRoutes };
