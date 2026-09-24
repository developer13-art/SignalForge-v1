/**
 * Solana Constants
 *
 * @module client/src/lib/constants/solana.constants
 */

export const SOLANA_NETWORKS = Object.freeze({
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
});

export const SOLANA_NETWORK_LABELS = Object.freeze({
  'mainnet-beta': 'Mainnet Beta',
  devnet: 'Devnet',
  testnet: 'Testnet',
  localnet: 'Localnet',
});

export const SOLANA_TOKENS = Object.freeze({
  SOL: 'SOL',
  USDC: 'USDC',
  USDT: 'USDT',
});

export const ATTESTATION_TYPES = Object.freeze({
  PROVIDER_CERTIFICATION: 'PROVIDER_CERTIFICATION',
  PROVIDER_DNA: 'PROVIDER_DNA',
  PROVIDER_REPUTATION: 'PROVIDER_REPUTATION',
  SIGNAL_PROVENANCE: 'SIGNAL_PROVENANCE',
  TRADE_PROVENANCE: 'TRADE_PROVENANCE',
  CONSENSUS_RECORD: 'CONSENSUS_RECORD',
});

export const ATTESTATION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  REVOKED: 'REVOKED',
});

export const PAYMENT_STATUSES = Object.freeze({
  AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
  SUBMITTED: 'SUBMITTED',
  CONFIRMING: 'CONFIRMING',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const WALLET_PROVIDERS = Object.freeze([
  'Phantom',
  'Solflare',
  'Backpack',
  'Glow',
  'Slope',
  'Torus',
]);