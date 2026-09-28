/**
 * Withdrawals Module Constants
 *
 * @module signalforge/server/modules/withdrawals/constants
 */
const WITHDRAWAL_EVENTS = Object.freeze({
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_UNDER_REVIEW: 'withdrawal.under_review',
  WITHDRAWAL_APPROVED: 'withdrawal.approved',
  WITHDRAWAL_REJECTED: 'withdrawal.rejected',
  WITHDRAWAL_PROCESSING: 'withdrawal.processing',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  WITHDRAWAL_FAILED: 'withdrawal.failed',
  WITHDRAWAL_CANCELLED: 'withdrawal.cancelled',
  WITHDRAWAL_METHOD_ADDED: 'withdrawal.method.added',
  WITHDRAWAL_METHOD_REMOVED: 'withdrawal.method.removed',
  WITHDRAWAL_METHOD_VERIFIED: 'withdrawal.method.verified',
  WITHDRAWAL_LIMIT_EXCEEDED: 'withdrawal.limit.exceeded',
});
const WITHDRAWAL_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
});
const WITHDRAWAL_STATUS_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_STATUSES),
);
const WITHDRAWAL_METHOD_TYPES = Object.freeze({
  BANK_TRANSFER: 'BANK_TRANSFER',
  CRYPTO: 'CRYPTO',
  PAYSTACK: 'PAYSTACK',
  STRIPE: 'STRIPE',
});
const WITHDRAWAL_METHOD_TYPE_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_METHOD_TYPES),
);
const WITHDRAWAL_ACCOUNT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  DISABLED: 'DISABLED',
});
const WITHDRAWAL_ACCOUNT_STATUS_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_ACCOUNT_STATUSES),
);
const WITHDRAWAL_PURPOSES = Object.freeze({
  REFERRAL_EARNINGS: 'REFERRAL_EARNINGS',
  PROVIDER_REVENUE: 'PROVIDER_REVENUE',
  WALLET_BALANCE: 'WALLET_BALANCE',
  AFFILIATE_COMMISSION: 'AFFILIATE_COMMISSION',
  IB_COMMISSION: 'IB_COMMISSION',
});
const WITHDRAWAL_PURPOSE_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_PURPOSES),
);
const WITHDRAWAL_TERMINAL_STATUSES = Object.freeze([
  WITHDRAWAL_STATUSES.COMPLETED,
  WITHDRAWAL_STATUSES.REJECTED,
  WITHDRAWAL_STATUSES.CANCELLED,
  WITHDRAWAL_STATUSES.FAILED,
]);
const WITHDRAWAL_ACTIVE_STATUSES = Object.freeze([
  WITHDRAWAL_STATUSES.PENDING,
  WITHDRAWAL_STATUSES.UNDER_REVIEW,
  WITHDRAWAL_STATUSES.APPROVED,
  WITHDRAWAL_STATUSES.PROCESSING,
]);
const DEFAULT_MIN_WITHDRAWAL_USD = 10;
const DEFAULT_MAX_WITHDRAWAL_USD = 100000;
const DEFAULT_MANUAL_REVIEW_THRESHOLD_USD = 1000;
const DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD = 10000;
const DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD = 100000;
const DEFAULT_AUTO_APPROVE_THRESHOLD_USD = 500;
function isValidWithdrawalStatus(status) {
  return WITHDRAWAL_STATUS_VALUES.includes(status);
}
function isValidWithdrawalMethodType(type) {
  return WITHDRAWAL_METHOD_TYPE_VALUES.includes(type);
}
function isValidWithdrawalPurpose(purpose) {
  return WITHDRAWAL_PURPOSE_VALUES.includes(purpose);
}
function isValidWithdrawalAccountStatus(status) {
  return WITHDRAWAL_ACCOUNT_STATUS_VALUES.includes(status);
}
function isTerminalWithdrawalStatus(status) {
  return WITHDRAWAL_TERMINAL_STATUSES.includes(status);
}
function isActiveWithdrawalStatus(status) {
  return WITHDRAWAL_ACTIVE_STATUSES.includes(status);
}
function requiresManualReview(amountUsd, threshold = DEFAULT_MANUAL_REVIEW_THRESHOLD_USD) {
  return Number(amountUsd) >= threshold;
}
module.exports.WITHDRAWAL_EVENTS = WITHDRAWAL_EVENTS;
module.exports.WITHDRAWAL_STATUSES = WITHDRAWAL_STATUSES;
module.exports.WITHDRAWAL_STATUS_VALUES = WITHDRAWAL_STATUS_VALUES;
module.exports.WITHDRAWAL_METHOD_TYPES = WITHDRAWAL_METHOD_TYPES;
module.exports.WITHDRAWAL_METHOD_TYPE_VALUES = WITHDRAWAL_METHOD_TYPE_VALUES;
module.exports.WITHDRAWAL_ACCOUNT_STATUSES = WITHDRAWAL_ACCOUNT_STATUSES;
module.exports.WITHDRAWAL_ACCOUNT_STATUS_VALUES = WITHDRAWAL_ACCOUNT_STATUS_VALUES;
module.exports.WITHDRAWAL_PURPOSES = WITHDRAWAL_PURPOSES;
module.exports.WITHDRAWAL_PURPOSE_VALUES = WITHDRAWAL_PURPOSE_VALUES;
module.exports.WITHDRAWAL_TERMINAL_STATUSES = WITHDRAWAL_TERMINAL_STATUSES;
module.exports.WITHDRAWAL_ACTIVE_STATUSES = WITHDRAWAL_ACTIVE_STATUSES;
module.exports.DEFAULT_MIN_WITHDRAWAL_USD = DEFAULT_MIN_WITHDRAWAL_USD;
module.exports.DEFAULT_MAX_WITHDRAWAL_USD = DEFAULT_MAX_WITHDRAWAL_USD;
module.exports.DEFAULT_MANUAL_REVIEW_THRESHOLD_USD = DEFAULT_MANUAL_REVIEW_THRESHOLD_USD;
module.exports.DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD = DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD;
module.exports.DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD = DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD;
module.exports.DEFAULT_AUTO_APPROVE_THRESHOLD_USD = DEFAULT_AUTO_APPROVE_THRESHOLD_USD;
module.exports.isValidWithdrawalStatus = isValidWithdrawalStatus;
module.exports.isValidWithdrawalMethodType = isValidWithdrawalMethodType;
module.exports.isValidWithdrawalPurpose = isValidWithdrawalPurpose;
module.exports.isValidWithdrawalAccountStatus = isValidWithdrawalAccountStatus;
module.exports.isTerminalWithdrawalStatus = isTerminalWithdrawalStatus;
module.exports.isActiveWithdrawalStatus = isActiveWithdrawalStatus;
module.exports.requiresManualReview = requiresManualReview;
