#!/usr/bin/env bash
# =============================================================
# SignalForge — Secret rotation script
# =============================================================
# Rotates secrets stored in AWS Secrets Manager and refreshes the
# Kubernetes secret that the application consumes.
#
# Usage:
#   ./rotate-secrets.sh production jwt-secret
#   ./rotate-secrets.sh production session-secret
#   ./rotate-secrets.sh production encryption-key
# =============================================================

set -euo pipefail

ENVIRONMENT="${1:-}"
SECRET_NAME="${2:-}"

if [ -z "${ENVIRONMENT}" ] || [ -z "${SECRET_NAME}" ]; then
  echo "Usage: $0 <environment> <secret-name>"
  echo ""
  echo "Available secret names:"
  echo "  jwt-secret"
  echo "  session-secret"
  echo "  encryption-key"
  echo "  cookie-secret"
  exit 1
fi

case "${ENVIRONMENT}" in
  staging|production) ;;
  *)
    echo "Error: Environment must be 'staging' or 'production'."
    exit 1
    ;;
esac

command -v aws &>/dev/null || { echo "Error: aws CLI is required."; exit 1; }
command -v kubectl &>/dev/null || { echo "Error: kubectl is required."; exit 1; }

SECRET_PATH="signalforge/${ENVIRONMENT}/${SECRET_NAME}"

echo "=============================================="
echo "SignalForge — Secret Rotation"
echo "Environment: ${ENVIRONMENT}"
echo "Secret:      ${SECRET_NAME}"
echo "=============================================="
echo ""
read -p "Type 'ROTATE' to confirm: " confirmation
if [ "${confirmation}" != "ROTATE" ]; then
  echo "Rotation cancelled."
  exit 1
fi

# -------------------------------------------------------------
# Generate a new secret value
# -------------------------------------------------------------
case "${SECRET_NAME}" in
  encryption-key)
    NEW_VALUE=$(openssl rand -hex 32)
    ;;
  *)
    NEW_VALUE=$(openssl rand -base64 72 | tr -d '\n')
    ;;
esac

# -------------------------------------------------------------
# Update AWS Secrets Manager
# -------------------------------------------------------------
echo ""
echo "Step 1: Updating AWS Secrets Manager..."
aws secretsmanager update-secret \
  --secret-id "${SECRET_PATH}" \
  --secret-string "${NEW_VALUE}" \
  --region "${AWS_REGION:-us-east-1}"

echo "AWS Secrets Manager updated."

# -------------------------------------------------------------
# Refresh Kubernetes secret
# -------------------------------------------------------------
echo ""
echo "Step 2: Refreshing Kubernetes secret..."

K8S_KEY=$(echo "${SECRET_NAME}" | tr '[:lower:]-' '[:upper:]_')

kubectl -n signalforge create secret generic signalforge-secrets \
  --from-literal="${K8S_KEY}=${NEW_VALUE}" \
  --dry-run=client -o yaml \
  | kubectl apply -f -

echo "Kubernetes secret updated."

# -------------------------------------------------------------
# Rolling restart to pick up the new secret
# -------------------------------------------------------------
echo ""
echo "Step 3: Rolling restart of server deployment..."
kubectl -n signalforge rollout restart deployment/signalforge-server
kubectl -n signalforge rollout status deployment/signalforge-server --timeout=300s

echo ""
echo "=============================================="
echo "Secret rotation complete"
echo "=============================================="