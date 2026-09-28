/**
 * Solana Networks
 *
 * Defines the Solana networks supported by SignalForge.
 *
 * @module @signalforge/shared/constants/solana-networks
 */const SOLANA_NETWORKS = Object.freeze({
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
});const SOLANA_NETWORK_VALUES = Object.freeze(Object.values(SOLANA_NETWORKS));const SOLANA_NETWORK_LABELS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'Mainnet Beta',
  [SOLANA_NETWORKS.DEVNET]: 'Devnet',
  [SOLANA_NETWORKS.TESTNET]: 'Testnet',
  [SOLANA_NETWORKS.LOCALNET]: 'Localnet',
});const DEFAULT_SOLANA_RPC_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'https://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'https://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'https://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'http://localhost:8899',
});const DEFAULT_SOLANA_WS_URLS = Object.freeze({
  [SOLANA_NETWORKS.MAINNET]: 'wss://api.mainnet-beta.solana.com',
  [SOLANA_NETWORKS.DEVNET]: 'wss://api.devnet.solana.com',
  [SOLANA_NETWORKS.TESTNET]: 'wss://api.testnet.solana.com',
  [SOLANA_NETWORKS.LOCALNET]: 'ws://localhost:8900',
});const SOLANA_COMMITMENT_LEVELS = Object.freeze({
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
});const SOLANA_COMMITMENT_LEVEL_VALUES = Object.freeze(
  Object.values(SOLANA_COMMITMENT_LEVELS),
);const DEFAULT_SOLANA_COMMITMENT = SOLANA_COMMITMENT_LEVELS.CONFIRMED;function isValidSolanaNetwork(network) {
  return SOLANA_NETWORK_VALUES.includes(network);
}function isValidCommitmentLevel(level) {
  return SOLANA_COMMITMENT_LEVEL_VALUES.includes(level);
}

module.exports.isValidSolanaNetwork = isValidSolanaNetwork;
module.exports.isValidCommitmentLevel = isValidCommitmentLevel;
module.exports.SOLANA_NETWORKS = SOLANA_NETWORKS;
module.exports.SOLANA_NETWORK_VALUES = SOLANA_NETWORK_VALUES;
module.exports.SOLANA_NETWORK_LABELS = SOLANA_NETWORK_LABELS;
module.exports.DEFAULT_SOLANA_RPC_URLS = DEFAULT_SOLANA_RPC_URLS;
module.exports.DEFAULT_SOLANA_WS_URLS = DEFAULT_SOLANA_WS_URLS;
module.exports.SOLANA_COMMITMENT_LEVELS = SOLANA_COMMITMENT_LEVELS;
module.exports.SOLANA_COMMITMENT_LEVEL_VALUES = SOLANA_COMMITMENT_LEVEL_VALUES;
module.exports.DEFAULT_SOLANA_COMMITMENT = DEFAULT_SOLANA_COMMITMENT;
