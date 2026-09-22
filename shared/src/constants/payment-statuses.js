/**
 * Payment Statuses
 *
 * Defines the lifecycle states of a payment in the SignalForge platform.
 *
 * @module @signalforge/shared/constants/payment-statuses
 */

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  REQUIRES_ACTION: 'REQUIRES_ACTION',
  CONFIRMED: 'CONFIRMED',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED',
});

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUSES));

export const PAYMENT_STATUS_LABELS = Object.freeze({
  [PAYMENT_STATUSES.PENDING]: 'Pending',
  [PAYMENT_STATUSES.PROCESSING]: 'Processing',
  [PAYMENT_STATUSES.REQUIRES_ACTION]: 'Requires Action',
  [PAYMENT_STATUSES.CONFIRMED]: 'Confirmed',
  [PAYMENT_STATUSES.SUCCEEDED]: 'Succeeded',
  [PAYMENT_STATUSES.FAILED]: 'Failed',
  [PAYMENT_STATUSES.CANCELLED]: 'Cancelled',
  [PAYMENT_STATUSES.REFUNDED]: 'Refunded',
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: 'Partially Refunded',
  [PAYMENT_STATUSES.DISPUTED]: 'Disputed',
});

export const FINAL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
  PAYMENT_STATUSES.REFUNDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
]);

export const SUCCESSFUL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.CONFIRMED,
]);

export function isSuccessfulPayment(status) {
  return SUCCESSFUL_PAYMENT_STATUSES.includes(status);
}

export function isFinalPayment(status) {
  return FINAL_PAYMENT_STATUSES.includes(status);
}

export function isValidPaymentStatus(status) {
  return PAYMENT_STATUS_VALUES.includes(status);
}