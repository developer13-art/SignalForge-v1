/**
 * Solana Constants
 *
 * Shared constants for the Solana module. These values are always
 * read through the config module at runtime; these constants only
 * provide safe fallbacks and semantic names.
 *
 * @module server/modules/solana/solana.constants
 */
const SOLANA_COMMITMENT_LEVELS = Object.freeze({
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
});
const SOLANA_COMMITMENT_LEVEL_VALUES = Object.freeze(
  Object.values(SOLANA_COMMITMENT_LEVELS),
);
const SOLANA_NETWORKS = Object.freeze({
  MAINNET_BETA: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  LOCALNET: 'localnet',
});
const SOLANA_NETWORK_VALUES = Object.freeze(Object.values(SOLANA_NETWORKS));
const SOLANA_TRANSACTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
});
const SOLANA_TRANSACTION_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_TRANSACTION_STATUSES),
);
const SOLANA_ATTESTATION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  REVOKED: 'REVOKED',
});
const SOLANA_ATTESTATION_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_ATTESTATION_STATUSES),
);
const SOLANA_PROVENANCE_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
});
const SOLANA_PROVENANCE_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_PROVENANCE_STATUSES),
);
const SOLANA_PAYMENT_STATUSES = Object.freeze({
  AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
  SUBMITTED: 'SUBMITTED',
  CONFIRMING: 'CONFIRMING',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});
const SOLANA_PAYMENT_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_PAYMENT_STATUSES),
);
const SOLANA_TOKENS = Object.freeze({
  SOL: 'SOL',
  USDC: 'USDC',
  USDT: 'USDT',
});
const SOLANA_TOKEN_VALUES = Object.freeze(Object.values(SOLANA_TOKENS));
const SOLANA_DEFAULT_COMMITMENT = SOLANA_COMMITMENT_LEVELS.CONFIRMED;
const SOLANA_MAX_RETRIES = 3;
const SOLANA_RETRY_DELAY_MS = 2000;
const SOLANA_CONFIRMATION_TIMEOUT_MS = 60000;
const SOLANA_INDEXER_POLL_INTERVAL_MS = 5000;
const SOLANA_INDEXER_MAX_SLOTS_PER_RUN = 100;
const SOLANA_MEMO_MAX_LENGTH = 566;
const SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST = Object.freeze([
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
function isValidNetwork(network) {
  return SOLANA_NETWORK_VALUES.includes(network);
}
function isValidCommitment(commitment) {
  return SOLANA_COMMITMENT_LEVEL_VALUES.includes(commitment);
}
function isValidTransactionStatus(status) {
  return SOLANA_TRANSACTION_STATUS_VALUES.includes(status);
}
function isValidAttestationStatus(status) {
  return SOLANA_ATTESTATION_STATUS_VALUES.includes(status);
}
function isValidProvenanceStatus(status) {
  return SOLANA_PROVENANCE_STATUS_VALUES.includes(status);
}
function isValidPaymentStatus(status) {
  return SOLANA_PAYMENT_STATUS_VALUES.includes(status);
}
function isValidToken(token) {
  return SOLANA_TOKEN_VALUES.includes(token);
}
module.exports.SOLANA_COMMITMENT_LEVELS = SOLANA_COMMITMENT_LEVELS;
module.exports.SOLANA_COMMITMENT_LEVEL_VALUES = SOLANA_COMMITMENT_LEVEL_VALUES;
module.exports.SOLANA_NETWORKS = SOLANA_NETWORKS;
module.exports.SOLANA_NETWORK_VALUES = SOLANA_NETWORK_VALUES;
module.exports.SOLANA_TRANSACTION_STATUSES = SOLANA_TRANSACTION_STATUSES;
module.exports.SOLANA_TRANSACTION_STATUS_VALUES = SOLANA_TRANSACTION_STATUS_VALUES;
module.exports.SOLANA_ATTESTATION_STATUSES = SOLANA_ATTESTATION_STATUSES;
module.exports.SOLANA_ATTESTATION_STATUS_VALUES = SOLANA_ATTESTATION_STATUS_VALUES;
module.exports.SOLANA_PROVENANCE_STATUSES = SOLANA_PROVENANCE_STATUSES;
module.exports.SOLANA_PROVENANCE_STATUS_VALUES = SOLANA_PROVENANCE_STATUS_VALUES;
module.exports.SOLANA_PAYMENT_STATUSES = SOLANA_PAYMENT_STATUSES;
module.exports.SOLANA_PAYMENT_STATUS_VALUES = SOLANA_PAYMENT_STATUS_VALUES;
module.exports.SOLANA_TOKENS = SOLANA_TOKENS;
module.exports.SOLANA_TOKEN_VALUES = SOLANA_TOKEN_VALUES;
module.exports.SOLANA_DEFAULT_COMMITMENT = SOLANA_DEFAULT_COMMITMENT;
module.exports.SOLANA_MAX_RETRIES = SOLANA_MAX_RETRIES;
module.exports.SOLANA_RETRY_DELAY_MS = SOLANA_RETRY_DELAY_MS;
module.exports.SOLANA_CONFIRMATION_TIMEOUT_MS = SOLANA_CONFIRMATION_TIMEOUT_MS;
module.exports.SOLANA_INDEXER_POLL_INTERVAL_MS = SOLANA_INDEXER_POLL_INTERVAL_MS;
module.exports.SOLANA_INDEXER_MAX_SLOTS_PER_RUN = SOLANA_INDEXER_MAX_SLOTS_PER_RUN;
module.exports.SOLANA_MEMO_MAX_LENGTH = SOLANA_MEMO_MAX_LENGTH;
module.exports.SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST = SOLANA_ATTESTATION_PUBLIC_FIELD_WHITELIST;
module.exports.isValidNetwork = isValidNetwork;
module.exports.isValidCommitment = isValidCommitment;
module.exports.isValidTransactionStatus = isValidTransactionStatus;
module.exports.isValidAttestationStatus = isValidAttestationStatus;
module.exports.isValidProvenanceStatus = isValidProvenanceStatus;
module.exports.isValidPaymentStatus = isValidPaymentStatus;
module.exports.isValidToken = isValidToken;
