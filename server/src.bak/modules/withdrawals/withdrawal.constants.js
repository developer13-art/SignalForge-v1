/**
 * Withdrawals Module Constants
 *
 * @module signalforge/server/modules/withdrawals/constants
 */

export const WITHDRAWAL_EVENTS = Object.freeze({
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

export const WITHDRAWAL_METHOD_TYPES = Object.freeze({
  BANK_TRANSFER: 'BANK_TRANSFER',
  CRYPTO: 'CRYPTO',
  PAYSTACK: 'PAYSTACK',
  STRIPE: 'STRIPE',
});

export const WITHDRAWAL_METHOD_TYPE_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_METHOD_TYPES),
);

export const WITHDRAWAL_ACCOUNT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  DISABLED: 'DISABLED',
});

export const WITHDRAWAL_ACCOUNT_STATUS_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_ACCOUNT_STATUSES),
);

export const WITHDRAWAL_PURPOSES = Object.freeze({
  REFERRAL_EARNINGS: 'REFERRAL_EARNINGS',
  PROVIDER_REVENUE: 'PROVIDER_REVENUE',
  WALLET_BALANCE: 'WALLET_BALANCE',
  AFFILIATE_COMMISSION: 'AFFILIATE_COMMISSION',
  IB_COMMISSION: 'IB_COMMISSION',
});

export const WITHDRAWAL_PURPOSE_VALUES = Object.freeze(
  Object.values(WITHDRAWAL_PURPOSES),
);

export const WITHDRAWAL_TERMINAL_STATUSES = Object.freeze([
  WITHDRAWAL_STATUSES.COMPLETED,
  WITHDRAWAL_STATUSES.REJECTED,
  WITHDRAWAL_STATUSES.CANCELLED,
  WITHDRAWAL_STATUSES.FAILED,
]);

export const WITHDRAWAL_ACTIVE_STATUSES = Object.freeze([
  WITHDRAWAL_STATUSES.PENDING,
  WITHDRAWAL_STATUSES.UNDER_REVIEW,
  WITHDRAWAL_STATUSES.APPROVED,
  WITHDRAWAL_STATUSES.PROCESSING,
]);

export const DEFAULT_MIN_WITHDRAWAL_USD = 10;
export const DEFAULT_MAX_WITHDRAWAL_USD = 100000;
export const DEFAULT_MANUAL_REVIEW_THRESHOLD_USD = 1000;
export const DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD = 10000;
export const DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD = 100000;
export const DEFAULT_AUTO_APPROVE_THRESHOLD_USD = 500;

export function isValidWithdrawalStatus(status) {
  return WITHDRAWAL_STATUS_VALUES.includes(status);
}

export function isValidWithdrawalMethodType(type) {
  return WITHDRAWAL_METHOD_TYPE_VALUES.includes(type);
}

export function isValidWithdrawalPurpose(purpose) {
  return WITHDRAWAL_PURPOSE_VALUES.includes(purpose);
}

export function isValidWithdrawalAccountStatus(status) {
  return WITHDRAWAL_ACCOUNT_STATUS_VALUES.includes(status);
}

export function isTerminalWithdrawalStatus(status) {
  return WITHDRAWAL_TERMINAL_STATUSES.includes(status);
}

export function isActiveWithdrawalStatus(status) {
  return WITHDRAWAL_ACTIVE_STATUSES.includes(status);
}

export function requiresManualReview(amountUsd, threshold = DEFAULT_MANUAL_REVIEW_THRESHOLD_USD) {
  return Number(amountUsd) >= threshold;
}