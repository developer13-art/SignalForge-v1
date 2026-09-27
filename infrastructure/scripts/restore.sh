#!/usr/bin/env bash
# =============================================================
# SignalForge — Restore script
# =============================================================
# Restores the PostgreSQL database and uploaded files from a
# previous backup.
#
# Usage:
#   ./restore.sh staging backups/staging/db_20260101_020000.sql.gz
# =============================================================

set -euo pipefail

ENVIRONMENT="${1:-}"
BACKUP_FILE="${2:-}"

if [ -z "${ENVIRONMENT}" ] || [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <environment> <backup-file>"
  echo ""
  echo "Example:"
  echo "  $0 staging backups/staging/db_20260101_020000.sql.gz"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${ROOT_DIR}"

if [ ! -f ".env" ]; then
  echo "Error: .env not found."
  exit 1
fi

set -o allexport
source .env
set +o allexport

COMPOSE_FILE="docker-compose.prod.yml"

echo "=============================================="
echo "SignalForge — Restore for ${ENVIRONMENT}"
echo "=============================================="
echo ""
echo "WARNING: This will OVERWRITE the current database."
echo "Environment: ${ENVIRONMENT}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Type 'RESTORE' to confirm: " confirmation
if [ "${confirmation}" != "RESTORE" ]; then
  echo "Restore cancelled."
  exit 1
fi

# -------------------------------------------------------------
# Safety backup before restore
# -------------------------------------------------------------
echo ""
echo "Step 1: Creating safety backup of current state..."
"${SCRIPT_DIR}/backup.sh" "${ENVIRONMENT}"

# -------------------------------------------------------------
# Terminate active connections
# -------------------------------------------------------------
echo ""
echo "Step 2: Terminating active database connections..."
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
  psql -U "${DB_USER}" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

# -------------------------------------------------------------
# Drop and recreate database
# -------------------------------------------------------------
echo ""
echo "Step 3: Dropping and recreating database..."
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
  psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
  psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

# -------------------------------------------------------------
# Restore from backup
# -------------------------------------------------------------
echo ""
echo "Step 4: Restoring database from backup..."
gunzip -c "${BACKUP_FILE}" | docker compose -f "${COMPOSE_FILE}" exec -T postgres \
  psql -U "${DB_USER}" -d "${DB_NAME}"

# -------------------------------------------------------------
# Restart server
# -------------------------------------------------------------
echo ""
echo "Step 5: Restarting server..."
docker compose -f "${COMPOSE_FILE}" restart server

# -------------------------------------------------------------
# Health check
# -------------------------------------------------------------
echo ""
echo "Step 6: Running health checks..."
sleep 10
"${SCRIPT_DIR}/health-check.sh" "${ENVIRONMENT}"

echo ""
echo "=============================================="
echo "Restore complete"
echo "=============================================="