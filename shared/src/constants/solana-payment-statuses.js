/**
 * Solana Payment Statuses
 *
 * Defines the lifecycle states of a Solana payment in SignalForge.
 *
 * @module @signalforge/shared/constants/solana-payment-statuses
 */

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

export const SOLANA_PAYMENT_STATUS_LABELS = Object.freeze({
  [SOLANA_PAYMENT_STATUSES.AWAITING_SIGNATURE]: 'Awaiting Signature',
  [SOLANA_PAYMENT_STATUSES.SUBMITTED]: 'Submitted',
  [SOLANA_PAYMENT_STATUSES.CONFIRMING]: 'Confirming',
  [SOLANA_PAYMENT_STATUSES.CONFIRMED]: 'Confirmed',
  [SOLANA_PAYMENT_STATUSES.FINALIZED]: 'Finalized',
  [SOLANA_PAYMENT_STATUSES.FAILED]: 'Failed',
  [SOLANA_PAYMENT_STATUSES.EXPIRED]: 'Expired',
  [SOLANA_PAYMENT_STATUSES.REFUNDED]: 'Refunded',
});

export const SUCCESSFUL_SOLANA_PAYMENT_STATUSES = Object.freeze([
  SOLANA_PAYMENT_STATUSES.CONFIRMED,
  SOLANA_PAYMENT_STATUSES.FINALIZED,
]);

export const TERMINAL_SOLANA_PAYMENT_STATUSES = Object.freeze([
  SOLANA_PAYMENT_STATUSES.CONFIRMED,
  SOLANA_PAYMENT_STATUSES.FINALIZED,
  SOLANA_PAYMENT_STATUSES.FAILED,
  SOLANA_PAYMENT_STATUSES.EXPIRED,
  SOLANA_PAYMENT_STATUSES.REFUNDED,
]);

export const DEFAULT_SOLANA_PAYMENT_EXPIRY_MINUTES = 30;

export function isSuccessfulSolanaPayment(status) {
  return SUCCESSFUL_SOLANA_PAYMENT_STATUSES.includes(status);
}

export function isTerminalSolanaPaymentStatus(status) {
  return TERMINAL_SOLANA_PAYMENT_STATUSES.includes(status);
}

export function isValidSolanaPaymentStatus(status) {
  return SOLANA_PAYMENT_STATUS_VALUES.includes(status);
}