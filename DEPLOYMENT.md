# Deployment Guide (Free Tier)

Stack used for hosting:

| Service | Provider | Free limit |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Unlimited hobby deploys |
| API + Socket.IO | [Render](https://render.com) | Free web service (spins down after 15 min idle, cold-starts on next request) |
| PostgreSQL | [Supabase](https://supabase.com) | 500 MB, free forever |
| Redis | [Upstash](https://upstash.com) | 10 000 commands/day |

Render's free web services are regular long-running processes (not serverless functions), so they support persistent WebSocket connections — Socket.IO works fine. The only free-tier tradeoff is the idle spin-down: the first request after 15 minutes of inactivity takes a few seconds to wake the instance.

---

## Prerequisites

```bash
npm i -g vercel   # Vercel CLI

vercel --version
```

No CLI is needed for Render or Supabase — both are configured via their dashboards (Render also supports a `render.yaml` blueprint, included at the repo root).

---

## 1. PostgreSQL — Supabase

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Wait for provisioning, then go to **Project Settings → Database → Connection string**.
3. Select the **Session pooler** mode and copy the URI — it looks like `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`.
4. Use this for `DATABASE_URL`. Not Direct Connection, not Transaction pooler:
   - **Direct Connection** now requires IPv6 unless you pay for Supabase's IPv4 add-on, and Render's free tier only has IPv4 egress.
   - **Transaction pooler** (port `6543`) is for brief, stateless connections (serverless functions) and doesn't reliably support the session-level features (advisory locks, DDL) that `prisma migrate deploy` needs — which runs on every boot via the `start` script.
   - **Session pooler** (port `5432`, same hostname) gives each connection a dedicated backend for its lifetime — works over IPv4 and supports migrations, matching Render's long-running process.

---

## 2. Redis — Upstash

1. Sign up at [console.upstash.com](https://console.upstash.com).
2. Create a new Redis database — pick a region close to where you'll run Render (e.g. `us-west` if using Render's Oregon region).
3. Copy the **Redis URL** from the **Details** tab (starts with `rediss://`).

---

## 3. OAuth Apps

### GitHub

1. [github.com/settings/applications/new](https://github.com/settings/applications/new)
   - **Homepage URL**: `https://<your-api>.onrender.com`
   - **Callback URL**: `https://<your-api>.onrender.com/auth/github/callback`
2. Copy **Client ID** and **Client Secret**.

### Google

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials** → **Create OAuth client ID**
   - Application type: **Web application**
   - Authorised redirect URI: `https://<your-api>.onrender.com/auth/google/callback`
2. Copy **Client ID** and **Client Secret**.

---

## 4. Deploy the API — Render

The repo includes `render.yaml` at the root, so the fastest path is a Blueprint:

1. Push this repo to GitHub (if not already there).
2. In the Render dashboard: **New → Blueprint**, point it at your repo. Render reads `render.yaml` and creates a free web service named `stalk-talk-api` with the right build/start commands and a `/health` check already wired up.
3. Render will prompt for the env vars marked `sync: false` in `render.yaml` — fill in:

```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
REDIS_URL=rediss://...                      # from Upstash
JWT_SECRET=<openssl rand -base64 32>
REFRESH_SECRET=<openssl rand -base64 32>
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://<your-app>.vercel.app
API_URL=https://<your-api>.onrender.com
```

4. Deploy. Render builds with `pnpm build` (via `corepack enable && pnpm install`) and starts with `pnpm start`, which runs `prisma migrate deploy` before booting the server — migrations apply automatically on every deploy.

After the first deploy, note the public URL (e.g. `https://stalk-talk-api.onrender.com`) and update `FRONTEND_URL`/`API_URL` if they don't match, plus the OAuth callback URLs.

**Without a Blueprint** (manual setup): New → Web Service → connect the repo → set Build Command to `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @stalk-talk/types build && pnpm --filter @stalk-talk/api build`, Start Command to `pnpm --filter @stalk-talk/api start`, and add the same env vars by hand.

**Redeploying without git push**: copy the service's **Deploy Hook** URL from Render (Settings → Deploy Hook), then:

```bash
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx?key=yyy make deploy-api
```

---

## 5. Deploy the Frontend — Vercel

```bash
# Log in
vercel login

# Set the API URL env var (Vercel reads VITE_* at build time)
# Either via the dashboard or:
vercel env add VITE_API_URL production
# → paste: https://<your-api>.onrender.com

# Build + deploy
make deploy-web
```

Vercel reads `apps/web/vercel.json` automatically and rewrites all paths to
`index.html` so React Router works.

After deploy, copy the Vercel URL and update `FRONTEND_URL` in the Render dashboard (Environment tab) — changing an env var triggers an automatic redeploy.

---

## 6. Verify

```bash
# Health check (may take a few seconds if the free instance was idle)
curl https://<your-api>.onrender.com/health
# → {"status":"ok"}

# Open the app
open https://<your-app>.vercel.app
```

---

## Local Development

```bash
make install        # install all dependencies
make db-up          # start Postgres + Redis via Docker
make db-migrate     # create/run migrations (first time only)
make dev            # Postgres + Redis + API + web together
```

Copy `apps/api/.env.example` → `apps/api/.env` and fill in values before running. For local dev, `DATABASE_URL` should point at the Dockerized Postgres (`localhost:5433` per `docker-compose.yml`), not Supabase — Supabase is only for the deployed environment.

---

## Common Make Targets

| Command | What it does |
|---|---|
| `make install` | `pnpm install` |
| `make dev` | Start Postgres + Redis (Docker) and API + web together |
| `make stop` | Kill whatever's listening on :5000/:5173 |
| `make test` | Run all tests |
| `make typecheck` | TypeScript check across all packages |
| `make build` | Build all packages |
| `make db-up` | Start Docker Postgres + Redis |
| `make db-down` | Stop Docker services |
| `make db-migrate` | `prisma migrate dev` (local) |
| `make db-deploy` | `prisma migrate deploy` (production) |
| `make db-reset` | Reset database and re-run all migrations |
| `make db-studio` | Open Prisma Studio in browser |
| `make deploy-web` | Build + `vercel --prod` |
| `make deploy-api` | Trigger a Render deploy via its Deploy Hook |
| `make clean` | Stop dev servers and remove all `dist/` directories |

---

## Continuous Deployment

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs typecheck + tests
on every push and PR. Both hosts auto-deploy from GitHub once connected:

**Vercel**: connect the GitHub repo in the Vercel dashboard — it detects
`apps/web` as the root and deploys on every merge to `master`.

**Render**: Blueprint-created services auto-deploy on push to the connected
branch by default (toggle under service Settings → Auto-Deploy if you want
to turn it off and use the Deploy Hook manually instead).
