API_DIR  := apps/api
WEB_DIR  := apps/web

.PHONY: install dev dev-api dev-web build test typecheck clean \
        db-up db-down db-migrate db-reset db-studio db-generate \
        deploy-web deploy-api

# ─── Setup ──────────────────────────────────────────────────────────────────

install:
	pnpm install

# ─── Development ────────────────────────────────────────────────────────────

dev: db-up
	pnpm --parallel -r exec sh -c 'npm run dev 2>&1' &
	@echo "API → http://localhost:5000  |  Web → http://localhost:5173"
	@wait

dev-api:
	pnpm --filter @stalk-talk/api dev

dev-web:
	pnpm --filter @stalk-talk/web dev

# ─── Quality ────────────────────────────────────────────────────────────────

test:
	pnpm -r test

test-watch:
	pnpm -r test:watch

typecheck:
	pnpm -r typecheck

# ─── Build ──────────────────────────────────────────────────────────────────

build:
	pnpm -r build

clean:
	find . -name 'dist' -not -path '*/node_modules/*' -exec rm -rf {} + 2>/dev/null || true
	find . -name '.turbo' -not -path '*/node_modules/*' -exec rm -rf {} + 2>/dev/null || true

# ─── Database ───────────────────────────────────────────────────────────────

db-up:
	docker compose up -d
	@echo "Waiting for Postgres to be ready…"
	@until docker compose exec -T postgres pg_isready -U stalktalk -q; do sleep 1; done

db-down:
	docker compose down

db-migrate:
	pnpm --filter @stalk-talk/api exec prisma migrate dev

db-deploy:
	pnpm --filter @stalk-talk/api exec prisma migrate deploy

db-reset:
	pnpm --filter @stalk-talk/api exec prisma migrate reset --force

db-studio:
	pnpm --filter @stalk-talk/api exec prisma studio

db-generate:
	pnpm --filter @stalk-talk/api exec prisma generate

# ─── Deployment ─────────────────────────────────────────────────────────────

deploy-web:
	pnpm --filter @stalk-talk/web build
	cd $(WEB_DIR) && npx vercel --prod

deploy-api:
	railway up --service api
