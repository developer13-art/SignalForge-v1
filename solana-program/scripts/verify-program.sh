#!/usr/bin/env bash
# =============================================================
# SignalForge — Verify Solana programs on the block explorer
# =============================================================

set -euo pipefail

CLUSTER="${1:-devnet}"
PROGRAMS=("signalforge-attestation" "signalforge-provenance" "signalforge-payment")

case "${CLUSTER}" in
  devnet)
    EXPLORER_HOST="explorer.solana.com"
    EXPLORER_SUFFIX="?cluster=devnet"
    ;;
  mainnet)
    EXPLORER_HOST="explorer.solana.com"
    EXPLORER_SUFFIX=""
    ;;
  localnet)
    EXPLORER_HOST="explorer.solana.com"
    EXPLORER_SUFFIX="?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899"
    ;;
  *)
    echo "Unknown cluster: ${CLUSTER}. Use devnet, mainnet, or localnet."
    exit 1
    ;;
esac

echo "=============================================="
echo "Verifying programs on ${CLUSTER}"
echo "=============================================="
echo ""

for program in "${PROGRAMS[@]}"; do
  KEYPAIR="target/deploy/$(echo "${program}" | tr '-' '_')-keypair.json"
  SO_FILE="target/deploy/$(echo "${program}" | tr '-' '_').so"

  if [ ! -f "${KEYPAIR}" ]; then
    echo "Warning: Missing keypair for ${program}"
    continue
  fi

  if [ ! -f "${SO_FILE}" ]; then
    echo "Warning: Missing build artifact for ${program}"
    continue
  fi

  PROGRAM_ID=$(solana address -k "${KEYPAIR}")
  PROGRAM_HASH=$(sha256sum "${SO_FILE}" | awk '{print $1}')

  echo "${program}"
  echo "  Program ID:    ${PROGRAM_ID}"
  echo "  Binary hash:   ${PROGRAM_HASH}"
  echo "  Explorer:      https://${EXPLORER_HOST}/address/${PROGRAM_ID}${EXPLORER_SUFFIX}"
  echo ""
done

echo "=============================================="
echo "Verification listing complete"
echo "=============================================="