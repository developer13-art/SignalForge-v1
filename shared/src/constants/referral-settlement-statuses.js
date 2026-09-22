/**
 * Referral Settlement Statuses
 *
 * Defines the lifecycle states of a monthly referral settlement run.
 *
 * @module @signalforge/shared/constants/referral-settlement-statuses
 */

export const REFERRAL_SETTLEMENT_STATUSES = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  CALCULATING: 'CALCULATING',
  FRAUD_CHECK: 'FRAUD_CHECK',
  UNDER_REVIEW: 'UNDER_REVIEW',
  FINALIZING: 'FINALIZING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

export const REFERRAL_SETTLEMENT_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_SETTLEMENT_STATUSES),
);

export const REFERRAL_SETTLEMENT_STATUS_LABELS = Object.freeze({
  [REFERRAL_SETTLEMENT_STATUSES.SCHEDULED]: 'Scheduled',
  [REFERRAL_SETTLEMENT_STATUSES.IN_PROGRESS]: 'In Progress',
  [REFERRAL_SETTLEMENT_STATUSES.CALCULATING]: 'Calculating',
  [REFERRAL_SETTLEMENT_STATUSES.FRAUD_CHECK]: 'Fraud Check',
  [REFERRAL_SETTLEMENT_STATUSES.UNDER_REVIEW]: 'Under Review',
  [REFERRAL_SETTLEMENT_STATUSES.FINALIZING]: 'Finalizing',
  [REFERRAL_SETTLEMENT_STATUSES.COMPLETED]: 'Completed',
  [REFERRAL_SETTLEMENT_STATUSES.FAILED]: 'Failed',
  [REFERRAL_SETTLEMENT_STATUSES.CANCELLED]: 'Cancelled',
});

export const TERMINAL_SETTLEMENT_STATUSES = Object.freeze([
  REFERRAL_SETTLEMENT_STATUSES.COMPLETED,
  REFERRAL_SETTLEMENT_STATUSES.FAILED,
  REFERRAL_SETTLEMENT_STATUSES.CANCELLED,
]);

export function isTerminalSettlementStatus(status) {
  return TERMINAL_SETTLEMENT_STATUSES.includes(status);
}

export function isValidSettlementStatus(status) {
  return REFERRAL_SETTLEMENT_STATUS_VALUES.includes(status);
}