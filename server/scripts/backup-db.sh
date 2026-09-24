#!/usr/bin/env bash
#
# Backup Database Script
#
# @module server/scripts/backup-db.sh

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-signalforge}"
DB_USER="${DB_USER:-signalforge}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/signalforge}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_${DB_NAME}_${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

echo "Backing up ${DB_NAME} to ${BACKUP_FILE}"

PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  -f "${BACKUP_FILE}"

echo "Backup complete: ${BACKUP_FILE}"