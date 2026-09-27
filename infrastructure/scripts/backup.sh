#!/usr/bin/env bash
# =============================================================
# SignalForge — Backup script
# =============================================================
# Backs up the PostgreSQL database and uploaded files.
#
# Usage:
#   ./backup.sh staging
#   ./backup.sh production
# =============================================================

set -euo pipefail

ENVIRONMENT="${1:-staging}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups/${ENVIRONMENT}"

mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
UPLOADS_BACKUP_FILE="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"

echo "=============================================="
echo "SignalForge — Backup for ${ENVIRONMENT}"
echo "=============================================="

cd "${ROOT_DIR}"

if [ ! -f ".env" ]; then
  echo "Error: .env not found."
  exit 1
fi

# Load environment
set -o allexport
source .env
set +o allexport

COMPOSE_FILE="docker-compose.prod.yml"

# -------------------------------------------------------------
# Database backup
# -------------------------------------------------------------
echo ""
echo "Backing up PostgreSQL database..."

if docker compose -f "${COMPOSE_FILE}" ps postgres | grep -q "Up"; then
  docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-privileges \
    | gzip > "${DB_BACKUP_FILE}"

  DB_SIZE=$(du -h "${DB_BACKUP_FILE}" | cut -f1)
  echo "Database backed up: ${DB_BACKUP_FILE} (${DB_SIZE})"
else
  echo "Warning: postgres container is not running. Skipping database backup."
fi

# -------------------------------------------------------------
# Uploads backup
# -------------------------------------------------------------
echo ""
echo "Backing up uploaded files..."

if [ -d "storage/uploads" ]; then
  tar -czf "${UPLOADS_BACKUP_FILE}" -C storage uploads
  UPLOADS_SIZE=$(du -h "${UPLOADS_BACKUP_FILE}" | cut -f1)
  echo "Uploads backed up: ${UPLOADS_BACKUP_FILE} (${UPLOADS_SIZE})"
else
  echo "No uploads directory found. Skipping uploads backup."
fi

# -------------------------------------------------------------
# Retention — keep last 30 backups
# -------------------------------------------------------------
echo ""
echo "Applying retention policy (keep last 30 backups)..."

find "${BACKUP_DIR}" -name "db_*.sql.gz" -type f -printf "%T@ %p\n" \
  | sort -rn \
  | tail -n +31 \
  | awk '{print $2}' \
  | xargs -r rm -v

find "${BACKUP_DIR}" -name "uploads_*.tar.gz" -type f -printf "%T@ %p\n" \
  | sort -rn \
  | tail -n +31 \
  | awk '{print $2}' \
  | xargs -r rm -v

echo ""
echo "=============================================="
echo "Backup complete"
echo "=============================================="