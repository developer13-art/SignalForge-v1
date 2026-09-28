'use strict';

/**
 * SignalForge - Solana Connection Configuration
 *
 * The single source of truth for how the platform reaches the
 * Solana network. Every Solana module reads its RPC URL, WebSocket
 * URL, and commitment level from here.
 */

function optionalEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  return String(value).trim();
}

function optionalBool(key, fallback = false) {
  const value = optionalEnv(key);
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

const NETWORKS = Object.freeze({
  'mainnet-beta': {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
  },
  devnet: {
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
  },
  testnet: {
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
  },
});

function resolveNetwork() {
  return optionalEnv('SOLANA_NETWORK', 'mainnet-beta');
}

function resolveRpcUrl() {
  const explicit = optionalEnv('SOLANA_RPC_URL');
  if (explicit) {
    return explicit;
  }
  const network = resolveNetwork();
  const config = NETWORKS[network] || NETWORKS['mainnet-beta'];
  return config.rpcUrl;
}

function resolveWsUrl() {
  const explicit = optionalEnv('SOLANA_WS_URL');
  if (explicit) {
    return explicit;
  }
  const network = resolveNetwork();
  const config = NETWORKS[network] || NETWORKS['mainnet-beta'];
  return config.wsUrl;
}

function resolveCommitment() {
  const value = optionalEnv('SOLANA_COMMITMENT', 'confirmed');
  if (!['processed', 'confirmed', 'finalized'].includes(value)) {
    return 'confirmed';
  }
  return value;
}

function resolveTreasuryWallet() {
  return optionalEnv('SOLANA_TREASURY_WALLET', '');
}

function resolveAttestationProgramId() {
  return optionalEnv('SOLANA_ATTESTATION_PROGRAM_ID', '');
}

function resolveProvenanceProgramId() {
  return optionalEnv('SOLANA_PROVENANCE_PROGRAM_ID', '');
}

function resolvePaymentProgramId() {
  return optionalEnv('SOLANA_PAYMENT_PROGRAM_ID', '');
}

function isIndexerEnabled() {
  return optionalBool('SOLANA_INDEXER_ENABLED', true);
}

function getNetworkConfig() {
  const network = resolveNetwork();
  return {
    network,
    rpcUrl: resolveRpcUrl(),
    wsUrl: resolveWsUrl(),
    commitment: resolveCommitment(),
    treasuryWallet: resolveTreasuryWallet(),
    attestationProgramId: resolveAttestationProgramId(),
    provenanceProgramId: resolveProvenanceProgramId(),
    paymentProgramId: resolvePaymentProgramId(),
  };
}

module.exports = {
  NETWORKS,
  resolveNetwork,
  resolveRpcUrl,
  resolveWsUrl,
  resolveCommitment,
  resolveTreasuryWallet,
  resolveAttestationProgramId,
  resolveProvenanceProgramId,
  resolvePaymentProgramId,
  isIndexerEnabled,
  getNetworkConfig,
};