# Stalk Talk

A real-time chat application with OAuth login, persistent rooms and messages, and horizontal scaling via Redis pub/sub.

[![CI](https://github.com/Ashish-CodeJourney/Stalk-Talk/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashish-CodeJourney/Stalk-Talk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **OAuth login** — GitHub and Google, JWT access tokens (15 min) + httpOnly refresh cookies (7 days)
- **Persistent rooms and messages** — PostgreSQL via Prisma ORM
- **Real-time messaging** — Socket.IO with Redis adapter for horizontal scaling
- **Typing indicators** — debounced, per-room
- **Presence** — online users tracked via Redis TTL keys
- **Optimistic sends** — messages appear instantly, deduplicated on server echo
- **Message history** — cursor-based pagination with infinite scroll
- **Rate limiting** — per-IP via `@fastify/rate-limit`

---

## Architecture

```
stalk-talk/
├── apps/
│   ├── api/          Fastify v5 · Prisma · Socket.IO · JWT
│   └── web/          React 18 · Tanstack Query v5 · socket.io-client
├── packages/
│   ├── types/        Shared Zod schemas (User, Room, Message, socket events)
│   └── config/       Shared tsconfig base
├── docker-compose.yml  Postgres 16 + Redis 7 for local dev
└── Makefile
```

**Stack:**

| Layer | Technology |
|---|---|
| API framework | Fastify v5 (TypeScript, ESM) |
| Database | PostgreSQL 16 + Prisma ORM |
| Real-time | Socket.IO 4 + `@socket.io/redis-adapter` |
| Cache / pub-sub | Redis 7 + ioredis |
| Auth | OAuth2 (GitHub + Google) + jsonwebtoken + bcryptjs |
| Frontend | React 18 + Vite + Tanstack Query v5 |
| Types | Zod schemas shared across API and web |
| Testing | Vitest + Testing Library (120 tests) |

---

## Quick Start

### Prerequisites

- Node.js 22+, pnpm 10+, Docker

### Run locally

```bash
make install       # install all dependencies
make db-up         # start Postgres + Redis via Docker
make db-migrate    # create database tables (first time)
make dev-api       # API on http://localhost:5000
make dev-web       # web on http://localhost:5173
```

Copy `apps/api/.env.example` to `apps/api/.env` and fill in your OAuth credentials before starting the API.

---

## Environment Variables

**`apps/api/.env`**

```env
DATABASE_URL=postgresql://stalktalk:stalktalk@localhost:5432/stalktalk
REDIS_URL=redis://localhost:6379
JWT_SECRET=<random 32+ char string>
REFRESH_SECRET=<random 32+ char string>
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:5000
```

**`apps/web/.env`**

```env
VITE_API_URL=http://localhost:5000
```

---

## Makefile Reference

```bash
make test          # run all 120 tests
make typecheck     # TypeScript check across all packages
make build         # compile all packages
make db-studio     # open Prisma Studio in browser
make db-reset      # wipe and re-migrate (dev only)
make deploy-web    # build + vercel --prod
make deploy-api    # railway up --service api
make clean         # remove dist/ directories
```

See all targets in [`Makefile`](Makefile).

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/auth/github` | — | GitHub OAuth redirect |
| GET | `/auth/github/callback` | — | GitHub OAuth callback |
| GET | `/auth/google` | — | Google OAuth redirect |
| GET | `/auth/google/callback` | — | Google OAuth callback |
| POST | `/auth/refresh` | cookie | Issue new access token |
| DELETE | `/auth/logout` | cookie | Clear refresh token |
| GET | `/users/me` | JWT | Current user profile |
| GET | `/rooms` | JWT | List all rooms |
| POST | `/rooms` | JWT | Create a room |
| GET | `/rooms/:id/messages` | JWT | Message history (cursor pagination) |

**Socket.IO events:**

| Direction | Event | Payload |
|---|---|---|
| client → server | `room:join` | `{ roomId }` |
| client → server | `room:leave` | `{ roomId }` |
| client → server | `message:send` | `{ roomId, text }` |
| client → server | `typing:start` | `{ roomId }` |
| client → server | `typing:stop` | `{ roomId }` |
| server → client | `message:new` | `Message` |
| server → client | `presence:update` | `{ roomId, userIds }` |
| server → client | `typing:update` | `{ roomId, userIds }` |

---

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for a step-by-step guide using free-tier services (Railway + Upstash + Vercel).

---

## License

[MIT](LICENSE) © 2026 Ashish Vaghela
