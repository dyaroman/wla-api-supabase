import { Hono } from 'jsr:@hono/hono'

const functionName = 'wla-api'
const app = new Hono().basePath(`/${functionName}`)

app.get('/hello', (c) => c.text('Hello from hono-server!'))

Deno.serve(app.fetch)
