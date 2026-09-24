#!/usr/bin/env bash
#
# Restore Database Script
#
# @module server/scripts/restore-db.sh

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-signalforge}"
DB_USER="${DB_USER:-signalforge}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "Restoring ${DB_NAME} from ${BACKUP_FILE}"

PGPASSWORD="${DB_PASSWORD:-}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  "${BACKUP_FILE}"

echo "Restore complete"