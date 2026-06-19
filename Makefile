API_DIR  := apps/api
WEB_DIR  := apps/web

.PHONY: install dev dev-api dev-web build test typecheck clean stop \
        db-up db-down db-migrate db-reset db-studio db-generate \
        deploy-web deploy-api

# ─── Setup ──────────────────────────────────────────────────────────────────

install:
	pnpm install

# ─── Development ────────────────────────────────────────────────────────────

dev: db-up
	pnpm --parallel --filter @stalk-talk/api --filter @stalk-talk/web run dev

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

clean: stop
	find . -name 'dist' -not -path '*/node_modules/*' -exec rm -rf {} + 2>/dev/null || true
	find . -name '.turbo' -not -path '*/node_modules/*' -exec rm -rf {} + 2>/dev/null || true

stop:
	@fuser -k 5000/tcp 5173/tcp 2>/dev/null || true
	@echo "Stopped any process on :5000 (api) and :5173 (web)"

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
	@if [ -z "$$RENDER_DEPLOY_HOOK_URL" ]; then \
		echo "Set RENDER_DEPLOY_HOOK_URL (Render dashboard → service → Settings → Deploy Hook) and re-run:"; \
		echo "  RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx?key=yyy make deploy-api"; \
		exit 1; \
	fi
	curl -fsS -X POST "$$RENDER_DEPLOY_HOOK_URL"
