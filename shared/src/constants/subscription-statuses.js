/**
 * Subscription Statuses
 *
 * Defines the lifecycle states of a subscription in the SignalForge
 * platform. Subscriptions are never a simple boolean flag; the platform
 * distinguishes "can access the platform" from "can execute trades."
 *
 * @module @signalforge/shared/constants/subscription-statuses
 */

export const SUBSCRIPTION_STATUSES = Object.freeze({
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
});

export const SUBSCRIPTION_STATUS_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_STATUSES),
);

export const SUBSCRIPTION_STATUS_LABELS = Object.freeze({
  [SUBSCRIPTION_STATUSES.TRIAL]: 'Trial',
  [SUBSCRIPTION_STATUSES.ACTIVE]: 'Active',
  [SUBSCRIPTION_STATUSES.PAST_DUE]: 'Past Due',
  [SUBSCRIPTION_STATUSES.GRACE_PERIOD]: 'Grace Period',
  [SUBSCRIPTION_STATUSES.EXPIRED]: 'Expired',
  [SUBSCRIPTION_STATUSES.CANCELLED]: 'Cancelled',
  [SUBSCRIPTION_STATUSES.SUSPENDED]: 'Suspended',
});

export const SUBSCRIPTION_STATUS_DESCRIPTIONS = Object.freeze({
  [SUBSCRIPTION_STATUSES.TRIAL]: 'User is in trial period with full feature access.',
  [SUBSCRIPTION_STATUSES.ACTIVE]: 'Subscription is active and paid.',
  [SUBSCRIPTION_STATUSES.PAST_DUE]: 'Renewal payment has failed. Retrying.',
  [SUBSCRIPTION_STATUSES.GRACE_PERIOD]: 'Subscription has entered the grace period after payment failure.',
  [SUBSCRIPTION_STATUSES.EXPIRED]: 'Subscription has expired. Trading automation is disabled.',
  [SUBSCRIPTION_STATUSES.CANCELLED]: 'Subscription was cancelled by the user.',
  [SUBSCRIPTION_STATUSES.SUSPENDED]: 'Subscription was suspended by an administrator.',
});

export const TRADING_ENABLED_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
]);

export const PLATFORM_ACCESS_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.PAST_DUE,
  SUBSCRIPTION_STATUSES.GRACE_PERIOD,
  SUBSCRIPTION_STATUSES.EXPIRED,
]);

export function canExecuteTrades(status) {
  return TRADING_ENABLED_STATUSES.includes(status);
}

export function canAccessPlatform(status) {
  return PLATFORM_ACCESS_STATUSES.includes(status);
}

export function isValidSubscriptionStatus(status) {
  return SUBSCRIPTION_STATUS_VALUES.includes(status);
}