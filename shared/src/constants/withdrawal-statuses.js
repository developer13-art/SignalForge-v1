/**
 * Withdrawal Statuses
 *
 * Defines the lifecycle states of a withdrawal request in the
 * SignalForge platform. Withdrawals require KYC verification.
 *
 * @module @signalforge/shared/constants/withdrawal-statuses
 */

export const WITHDRAWAL_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
});

export const WITHDRAWAL_STATUS_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_STATUSES),
);

export const WITHDRAWAL_STATUS_LABELS = Object.freeze({
  [WITHDRAWAL_STATUSES.PENDING]: 'Pending',
  [WITHDRAWAL_STATUSES.UNDER_REVIEW]: 'Under Review',
  [WITHDRAWAL_STATUSES.APPROVED]: 'Approved',
  [WITHDRAWAL_STATUSES.PROCESSING]: 'Processing',
  [WITHDRAWAL_STATUSES.COMPLETED]: 'Completed',
  [WITHDRAWAL_STATUSES.REJECTED]: 'Rejected',
  [WITHDRAWAL_STATUSES.CANCELLED]: 'Cancelled',
  [WITHDRAWAL_STATUSES.FAILED]: 'Failed',
});

export const WITHDRAWAL_TERMINAL_STATUSES = Object.freeze([
  WITHDRAWAL_STATUSES.COMPLETED,
  WITHDRAWAL_STATUSES.REJECTED,
  WITHDRAWAL_STATUSES.CANCELLED,
  WITHDRAWAL_STATUSES.FAILED,
]);

export function isTerminalWithdrawalStatus(status) {
  return WITHDRAWAL_TERMINAL_STATUSES.includes(status);
}

export function isValidWithdrawalStatus(status) {
  return WITHDRAWAL_STATUS_VALUES.includes(status);
}