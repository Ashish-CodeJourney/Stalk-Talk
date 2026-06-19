# Stalk Talk — Full Reimplementation Plan

## Current State

| Aspect | Now |
|---|---|
| Auth | None — users pick any name |
| Storage | In-memory `users[]` array, no DB |
| Backend | Express + Socket.IO (CommonJS, no types) |
| Frontend | React (JSX, no types), Vite, Tailwind |
| Rooms | Any string, ephemeral |
| Messages | Not persisted |
| Deployment | Vercel (frontend), unknown (backend) |

---

## Target State

Real users, persistent messages & rooms, horizontally scalable, fully typed.

---

## Architecture Decision Record

### 1. Monorepo vs Polyrepo

**Decision: Monorepo with `pnpm workspaces`**

```
stalk-talk/
  apps/
    api/          ← Node + Fastify backend
    web/          ← React frontend
  packages/
    types/        ← Shared Zod schemas + derived TS types
    config/       ← Shared ESLint, TSConfig, Prettier
```

**Why:** Shared `types/` package eliminates the socket event contract drift that breaks chat apps. Single CI pipeline. `pnpm` workspaces are fast and simple.

---

### 2. Backend Framework

**Decision: Fastify (TypeScript)**

- Faster than Express, built-in schema validation via JSON Schema / Zod
- First-class TypeScript support
- Plugin ecosystem (fastify-jwt, fastify-oauth2, fastify-socket.io)
- Replaces Express + manual middleware chains

---

### 3. Database

**Decision: PostgreSQL (via Prisma ORM)**

| Entity | Why Postgres |
|---|---|
| Users | Relational, OAuth providers, unique constraints |
| Rooms | Relational memberships |
| Messages | Ordered, queryable history |

- Prisma: type-safe client, migrations, easy local dev with Docker
- Redis: pub/sub for Socket.IO adapter (horizontal scaling) + presence TTL keys

---

### 4. Auth: OAuth + JWT

**Flow:**

```
Browser → GET /auth/github  →  GitHub OAuth  →  /auth/callback
                                                  ↓
                                        createOrUpdateUser(DB)
                                                  ↓
                                        sign accessToken (15m JWT)
                                        sign refreshToken (7d JWT, stored in DB)
                                                  ↓
                                        Set-Cookie: refreshToken (httpOnly, Secure)
                                        Redirect → frontend with ?token=<accessToken>
```

**Providers:** GitHub (primary), Google (secondary) — via `fastify-oauth2`

**JWT:** 
- `accessToken`: short-lived (15 min), sent as `Authorization: Bearer <token>`
- `refreshToken`: long-lived (7 days), httpOnly cookie, rotated on use
- Socket.IO auth: client sends `accessToken` in handshake `auth.token`

---

### 5. Real-time: Socket.IO + Redis Adapter

```
Client ──ws──► Node 1 ──► Redis pub/sub ◄── Node 2 ──ws──► Client
```

- `@socket.io/redis-adapter` for multi-instance pub/sub
- Rooms are Socket.IO rooms mapped 1:1 to DB room IDs
- Presence: user online/offline stored as Redis keys with TTL

---

### 6. Frontend

**Decision: React + TypeScript + Vite (keep, but fully typed)**

- React Router v7 (already upgraded)
- Tanstack Query for REST data fetching (user profile, room list, message history)
- Socket.IO client for live events
- Tailwind CSS (keep)
- Zod for form validation (join room, create room)
- No Redux — context + Tanstack Query covers it

---

## Final Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind, Tanstack Query, React Router v7 |
| Backend | Node 22, Fastify, TypeScript, Socket.IO |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Auth | OAuth2 (GitHub, Google), JWT (fastify-jwt) |
| Shared types | Zod schemas in `packages/types` |
| Testing | Vitest, Testing Library, Supertest |
| Dev infra | Docker Compose (pg + redis), pnpm workspaces |
| CI | GitHub Actions |
| Deploy | Railway / Render (api), Vercel (web) |

---

## Data Model (Prisma Schema)

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  username     String    @unique
  avatarUrl    String?
  provider     String    // "github" | "google"
  providerId   String
  refreshToken String?
  createdAt    DateTime  @default(now())
  rooms        RoomMember[]
  messages     Message[]

  @@unique([provider, providerId])
}

model Room {
  id        String    @id @default(cuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  members   RoomMember[]
  messages  Message[]
}

model RoomMember {
  userId    String
  roomId    String
  joinedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  room      Room     @relation(fields: [roomId], references: [id])

  @@id([userId, roomId])
}

model Message {
  id        String   @id @default(cuid())
  text      String
  userId    String
  roomId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  room      Room     @relation(fields: [roomId], references: [id])
}
```

---

## API Surface

### REST (Fastify)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/auth/github` | — | Initiate GitHub OAuth |
| GET | `/auth/github/callback` | — | OAuth callback |
| GET | `/auth/google` | — | Initiate Google OAuth |
| GET | `/auth/google/callback` | — | OAuth callback |
| POST | `/auth/refresh` | cookie | Rotate refresh token |
| DELETE | `/auth/logout` | cookie | Revoke refresh token |
| GET | `/users/me` | JWT | Current user profile |
| GET | `/rooms` | JWT | List rooms |
| POST | `/rooms` | JWT | Create room |
| GET | `/rooms/:id/messages` | JWT | Paginated message history |

### Socket.IO Events

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `room:join` | `{ roomId }` | Join a room |
| `room:leave` | `{ roomId }` | Leave a room |
| `message:send` | `{ roomId, text }` | Send a message |
| `typing:start` | `{ roomId }` | Start typing indicator |
| `typing:stop` | `{ roomId }` | Stop typing indicator |

**Server → Client:**
| Event | Payload | Description |
|---|---|---|
| `message:new` | `Message` | New message in room |
| `room:users` | `{ roomId, users: User[] }` | Updated presence list |
| `typing:update` | `{ roomId, userId, isTyping }` | Typing indicator update |
| `error` | `{ code, message }` | Error event |

All socket events validated via Zod schemas from `packages/types`.

---

## Folder Structure

```
stalk-talk/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── plugins/        ← Fastify plugins (db, redis, auth, socket)
│   │   │   ├── routes/         ← REST route handlers
│   │   │   │   ├── auth/
│   │   │   │   ├── rooms/
│   │   │   │   └── users/
│   │   │   ├── socket/         ← Socket.IO event handlers
│   │   │   │   ├── handlers/
│   │   │   │   └── middleware/
│   │   │   ├── services/       ← Business logic (pure, testable)
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   ├── room.service.ts
│   │   │   │   └── presence.service.ts
│   │   │   ├── db/
│   │   │   │   └── prisma.ts   ← Prisma client singleton
│   │   │   └── app.ts          ← Fastify app factory
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── features/       ← Feature-sliced: auth/, chat/, rooms/
│       │   │   ├── auth/
│       │   │   │   ├── AuthCallback.tsx
│       │   │   │   └── useAuth.ts
│       │   │   ├── chat/
│       │   │   │   ├── ChatRoom.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   ├── MessageInput.tsx
│       │   │   │   ├── TypingIndicator.tsx
│       │   │   │   └── useSocket.ts
│       │   │   └── rooms/
│       │   │       ├── RoomList.tsx
│       │   │       └── CreateRoom.tsx
│       │   ├── shared/
│       │   │   ├── api.ts      ← axios instance + interceptors
│       │   │   └── socket.ts   ← Socket.IO client singleton
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
└── packages/
    ├── types/
    │   ├── src/
    │   │   ├── user.schema.ts
    │   │   ├── room.schema.ts
    │   │   ├── message.schema.ts
    │   │   └── socket.schema.ts  ← Socket event payloads
    │   └── package.json
    └── config/
        ├── tsconfig.base.json
        ├── eslint.base.js
        └── package.json
```

---

## Implementation Phases

### Phase 0 — Scaffold (Day 1)
- [ ] Init pnpm workspace monorepo
- [ ] Create `packages/config` (tsconfig base, eslint base)
- [ ] Create `packages/types` (initial Zod schemas: User, Room, Message, socket events)
- [ ] Create `apps/api` skeleton (Fastify + TypeScript + Vitest)
- [ ] Create `apps/web` skeleton (React + TypeScript + Vite)
- [ ] Docker Compose for Postgres + Redis
- [ ] GitHub Actions CI (typecheck + test on PR)

### Phase 1 — Auth (Day 2-3)
- [ ] Prisma schema + initial migration
- [ ] GitHub OAuth flow (fastify-oauth2)
- [ ] JWT issue/verify/refresh (fastify-jwt)
- [ ] `POST /auth/refresh`, `DELETE /auth/logout`
- [ ] Frontend: OAuth redirect, token storage (memory + httpOnly cookie), `useAuth` hook
- [ ] Protected route wrapper in React Router

### Phase 2 — Rooms + REST (Day 4-5)
- [ ] `GET /rooms`, `POST /rooms` endpoints
- [ ] `GET /rooms/:id/messages` with cursor-based pagination
- [ ] Frontend: RoomList, CreateRoom, message history load on join

### Phase 3 — Real-time Chat (Day 6-7)
- [ ] Socket.IO server plugin (fastify-socket.io)
- [ ] JWT auth middleware for Socket.IO handshake
- [ ] Redis adapter wired up
- [ ] `room:join`, `room:leave`, `message:send` handlers
- [ ] Typing indicators with debounce
- [ ] Presence (online users per room) via Redis TTL
- [ ] Frontend: `useSocket` hook, ChatRoom, MessageList, TypingIndicator

### Phase 4 — Polish + Deploy (Day 8-10)
- [x] Google OAuth as second provider
- [x] Message optimistic updates (socket-based, dedup on server echo)
- [ ] Infinite scroll for message history
- [x] User profile page
- [x] Error boundaries
- [x] Rate limiting (fastify-rate-limit)
- [x] Deploy: Render + Supabase (api), Vercel (web) — switched from Railway after trial ended
- [x] Environment variable audit (12-factor)

---

## Key Architecture Decisions Summary

| Decision | Choice | Tradeoff accepted |
|---|---|---|
| Monorepo | pnpm workspaces | Slightly more setup vs simpler isolation |
| Backend | Fastify over Express | Steeper plugin model vs faster + typed |
| ORM | Prisma | Migration overhead vs raw SQL speed |
| Auth | OAuth-only (no password) | No email/password vs less attack surface |
| JWT storage | accessToken in memory, refreshToken in httpOnly cookie | XSS-safe for refresh, CSRF needs mitigation on refresh endpoint |
| Scaling | Redis adapter | Requires Redis infra vs simpler single-instance |
| Types | Shared Zod package | Build step overhead vs guaranteed client/server contract parity |
