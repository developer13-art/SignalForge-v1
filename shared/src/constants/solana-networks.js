/**
 * Solana Networks
 *
 * Defines the Solana networks supported by SignalForge.
 *
 * @module @signalforge/shared/constants/solana-networks
 */

export const SOLANA_NETWORKS = Object.freeze({
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
});

export const SOLANA_NETWORK_VALUES = Object.freeze(Object.values(SOLANA_NETWORKS));

export const SOLANA_NETWORK_LABELS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'Mainnet Beta',
  [SOLANA_NETWORKS.DEVNET]: 'Devnet',
  [SOLANA_NETWORKS.TESTNET]: 'Testnet',
  [SOLANA_NETWORKS.LOCALNET]: 'Localnet',
});

export const DEFAULT_SOLANA_RPC_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'https://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'https://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'https://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'http://localhost:8899',
});

export const DEFAULT_SOLANA_WS_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'wss://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'wss://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'wss://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'ws://localhost:8900',
});

export const SOLANA_COMMITMENT_LEVELS = Object.freeze({
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
});

export const SOLANA_COMMITMENT_LEVEL_VALUES = Object.freeze(
  Object.values(SOLANA_COMMITMENT_LEVELS),
);

export const DEFAULT_SOLANA_COMMITMENT = SOLANA_COMMITMENT_LEVELS.CONFIRMED;

export function isValidSolanaNetwork(network) {
  return SOLANA_NETWORK_VALUES.includes(network);
}

export function isValidCommitmentLevel(level) {
  return SOLANA_COMMITMENT_LEVEL_VALUES.includes(level);
}