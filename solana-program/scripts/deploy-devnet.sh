#!/usr/bin/env bash
# =============================================================
# SignalForge — Deploy all Solana programs to Devnet
# =============================================================

set -euo pipefail

CLUSTER="devnet"
PROGRAMS=("signalforge-attestation" "signalforge-provenance" "signalforge-payment")

echo "=============================================="
echo "SignalForge — Deploying to ${CLUSTER}"
echo "=============================================="

# Verify environment
command -v anchor >/dev/null 2>&1 || { echo "Error: anchor CLI is not installed."; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "Error: solana CLI is not installed."; exit 1; }

# Verify wallet
if [ ! -f ~/.config/solana/id.json ]; then
  echo "Error: Solana keypair not found at ~/.config/solana/id.json"
  exit 1
fi

# Verify cluster is reachable
echo "Checking ${CLUSTER} connectivity..."
solana config set --url "${CLUSTER}"
solana cluster-version

# Verify balance
BALANCE=$(solana balance --lamports | awk '{print $1}')
echo "Deployer balance: ${BALANCE} lamports"
if [ "${BALANCE}" -lt 5000000000 ]; then
  echo "Warning: Balance may be too low for deployment."
fi

# Build
echo ""
echo "Building programs..."
anchor build

# Deploy
echo ""
echo "Deploying programs..."
anchor deploy --provider.cluster "${CLUSTER}"

# Show program IDs
echo ""
echo "Program IDs:"
for program in "${PROGRAMS[@]}"; do
  PROGRAM_ID=$(solana address -k "target/deploy/$(echo "${program}" | tr '-' '_')-keypair.json")
  echo "  ${program}: ${PROGRAM_ID}"
done

# Run migration
echo ""
echo "Running migrations..."
anchor migrate --provider.cluster "${CLUSTER}"

echo ""
echo "=============================================="
echo "Deployment to ${CLUSTER} complete"
echo "=============================================="