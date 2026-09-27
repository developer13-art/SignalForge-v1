#!/usr/bin/env bash
# =============================================================
# SignalForge — Deploy all Solana programs to Mainnet
# =============================================================

set -euo pipefail

CLUSTER="mainnet"
PROGRAMS=("signalforge-attestation" "signalforge-provenance" "signalforge-payment")

echo "=============================================="
echo "SignalForge — Deploying to Mainnet"
echo "=============================================="
echo "WARNING: This will deploy to Solana Mainnet."
echo "=============================================="
echo ""

read -p "Type 'MAINNET' to confirm: " confirmation
if [ "${confirmation}" != "MAINNET" ]; then
  echo "Deployment cancelled."
  exit 1
fi

# Verify environment
command -v anchor >/dev/null 2>&1 || { echo "Error: anchor CLI is not installed."; exit 1; }
command -v solana >/dev/null 2>&1 || { echo "Error: solana CLI is not installed."; exit 1; }

if [ ! -f ~/.config/solana/id.json ]; then
  echo "Error: Solana keypair not found at ~/.config/solana/id.json"
  exit 1
fi

# Verify cluster is reachable
echo "Checking mainnet connectivity..."
solana config set --url https://api.mainnet-beta.solana.com
solana cluster-version

# Verify balance
BALANCE=$(solana balance --lamports | awk '{print $1}')
echo "Deployer balance: ${BALANCE} lamports"
if [ "${BALANCE}" -lt 10000000000 ]; then
  echo "Error: Balance too low for mainnet deployment (need at least 10 SOL)."
  exit 1
fi

# Build
echo ""
echo "Building programs (release mode)..."
anchor build

# Verify build artifacts
echo ""
echo "Verifying build artifacts..."
for program in "${PROGRAMS[@]}"; do
  SO_FILE="target/deploy/$(echo "${program}" | tr '-' '_').so"
  if [ ! -f "${SO_FILE}" ]; then
    echo "Error: Missing build artifact ${SO_FILE}"
    exit 1
  fi
  echo "  Found ${SO_FILE}"
done

# Deploy
echo ""
echo "Deploying programs to mainnet..."
anchor deploy --provider.cluster mainnet

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
anchor migrate --provider.cluster mainnet

echo ""
echo "=============================================="
echo "Deployment to Mainnet complete"
echo ""
echo "Next steps:"
echo "  1. Update Anchor.toml with the new program IDs"
echo "  2. Copy program IDs into the server environment"
echo "  3. Verify the programs on Solana Explorer"
echo "=============================================="