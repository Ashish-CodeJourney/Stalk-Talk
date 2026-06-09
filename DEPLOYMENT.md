# Deployment Guide (Free Tier)

Stack used for hosting:

| Service | Provider | Free limit |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Unlimited hobby deploys |
| API + PostgreSQL | [Railway](https://railway.app) | $5/month credit (covers hobby apps) |
| Redis | [Upstash](https://upstash.com) | 10 000 commands/day |

---

## Prerequisites

```bash
# Install CLIs
npm i -g vercel          # Vercel CLI
npm i -g @railway/cli    # Railway CLI

# Verify
vercel --version
railway --version
```

---

## 1. PostgreSQL — Railway

1. Sign up at [railway.app](https://railway.app) and create a new project.
2. Click **+ New** → **Database** → **Add PostgreSQL**.
3. Open the PostgreSQL service → **Connect** tab → copy the **DATABASE_URL** (starts with `postgresql://`).

---

## 2. Redis — Upstash

1. Sign up at [console.upstash.com](https://console.upstash.com).
2. Create a new Redis database — region closest to your Railway region.
3. Copy the **Redis URL** from the **Details** tab (starts with `rediss://`).

---

## 3. OAuth Apps

### GitHub

1. [github.com/settings/applications/new](https://github.com/settings/applications/new)
   - **Homepage URL**: `https://<your-api>.up.railway.app`
   - **Callback URL**: `https://<your-api>.up.railway.app/auth/github/callback`
2. Copy **Client ID** and **Client Secret**.

### Google

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials** → **Create OAuth client ID**
   - Application type: **Web application**
   - Authorised redirect URI: `https://<your-api>.up.railway.app/auth/google/callback`
2. Copy **Client ID** and **Client Secret**.

---

## 4. Deploy the API — Railway

```bash
# Log in
railway login

# Link to the Railway project you created above
railway link

# Set all environment variables (run once)
railway variables set \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="rediss://..." \
  JWT_SECRET="$(openssl rand -base64 32)" \
  REFRESH_SECRET="$(openssl rand -base64 32)" \
  GITHUB_CLIENT_ID="..." \
  GITHUB_CLIENT_SECRET="..." \
  GOOGLE_CLIENT_ID="..." \
  GOOGLE_CLIENT_SECRET="..." \
  FRONTEND_URL="https://<your-app>.vercel.app" \
  API_URL="https://<your-api>.up.railway.app"

# Deploy
make deploy-api
```

Railway detects Node via Nixpacks, installs dependencies, runs `pnpm build`,
then starts with `prisma migrate deploy && node dist/server.js`.

After the first deploy note the public URL (e.g. `https://stalk-talk-api.up.railway.app`)
and go back to update `FRONTEND_URL` / `API_URL` if needed, plus the OAuth callback URLs.

---

## 5. Deploy the Frontend — Vercel

```bash
# Log in
vercel login

# Set the API URL env var (Vercel reads VITE_* at build time)
# Either via the dashboard or:
vercel env add VITE_API_URL production
# → paste: https://<your-api>.up.railway.app

# Build + deploy
make deploy-web
```

Vercel reads `apps/web/vercel.json` automatically and rewrites all paths to
`index.html` so React Router works.

After deploy, copy the Vercel URL and update `FRONTEND_URL` on Railway:

```bash
railway variables set FRONTEND_URL="https://<your-app>.vercel.app"
```

---

## 6. Verify

```bash
# Health check
curl https://<your-api>.up.railway.app/health
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
make dev-api        # Fastify on :5000 with hot reload
make dev-web        # Vite on :5173 with hot reload
```

Copy `apps/api/.env.example` → `apps/api/.env` and fill in values before running.

---

## Common Make Targets

| Command | What it does |
|---|---|
| `make install` | `pnpm install` |
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
| `make deploy-api` | `railway up --service api` |
| `make clean` | Remove all `dist/` directories |

---

## Continuous Deployment

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs typecheck + tests
on every push and PR. To wire up automatic deploys:

**Vercel**: connect the GitHub repo in the Vercel dashboard — it detects
`apps/web` as the root and deploys on every merge to `master`.

**Railway**: enable **GitHub deploys** in your Railway service settings and
point it at the `master` branch. Railway rebuilds and runs migrations automatically.
