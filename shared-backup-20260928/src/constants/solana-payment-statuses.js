/**
 * Solana Payment Statuses
 *
 * Defines the lifecycle states of a Solana payment in SignalForge.
 *
 * @module @signalforge/shared/constants/solana-payment-statuses
 */const SOLANA_PAYMENT_STATUSES = Object.freeze({
  AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
  SUBMITTED: 'SUBMITTED',
  CONFIRMING: 'CONFIRMING',
  CONFIRMED: 'CONFIRMED',
  FINALIZED: 'FINALIZED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});const SOLANA_PAYMENT_STATUS_VALUES = Object.freeze(
  Object.values(SOLANA_PAYMENT_STATUSES),
);const SOLANA_PAYMENT_STATUS_LABELS = Object.freeze({
  [SOLANA_PAYMENT_STATUSES.AWAITING_SIGNATURE]: 'Awaiting Signature',
  [SOLANA_PAYMENT_STATUSES.SUBMITTED]: 'Submitted',
  [SOLANA_PAYMENT_STATUSES.CONFIRMING]: 'Confirming',
  [SOLANA_PAYMENT_STATUSES.CONFIRMED]: 'Confirmed',
  [SOLANA_PAYMENT_STATUSES.FINALIZED]: 'Finalized',
  [SOLANA_PAYMENT_STATUSES.FAILED]: 'Failed',
  [SOLANA_PAYMENT_STATUSES.EXPIRED]: 'Expired',
  [SOLANA_PAYMENT_STATUSES.REFUNDED]: 'Refunded',
});const SUCCESSFUL_SOLANA_PAYMENT_STATUSES = Object.freeze([
  SOLANA_PAYMENT_STATUSES.CONFIRMED,
  SOLANA_PAYMENT_STATUSES.FINALIZED,
]);const TERMINAL_SOLANA_PAYMENT_STATUSES = Object.freeze([
  SOLANA_PAYMENT_STATUSES.CONFIRMED,
  SOLANA_PAYMENT_STATUSES.FINALIZED,
  SOLANA_PAYMENT_STATUSES.FAILED,
  SOLANA_PAYMENT_STATUSES.EXPIRED,
  SOLANA_PAYMENT_STATUSES.REFUNDED,
]);const DEFAULT_SOLANA_PAYMENT_EXPIRY_MINUTES = 30;function isSuccessfulSolanaPayment(status) {
  return SUCCESSFUL_SOLANA_PAYMENT_STATUSES.includes(status);
}function isTerminalSolanaPaymentStatus(status) {
  return TERMINAL_SOLANA_PAYMENT_STATUSES.includes(status);
}function isValidSolanaPaymentStatus(status) {
  return SOLANA_PAYMENT_STATUS_VALUES.includes(status);
}

module.exports.isSuccessfulSolanaPayment = isSuccessfulSolanaPayment;
module.exports.isTerminalSolanaPaymentStatus = isTerminalSolanaPaymentStatus;
module.exports.isValidSolanaPaymentStatus = isValidSolanaPaymentStatus;
module.exports.SOLANA_PAYMENT_STATUSES = SOLANA_PAYMENT_STATUSES;
module.exports.SOLANA_PAYMENT_STATUS_VALUES = SOLANA_PAYMENT_STATUS_VALUES;
module.exports.SOLANA_PAYMENT_STATUS_LABELS = SOLANA_PAYMENT_STATUS_LABELS;
module.exports.SUCCESSFUL_SOLANA_PAYMENT_STATUSES = SUCCESSFUL_SOLANA_PAYMENT_STATUSES;
module.exports.TERMINAL_SOLANA_PAYMENT_STATUSES = TERMINAL_SOLANA_PAYMENT_STATUSES;
module.exports.DEFAULT_SOLANA_PAYMENT_EXPIRY_MINUTES = DEFAULT_SOLANA_PAYMENT_EXPIRY_MINUTES;
