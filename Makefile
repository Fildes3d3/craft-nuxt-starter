# =============================================================================
# craft-nuxt-starter
#
#   make setup   ← first run: builds everything, installs Craft, seeds content
#   make up      ← start (after setup)
#   make down    ← stop
# =============================================================================

COMPOSE = docker compose
# Run as www-data (uid 1000) so files created on the bind mount stay owned by
# the host user on Linux. COMPOSER_HOME keeps composer's cache writable.
PHP     = $(COMPOSE) exec -T --user www-data -e COMPOSER_HOME=/tmp/composer php-fpm
CRAFT   = $(PHP) php /app/backend/craft

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo ""
	@echo "  craft-nuxt-starter"
	@echo ""
	@echo "    make setup       First-time setup: env files, containers, Craft install, demo content"
	@echo "    make up          Start all containers"
	@echo "    make down        Stop all containers"
	@echo "    make restart     down + up"
	@echo "    make logs        Follow logs for all services"
	@echo "    make logs-nuxt   Follow the Nuxt container only"
	@echo "    make shell-php   Shell into the PHP container"
	@echo "    make shell-nuxt  Shell into the Nuxt container"
	@echo "    make craft c=…   Run a Craft console command, e.g. make craft c=\"clear-caches/all\""
	@echo "    make lint        Run ESLint on the frontend"
	@echo "    make lint-fix    Run ESLint with --fix"
	@echo "    make test        Run the Vitest suite"
	@echo "    make nuke        Stop everything and delete the database volume (fresh start)"
	@echo ""

# -----------------------------------------------------------------------------
# setup — the one command
# -----------------------------------------------------------------------------
.PHONY: setup
setup:
	@echo ""
	@echo "▶ 1/6  Creating .env files (if missing)..."
	@test -f .env          || cp .env.example .env
	@test -f backend/.env  || cp backend/.env.example backend/.env
	@test -f frontend/.env || cp frontend/.env.example frontend/.env
	@echo ""
	@echo "▶ 2/6  Building and starting containers (first build takes a few minutes)..."
	$(COMPOSE) up -d --build
	@echo ""
	@echo "▶ 3/6  Installing Craft dependencies (composer)..."
	$(PHP) composer install --working-dir=/app/backend --no-interaction --no-progress
	@echo ""
	@echo "▶ 4/6  Generating security key + installing Craft..."
	@grep -q '^CRAFT_SECURITY_KEY=.\+' backend/.env || $(CRAFT) setup/security-key
	@$(CRAFT) install/craft \
		--interactive=0 \
		--email=admin@example.com \
		--username=admin \
		--password=password \
		--site-name="Craft Nuxt Starter" \
		--site-url='$$PRIMARY_SITE_URL' \
		--language=en \
		|| echo "  (Craft already installed — skipping)"
	@echo ""
	@echo "▶ 5/6  Applying project config (content model)..."
	@$(CRAFT) project-config/apply --force
	@echo ""
	@echo "▶ 6/6  Seeding demo content..."
	@$(PHP) php /app/backend/scripts/seed.php
	@echo ""
	@echo "  ✓ Done!"
	@echo ""
	@echo "    Site         →  http://localhost"
	@echo "    Blog         →  http://localhost/blog"
	@echo "    Craft admin  →  http://localhost/admin   (admin / password)"
	@echo "    GraphiQL     →  http://localhost/admin/graphiql"
	@echo ""

# -----------------------------------------------------------------------------
# Daily driving
# -----------------------------------------------------------------------------
.PHONY: up down restart logs logs-nuxt shell-php shell-nuxt craft nuke

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f

logs-nuxt:
	$(COMPOSE) logs -f nuxt

shell-php:
	$(COMPOSE) exec php-fpm bash

shell-nuxt:
	$(COMPOSE) exec nuxt sh

## Run any Craft console command: make craft c="clear-caches/all"
craft:
	$(CRAFT) $(c)

## Full reset — removes containers AND the database volume
nuke:
	$(COMPOSE) down -v
	@echo "Database volume removed. Run 'make setup' to start fresh."

# -----------------------------------------------------------------------------
# Code quality (runs inside the Nuxt container — no host Node needed)
# -----------------------------------------------------------------------------
.PHONY: lint lint-fix typecheck test test-watch

lint:
	$(COMPOSE) exec -T nuxt npm run lint

lint-fix:
	$(COMPOSE) exec -T nuxt npm run lint:fix

typecheck:
	$(COMPOSE) exec -T nuxt npm run typecheck

test:
	$(COMPOSE) exec -T nuxt npm run test

test-watch:
	$(COMPOSE) exec nuxt npm run test:watch
