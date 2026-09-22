# =============================================================
# SignalForge AI - Makefile
# =============================================================

.DEFAULT_GOAL := help

SHELL := /bin/bash
NODE_ENV ?= development

# -------------------------------------------------------------
# Help
# -------------------------------------------------------------
.PHONY: help
help:
	@echo "SignalForge AI - Available Commands"
	@echo "-----------------------------------"
	@echo "install              Install all dependencies"
	@echo "dev                  Start development servers"
	@echo "build                Build all packages"
	@echo "start                Start production server"
	@echo "test                 Run all tests"
	@echo "lint                 Lint all packages"
	@echo "format               Format all files"
	@echo "migrate              Run database migrations"
	@echo "migrate:rollback     Roll back last migration"
	@echo "migrate:status       Show migration status"
	@echo "docker:up            Start local docker services"
	@echo "docker:down          Stop local docker services"
	@echo "docker:logs          Tail docker logs"
	@echo "solana:build         Build Solana programs"
	@echo "solana:test          Run Solana tests"
	@echo "solana:deploy:devnet Deploy Solana programs to devnet"
	@echo "clean                Remove build artifacts and node_modules"
	@echo "-----------------------------------"

# -------------------------------------------------------------
# Install
# -------------------------------------------------------------
.PHONY: install
install:
	pnpm install

# -------------------------------------------------------------
# Development
# -------------------------------------------------------------
.PHONY: dev
dev:
	pnpm dev

.PHONY: build
build:
	pnpm build

.PHONY: start
start:
	pnpm start

# -------------------------------------------------------------
# Testing
# -------------------------------------------------------------
.PHONY: test
test:
	pnpm test

.PHONY: test:server
test:server:
	pnpm test:server

.PHONY: test:client
test:client:
	pnpm test:client

# -------------------------------------------------------------
# Linting and Formatting
# -------------------------------------------------------------
.PHONY: lint
lint:
	pnpm lint

.PHONY: lint:fix
lint:fix:
	pnpm lint:fix

.PHONY: format
format:
	pnpm format

# -------------------------------------------------------------
# Database
# -------------------------------------------------------------
.PHONY: migrate
migrate:
	pnpm migrate

.PHONY: migrate:rollback
migrate:rollback:
	pnpm migrate:rollback

.PHONY: migrate:status
migrate:status:
	pnpm migrate:status

# -------------------------------------------------------------
# Docker
# -------------------------------------------------------------
.PHONY: docker:up
docker:up:
	docker compose up -d

.PHONY: docker:down
docker:down:
	docker compose down

.PHONY: docker:logs
docker:logs:
	docker compose logs -f

.PHONY: docker:rebuild
docker:rebuild:
	docker compose build --no-cache && docker compose up -d

# -------------------------------------------------------------
# Solana
# -------------------------------------------------------------
.PHONY: solana:build
solana:build:
	cd solana-program && anchor build

.PHONY: solana:test
solana:test:
	cd solana-program && anchor test

.PHONY: solana:deploy:devnet
solana:deploy:devnet:
	cd solana-program && anchor deploy --provider.cluster devnet

.PHONY: solana:deploy:mainnet
solana:deploy:mainnet:
	cd solana-program && anchor deploy --provider.cluster mainnet

# -------------------------------------------------------------
# Cleanup
# -------------------------------------------------------------
.PHONY: clean
clean:
	pnpm clean
	rm -rf node_modules
	rm -rf .turbo
	rm -rf server/node_modules server/dist
	rm -rf client/node_modules client/dist
	rm -rf shared/node_modules