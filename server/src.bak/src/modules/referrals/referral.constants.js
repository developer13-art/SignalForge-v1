/**
 * Referrals Module Constants
 *
 * @module signalforge/server/modules/referrals/constants
 */
const REFERRAL_EVENTS = Object.freeze({
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
const REFERRAL_RELATIONSHIP_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
});
const REFERRAL_RELATIONSHIP_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_RELATIONSHIP_STATUSES),
);
const REFERRAL_REWARD_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CALCULATED: 'CALCULATED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  SETTLED: 'SETTLED',
  REJECTED: 'REJECTED',
  REVERSED: 'REVERSED',
});
const REFERRAL_REWARD_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_REWARD_STATUSES),
);
const REFERRAL_SETTLEMENT_STATUSES = Object.freeze({
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
const REFERRAL_SETTLEMENT_STATUS_VALUES = Object.freeze(
  Object.values(REFERRAL_SETTLEMENT_STATUSES),
);
const REFERRAL_WALLET_TRANSACTION_TYPES = Object.freeze({
  REWARD_CREDIT: 'REWARD_CREDIT',
  WITHDRAWAL_DEBIT: 'WITHDRAWAL_DEBIT',
  ADJUSTMENT_CREDIT: 'ADJUSTMENT_CREDIT',
  ADJUSTMENT_DEBIT: 'ADJUSTMENT_DEBIT',
  REVERSAL_DEBIT: 'REVERSAL_DEBIT',
  REVERSAL_CREDIT: 'REVERSAL_CREDIT',
});
const REFERRAL_WALLET_TRANSACTION_TYPE_VALUES = Object.freeze(
  Object.values(REFERRAL_WALLET_TRANSACTION_TYPES),
);
const REFERRAL_LEDGER_DIRECTIONS = Object.freeze({
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
});
const REFERRAL_LEDGER_DIRECTION_VALUES = Object.freeze(
  Object.values(REFERRAL_LEDGER_DIRECTIONS),
);
const FRAUD_FLAG_TYPES = Object.freeze({
  SELF_REFERRAL: 'SELF_REFERRAL',
  DUPLICATE_ACCOUNT: 'DUPLICATE_ACCOUNT',
  ABNORMAL_ACTIVITY: 'ABNORMAL_ACTIVITY',
  FAKE_VOLUME: 'FAKE_VOLUME',
  REVERSAL_PATTERN: 'REVERSAL_PATTERN',
  RAPID_SETTLEMENT: 'RAPID_SETTLEMENT',
});
const FRAUD_FLAG_TYPE_VALUES = Object.freeze(Object.values(FRAUD_FLAG_TYPES));
const FRAUD_FLAG_SEVERITIES = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});
const FRAUD_FLAG_SEVERITY_VALUES = Object.freeze(
  Object.values(FRAUD_FLAG_SEVERITIES),
);
const DEFAULT_REFERRAL_REWARD_RATE = 0.001;
const DEFAULT_REFERRAL_SETTLEMENT_CYCLE = 'monthly';
const DEFAULT_REFERRAL_MIN_PAYOUT = 10;
const DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED = 100000;
const DEFAULT_REFERRAL_CODE_LENGTH = 8;
const DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD = 0.5;
const DEFAULT_REVIEW_REQUIRED_SCORE = 0.7;
function isValidRelationshipStatus(status) {
  return REFERRAL_RELATIONSHIP_STATUS_VALUES.includes(status);
}
function isValidRewardStatus(status) {
  return REFERRAL_REWARD_STATUS_VALUES.includes(status);
}
function isValidSettlementStatus(status) {
  return REFERRAL_SETTLEMENT_STATUS_VALUES.includes(status);
}
function isValidWalletTransactionType(type) {
  return REFERRAL_WALLET_TRANSACTION_TYPE_VALUES.includes(type);
}
function isValidLedgerDirection(direction) {
  return REFERRAL_LEDGER_DIRECTION_VALUES.includes(direction);
}
function isValidFraudFlagType(type) {
  return FRAUD_FLAG_TYPE_VALUES.includes(type);
}
function isValidFraudSeverity(severity) {
  return FRAUD_FLAG_SEVERITY_VALUES.includes(severity);
}
function isTerminalSettlementStatus(status) {
  return [
    REFERRAL_SETTLEMENT_STATUSES.COMPLETED,
    REFERRAL_SETTLEMENT_STATUSES.FAILED,
    REFERRAL_SETTLEMENT_STATUSES.CANCELLED,
  ].includes(status);
}
function isSettledRewardStatus(status) {
  return [
    REFERRAL_REWARD_STATUSES.SETTLED,
    REFERRAL_REWARD_STATUSES.REJECTED,
    REFERRAL_REWARD_STATUSES.REVERSED,
  ].includes(status);
}
module.exports.REFERRAL_EVENTS = REFERRAL_EVENTS;
module.exports.REFERRAL_RELATIONSHIP_STATUSES = REFERRAL_RELATIONSHIP_STATUSES;
module.exports.REFERRAL_RELATIONSHIP_STATUS_VALUES = REFERRAL_RELATIONSHIP_STATUS_VALUES;
module.exports.REFERRAL_REWARD_STATUSES = REFERRAL_REWARD_STATUSES;
module.exports.REFERRAL_REWARD_STATUS_VALUES = REFERRAL_REWARD_STATUS_VALUES;
module.exports.REFERRAL_SETTLEMENT_STATUSES = REFERRAL_SETTLEMENT_STATUSES;
module.exports.REFERRAL_SETTLEMENT_STATUS_VALUES = REFERRAL_SETTLEMENT_STATUS_VALUES;
module.exports.REFERRAL_WALLET_TRANSACTION_TYPES = REFERRAL_WALLET_TRANSACTION_TYPES;
module.exports.REFERRAL_WALLET_TRANSACTION_TYPE_VALUES = REFERRAL_WALLET_TRANSACTION_TYPE_VALUES;
module.exports.REFERRAL_LEDGER_DIRECTIONS = REFERRAL_LEDGER_DIRECTIONS;
module.exports.REFERRAL_LEDGER_DIRECTION_VALUES = REFERRAL_LEDGER_DIRECTION_VALUES;
module.exports.FRAUD_FLAG_TYPES = FRAUD_FLAG_TYPES;
module.exports.FRAUD_FLAG_TYPE_VALUES = FRAUD_FLAG_TYPE_VALUES;
module.exports.FRAUD_FLAG_SEVERITIES = FRAUD_FLAG_SEVERITIES;
module.exports.FRAUD_FLAG_SEVERITY_VALUES = FRAUD_FLAG_SEVERITY_VALUES;
module.exports.DEFAULT_REFERRAL_REWARD_RATE = DEFAULT_REFERRAL_REWARD_RATE;
module.exports.DEFAULT_REFERRAL_SETTLEMENT_CYCLE = DEFAULT_REFERRAL_SETTLEMENT_CYCLE;
module.exports.DEFAULT_REFERRAL_MIN_PAYOUT = DEFAULT_REFERRAL_MIN_PAYOUT;
module.exports.DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED = DEFAULT_REFERRAL_MAX_REWARD_PER_REFERRED;
module.exports.DEFAULT_REFERRAL_CODE_LENGTH = DEFAULT_REFERRAL_CODE_LENGTH;
module.exports.DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD = DEFAULT_REFERRAL_FRAUD_SCORE_THRESHOLD;
module.exports.DEFAULT_REVIEW_REQUIRED_SCORE = DEFAULT_REVIEW_REQUIRED_SCORE;
module.exports.isValidRelationshipStatus = isValidRelationshipStatus;
module.exports.isValidRewardStatus = isValidRewardStatus;
module.exports.isValidSettlementStatus = isValidSettlementStatus;
module.exports.isValidWalletTransactionType = isValidWalletTransactionType;
module.exports.isValidLedgerDirection = isValidLedgerDirection;
module.exports.isValidFraudFlagType = isValidFraudFlagType;
module.exports.isValidFraudSeverity = isValidFraudSeverity;
module.exports.isTerminalSettlementStatus = isTerminalSettlementStatus;
module.exports.isSettledRewardStatus = isSettledRewardStatus;
