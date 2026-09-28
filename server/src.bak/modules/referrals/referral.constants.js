/**
 * Referrals Module Constants
 *
 * @module signalforge/server/modules/referrals/constants
 */

export const REFERRAL_EVENTS = Object.freeze({
  CODE_CREATED: 'referral.code.created',
  CODE_REGENERATED: 'referral.code.regenerated',
  RELATIONSHIP_CREATED: 'referral.relationship.created',
  RELATIONSHIP_SUSPENDED: 'referral.relationship.suspended',
  RELATIONSHIP_TERMINATED: 'referral.relationship.terminated',
  REWARD_CALCULATED: 'referral.reward.calculated',
  REWARD_APPROVED: 'referral.reward.approved',
  REWARD_REJECTED: 'referral.reward.rejected',
  REWARD_SETTLED: 'referral.reward.settled',
  REWARD_REVERSED: 'referral.reward.reversed',
  REWARD_UNDER_REVIEW: 'referral.reward.under_review',
  SETTLEMENT_STARTED: 'referral.settlement.started',
  SETTLEMENT_COMPLETED: 'referral.settlement.completed',
  SETTLEMENT_FAILED: 'referral.settlement.failed',
  WALLET_CREDITED: 'referral.wallet.credited',
  WALLET_DEBITED: 'referral.wallet.debited',
  LEDGER_ENTRY_CREATED: 'referral.ledger.entry.created',
  FRAUD_FLAG_RAISED: 'referral.fraud.flag.raised',
  FRAUD_REVIEW_ASSIGNED: 'referral.fraud.review.assigned',
  FRAUD_REVIEW_RESOLVED: 'referral.fraud.review.resolved',
});

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

export const REFERRAL_LEDGER_DIRECTIONS = Object.freeze({
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
});

export const REFERRAL_LEDGER_DIRECTION_VALUES = Object.freeze(
  Object.values(REFERRAL_LEDGER_DIRECTIONS),
);

export const FRAUD_FLAG_TYPES = Object.freeze({
  SELF_REFERRAL: 'SELF_REFERRAL',
  DUPLICATE_ACCOUNT: 'DUPLICATE_ACCOUNT',
  ABNORMAL_ACTIVITY: 'ABNORMAL_ACTIVITY',
  FAKE_VOLUME: 'FAKE_VOLUME',
  REVERSAL_PATTERN: 'REVERSAL_PATTERN',
  RAPID_SETTLEMENT: 'RAPID_SETTLEMENT',
});

export const FRAUD_FLAG_TYPE_VALUES = Object.freeze(Object.values(FRAUD_FLAG_TYPES));

export const FRAUD_FLAG_SEVERITIES = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

export const FRAUD_FLAG_SEVERITY_VALUES = Object.freeze(
  Object.values(FRAUD_FLAG_SEVERITIES),
);

export const DEFAULT_REFERRAL_REWARD_RATE = 0.001;
export const DEFAULT_REFERRAL_SETTLEMENT_CYCLE = 'monthly';
export const DEFAULT_REFERRAL_MIN_PAYOUT = 10;
export const DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED = 100000;
export const DEFAULT_REFERRAL_CODE_LENGTH = 8;
export const DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD = 0.5;
export const DEFAULT_REVIEW_REQUIRED_SCORE = 0.7;

export function isValidRelationshipStatus(status) {
  return REFERRAL_RELATIONSHIP_STATUS_VALUES.includes(status);
}

export function isValidRewardStatus(status) {
  return REFERRAL_REWARD_STATUS_VALUES.includes(status);
}

export function isValidSettlementStatus(status) {
  return REFERRAL_SETTLEMENT_STATUS_VALUES.includes(status);
}

export function isValidWalletTransactionType(type) {
  return REFERRAL_WALLET_TRANSACTION_TYPE_VALUES.includes(type);
}

export function isValidLedgerDirection(direction) {
  return REFERRAL_LEDGER_DIRECTION_VALUES.includes(direction);
}

export function isValidFraudFlagType(type) {
  return FRAUD_FLAG_TYPE_VALUES.includes(type);
}

export function isValidFraudSeverity(severity) {
  return FRAUD_FLAG_SEVERITY_VALUES.includes(severity);
}

export function isTerminalSettlementStatus(status) {
  return [
    REFERRAL_SETTLEMENT_STATUSES.COMPLETED,
    REFERRAL_SETTLEMENT_STATUSES.FAILED,
    REFERRAL_SETTLEMENT_STATUSES.CANCELLED,
  ].includes(status);
}

export function isSettledRewardStatus(status) {
  return [
    REFERRAL_REWARD_STATUSES.SETTLED,
    REFERRAL_REWARD_STATUSES.REJECTED,
    REFERRAL_REWARD_STATUSES.REVERSED,
  ].includes(status);
}