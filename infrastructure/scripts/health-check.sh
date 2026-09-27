#!/usr/bin/env bash
# =============================================================
# SignalForge — Health check script
# =============================================================
# Verifies that all critical services are running and responding.
#
# Usage:
#   ./health-check.sh staging
#   ./health-check.sh production
# =============================================================

set -euo pipefail

ENVIRONMENT="${1:-staging}"

case "${ENVIRONMENT}" in
  staging)
    API_URL="https://staging.signalforge.ai"
    APP_URL="https://staging.signalforge.ai"
    ;;
  production)
    API_URL="https://api.signalforge.ai"
    APP_URL="https://signalforge.ai"
    ;;
  local)
    API_URL="http://localhost:4000"
    APP_URL="http://localhost:3000"
    ;;
  *)
    echo "Error: Unknown environment: ${ENVIRONMENT}"
    exit 1
    ;;
esac

echo "=============================================="
echo "SignalForge — Health Check (${ENVIRONMENT})"
echo "=============================================="
echo ""

FAILED=0

# -------------------------------------------------------------
# Check API health endpoint
# -------------------------------------------------------------
echo "Checking API health endpoint..."
HTTP_CODE=$(curl -s -o /tmp/api_health_response -w "%{http_code}" \
  --max-time 15 "${API_URL}/health" || echo "000")

if [ "${HTTP_CODE}" = "200" ]; then
  echo "  ✓ API health: 200 OK"
  cat /tmp/api_health_response | head -c 200
  echo ""
else
  echo "  ✗ API health: ${HTTP_CODE}"
  FAILED=1
fi

# -------------------------------------------------------------
# Check API readiness
# -------------------------------------------------------------
echo ""
echo "Checking API readiness..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 15 "${API_URL}/ready" || echo "000")

if [ "${HTTP_CODE}" = "200" ]; then
  echo "  ✓ API ready: 200 OK"
else
  echo "  ✗ API ready: ${HTTP_CODE}"
  FAILED=1
fi

# -------------------------------------------------------------
# Check client
# -------------------------------------------------------------
echo ""
echo "Checking client..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 15 "${APP_URL}" || echo "000")

if [ "${HTTP_CODE}" = "200" ]; then
  echo "  ✓ Client: 200 OK"
else
  echo "  ✗ Client: ${HTTP_CODE}"
  FAILED=1
fi

# -------------------------------------------------------------
# Check SSL certificate validity (>= 14 days)
# -------------------------------------------------------------
echo ""
echo "Checking SSL certificate..."
HOST=$(echo "${API_URL}" | sed -E 's|https?://||' | sed -E 's|/.*||')
EXPIRY=$(echo | openssl s_client -servername "${HOST}" -connect "${HOST}:443" 2>/dev/null \
  | openssl x509 -noout -enddate 2>/dev/null \
  | cut -d= -f2 || echo "")

if [ -n "${EXPIRY}" ]; then
  EXPIRY_EPOCH=$(date -d "${EXPIRY}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${EXPIRY}" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

  if [ "${DAYS_LEFT}" -gt 14 ]; then
    echo "  ✓ SSL certificate valid for ${DAYS_LEFT} more days"
  else
    echo "  ✗ SSL certificate expires in ${DAYS_LEFT} days"
    FAILED=1
  fi
else
  echo "  ? Could not determine SSL certificate expiry"
fi

# -------------------------------------------------------------
# Summary
# -------------------------------------------------------------
echo ""
echo "=============================================="
if [ "${FAILED}" -eq 0 ]; then
  echo "All health checks passed"
  echo "=============================================="
  exit 0
else
  echo "One or more health checks FAILED"
  echo "=============================================="
  exit 1
fi