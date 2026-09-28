/**
 * Solana Constants
 *
 * Shared constants for the Solana module. These values are always
 * read through the config module at runtime; these constants only
 * provide safe fallbacks and semantic names.
 *
 * @module server/modules/solana/solana.constants
 */

export const SOLANA_COMMITMENT_LEVELS = Object.freeze({
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
});

export const SOLANA_COMMITMENT_LEVEL_VALUES = Object.freeze(
  Object.values(SOLANA_COMMITMENT_LEVELS),
);

export const SOLANA_NETWORKS = Object.freeze({
  MAINNET_BETA: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
});

export const SOLANA_NETWORK_VALUES = Object.freeze(Object.values(SOLANA_NETWORKS));

export const SOLANA_TRANSACTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});

export const SOLANA_TRANSACTION_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_TRANSACTION_STATUSES),
);

export const SOLANA_ATTESTATION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  REVOKED: 'REVOKED',
});

export const SOLANA_ATTESTATION_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_ATTESTATION_STATUSES),
);

export const SOLANA_PROVENANCE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
});

export const SOLANA_PROVENANCE_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_PROVENANCE_STATUSES),
);

export const SOLANA_PAYMENT_STATUSES = Object.freeze({
  AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
  SUBMITTED: 'SUBMITTED',
  CONFIRMING: 'CONFIRMING',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});

export const SOLANA_PAYMENT_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_PAYMENT_STATUSES),
);

export const SOLANA_TOKENS = Object.freeze({
  SOL: 'SOL',
  USDC: 'USDC',
  USDT: 'USDT',
});

export const SOLANA_TOKEN_VALUES = Object.freeze(Object.values(SOLANA_TOKENS));

export const SOLANA_DEFAULT_COMMITMENT = SOLANA_COMMITMENT_LEVELS.CONFIRMED;

export const SOLANA_MAX_RETRIES = 3;

export const SOLANA_RETRY_DELAY_MS = 2000;

export const SOLANA_CONFIRMATION_TIMEOUT_MS = 60000;

export const SOLANA_INDEXER_POLL_INTERVAL_MS = 5000;

export const SOLANA_INDEXER_MAX_SLOTS_PER_RUN = 100;

export const SOLANA_MEMO_MAX_LENGTH = 566;

export const SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST = Object.freeze([
  'providerId',
  'certificationStatus',
  'certificationVersion',
  'dnaConfidence',
  'consistencyScore',
  'verifiedAt',
  'signalId',
  'processingHash',
  'aiVersion',
]);

export function isValidNetwork(network) {
  return SOLANA_NETWORK_VALUES.includes(network);
}

export function isValidCommitment(commitment) {
  return SOLANA_COMMITMENT_LEVEL_VALUES.includes(commitment);
}

export function isValidTransactionStatus(status) {
  return SOLANA_TRANSACTION_STATUS_VALUES.includes(status);
}

export function isValidAttestationStatus(status) {
  return SOLANA_ATTESTATION_STATUS_VALUES.includes(status);
}

export function isValidProvenanceStatus(status) {
  return SOLANA_PROVENANCE_STATUS_VALUES.includes(status);
}

export function isValidPaymentStatus(status) {
  return SOLANA_PAYMENT_STATUS_VALUES.includes(status);
}

export function isValidToken(token) {
  return SOLANA_TOKEN_VALUES.includes(token);
}