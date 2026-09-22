/**
 * Referral Statuses
 *
 * Defines the lifecycle states of referral rewards and relationships.
 *
 * @module @signalforge/shared/constants/referral-statuses
 */

export const REFERRAL_RELATIONSHIP_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
});

export const REFERRAL_RELATIONSHIP_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_RELATIONSHIP_STATUSES),
);

export const REFERRAL_REWARD_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CALCULATED: 'CALCULATED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  SETTLED: 'SETTLED',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});

export const REFERRAL_REWARD_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_REWARD_STATUSES),
);

export const REFERRAL_REWARD_STATUS_LABELS = Object.freeze({
  [REFERRAL_REWARD_STATUSES.PENDING]: 'Pending',
  [REFERRAL_REWARD_STATUSES.CALCULATED]: 'Calculated',
  [REFERRAL_REWARD_STATUSES.UNDER_REVIEW]: 'Under Review',
  [REFERRAL_REWARD_STATUSES.APPROVED]: 'Approved',
  [REFERRAL_REWARD_STATUSES.SETTLED]: 'Settled',
  [REFERRAL_REWARD_STATUSES.REJECTED]: 'Rejected',
  [REFERRAL_REWARD_STATUSES.REVERSED]: 'Reversed',
});

export const REFERRAL_WALLET_TRANSACTION_TYPES = Object.freeze({
  REWARD_CREDIT: 'REWARD_CREDIT',
  WITHDRAWAL_DEBIT: 'WITHDRAWAL_DEBIT',
  ADJUSTMENT_CREDIT: 'ADJUSTMENT_CREDIT',
  ADJUSTMENT_DEBIT: 'ADJUSTMENT_DEBIT',
  REVERSAL_DEBIT: 'REVERSAL_DEBIT',
  REVERSAL_CREDIT: 'REVERSAL_CREDIT',
});

export const REFERRAL_WALLET_TRANSACTION_TYPE_VALUES = Object.freeze(
  Object.values(REFERRAL_WALLET_TRANSACTION_TYPES),
);

export const DEFAULT_REFERRAL_REWARD_RATE = 0.001;

export function isValidReferralRewardStatus(status) {
  return REFERRAL_REWARD_STATUS_VALUES.includes(status);
}

export function isValidReferralRelationshipStatus(status) {
  return REFERRAL_RELATIONSHIP_STATUS_VALUES.includes(status);
}