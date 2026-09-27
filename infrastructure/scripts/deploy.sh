#!/usr/bin/env bash
# =============================================================
# SignalForge — Deploy script
# =============================================================
# Pulls the latest image, restarts services with zero downtime,
# and runs pending migrations.
#
# Usage:
#   ./deploy.sh staging
#   ./deploy.sh production
# =============================================================

set -euo pipefail

ENVIRONMENT="${1:-staging}"

case "${ENVIRONMENT}" in
  staging|production) ;;
  *)
    echo "Error: Environment must be 'staging' or 'production'."
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=============================================="
echo "SignalForge — Deploying to ${ENVIRONMENT}"
echo "=============================================="

cd "${ROOT_DIR}"

# Verify docker is available
if ! command -v docker &>/dev/null; then
  echo "Error: docker is not installed."
  exit 1
fi

# Verify docker compose file exists
COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "${COMPOSE_FILE}" ]; then
  echo "Error: ${COMPOSE_FILE} not found."
  exit 1
fi

# Verify .env exists
if [ ! -f ".env" ]; then
  echo "Error: .env not found. Copy .env.example and configure it."
  exit 1
fi

# -------------------------------------------------------------
# Backup current state
# -------------------------------------------------------------
echo ""
echo "Step 1: Backing up current state..."
"${SCRIPT_DIR}/backup.sh" "${ENVIRONMENT}"

# -------------------------------------------------------------
# Pull latest code
# -------------------------------------------------------------
echo ""
echo "Step 2: Pulling latest code..."
if [ -d ".git" ]; then
  git fetch --all
  if [ "${ENVIRONMENT}" = "production" ]; then
    git pull origin main
  else
    git pull origin develop
  fi
else
  echo "Skipping git pull — not a git repository."
fi

# -------------------------------------------------------------
# Pull latest Docker images
# -------------------------------------------------------------
echo ""
echo "Step 3: Pulling Docker images..."
docker compose -f "${COMPOSE_FILE}" pull

# -------------------------------------------------------------
# Build containers
# -------------------------------------------------------------
echo ""
echo "Step 4: Building containers..."
docker compose -f "${COMPOSE_FILE}" build --pull

# -------------------------------------------------------------
# Rolling restart
# -------------------------------------------------------------
echo ""
echo "Step 5: Restarting services..."
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

# -------------------------------------------------------------
# Wait for services
# -------------------------------------------------------------
echo ""
echo "Step 6: Waiting for services to become healthy..."
RETRIES=30
until docker compose -f "${COMPOSE_FILE}" ps --status running | grep -q "server"; do
  RETRIES=$((RETRIES - 1))
  if [ "${RETRIES}" -le 0 ]; then
    echo "Error: Server did not become healthy in time."
    exit 1
  fi
  sleep 2
done

sleep 10

# -------------------------------------------------------------
# Run migrations
# -------------------------------------------------------------
echo ""
echo "Step 7: Running database migrations..."
docker compose -f "${COMPOSE_FILE}" exec -T server node src/scripts/migrate.js

# -------------------------------------------------------------
# Health check
# -------------------------------------------------------------
echo ""
echo "Step 8: Running health checks..."
"${SCRIPT_DIR}/health-check.sh" "${ENVIRONMENT}"

# -------------------------------------------------------------
# Cleanup
# -------------------------------------------------------------
echo ""
echo "Step 9: Cleaning up old images..."
docker image prune -f --filter "until=168h"

echo ""
echo "=============================================="
echo "Deployment to ${ENVIRONMENT} complete"
echo "=============================================="