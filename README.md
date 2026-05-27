# WLA API (Supabase)

Serverless backend for the [Websites List App (WLA)](https://github.com/dyaroman/wla-react) – a Supabase Edge Function built with [Hono](https://hono.dev/) that manages website collections, commit metadata, and column definitions.

## Related Projects

- **[wla-react](https://github.com/dyaroman/wla-react)** – React 19 frontend that consumes this API

---

## Database Schema

Three tables in `public`, all scoped by `env` (default: `demo`):

| Table | Key | Purpose |
|-------|-----|---------|
| `info` | `env` | Stores latest `commit` hash (`timestamp` is computed at request time in Kyiv timezone, not stored) |
| `columns` | `env` | Stores column definitions as JSONB |
| `websites` | `(env, website)` | Stores website records with full JSONB `data` |

Row-level security (RLS) is enabled on all tables. `service_role` has full access; direct table queries are blocked for other roles. All data access goes through the Edge Function.

---

## API Reference

- `GET` routes are public.
- `POST` and `DELETE` routes require `Authorization: Bearer <API_KEY>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/websites` | Public | List all website names |
| `GET` | `/commit` | Public | Get the latest commit hash |
| `GET` | `/combined` | Public | Get full payload (commit, timestamp, columns, websites) |
| `POST` | `/websites` | Bearer Token | Upsert websites + commit info + columns |
| `DELETE` | `/websites` | Bearer Token | Delete specific websites by name |

### Example requests

```sh
# GET /websites – list website names
curl "https://<project-ref>.supabase.co/functions/v1/wla-api/websites"

# GET /commit – get latest commit
curl "https://<project-ref>.supabase.co/functions/v1/wla-api/commit"

# GET /combined – get everything at once
curl "https://<project-ref>.supabase.co/functions/v1/wla-api/combined"

# POST /websites – upsert data (protected)
curl -X POST "https://<project-ref>.supabase.co/functions/v1/wla-api/websites" \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "websites":[{"website":"example.com"}],
    "commit":"abc123",
    "columns":[{"key":"campaignId","label":"Campaign ID"}]
  }'

# DELETE /websites – remove websites (protected)
curl -X DELETE "https://<project-ref>.supabase.co/functions/v1/wla-api/websites" \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '["example.com"]'
```

---

## Configuration

Environment variables / secrets:

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `SUPABASE_URL` | Yes | – | Supabase project URL (set automatically in Edge Runtime) |
| `SERVICE_ROLE_KEY` | Yes | – | Service role key to bypass RLS |
| `API_KEY` | Yes | – | Bearer token for protected endpoints |
| `DEFAULT_ENV` | No | `demo` | Environment name scope |
| `CORS_ORIGINS` | No | `https://dyaroman.github.io` | Comma-separated allowed origins |

---

## Local Development

1. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development).

2. Start the local stack:

   ```sh
   supabase start
   ```

3. Serve the Edge Function with hot reload:

   ```sh
   supabase functions serve wla-api --env-file ./supabase/.env.local
   ```

4. The API will be available at `http://127.0.0.1:54321/functions/v1/wla-api`.

Create a `supabase/.env.local` file for local secrets:

```sh
API_KEY=my-local-api-key
SERVICE_ROLE_KEY=your-local-service-role-key
DEFAULT_ENV=demo
CORS_ORIGINS=http://localhost:5173
```

---

## Deploy to Supabase

1. Create a new Supabase project in [the dashboard](https://supabase.com/dashboard).

2. Link the repo:

   ```sh
   supabase login
   supabase link --project-ref <project-ref>
   ```

3. Push database migrations (**must run before deploying the function**):

   ```sh
   supabase db push
   ```

4. Set project secrets:

   ```sh
   supabase secrets set \
     API_KEY="<strong-api-key>" \
     SERVICE_ROLE_KEY="<your-service-role-key>" \
     CORS_ORIGINS="https://dyaroman.github.io"
   ```

5. Deploy the Edge Function:

   ```sh
   supabase functions deploy wla-api
   ```

6. Verify the deployment:

   ```sh
   curl "https://<project-ref>.supabase.co/functions/v1/wla-api/combined"
   ```
