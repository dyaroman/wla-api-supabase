import { Hono } from 'jsr:@hono/hono'
import {cors} from 'jsr:@hono/hono/cors'
import {etag} from 'jsr:@hono/hono/etag'

import { validateEnv } from './middlewares/validateEnv.ts';
import { websitesRoutes } from './routes/websites.ts';
import { getCommit } from './handlers/commit/get.ts';
import { getCombined } from './handlers/combined/get.ts';

const functionName = 'wla-api'
const app = new Hono().basePath(`/${functionName}`)

// validate env query param
app.use(validateEnv);

// CORS
app.use(
    '/*',
    cors({
        origin: (origin) => {
            if (origin.includes('dyaroman.github.io') || origin.includes('localhost'))
                return origin;
            return '';
        },
        exposeHeaders: ['ETag'],
    }),
);

// ETag
app.use('/*', etag());

// routes
app.route('/websites', websitesRoutes);

// handlers
app.get('/commit', getCommit);
app.get('/combined', getCombined);

// 401 by default
app.notFound((c) => {
    console.log('401 by default');
    return c.text('Unauthorized', 401);
});

Deno.serve(app.fetch)
