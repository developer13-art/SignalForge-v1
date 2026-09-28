/**
 * Subscription Statuses
 *
 * Defines the lifecycle states of a subscription in the SignalForge
 * platform. Subscriptions are never a simple boolean flag; the platform
 * distinguishes "can access the platform" from "can execute trades."
 *
 * @module @signalforge/shared/constants/subscription-statuses
 */const SUBSCRIPTION_STATUSES = Object.freeze({
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
});const SUBSCRIPTION_STATUS_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_STATUSES),
);const SUBSCRIPTION_STATUS_LABELS = Object.freeze({
  [SUBSCRIPTION_STATUSES.TRIAL]: 'Trial',
  [SUBSCRIPTION_STATUSES.ACTIVE]: 'Active',
  [SUBSCRIPTION_STATUSES.PAST_DUE]: 'Past Due',
  [SUBSCRIPTION_STATUSES.GRACE_PERIOD]: 'Grace Period',
  [SUBSCRIPTION_STATUSES.EXPIRED]: 'Expired',
  [SUBSCRIPTION_STATUSES.CANCELLED]: 'Cancelled',
  [SUBSCRIPTION_STATUSES.SUSPENDED]: 'Suspended',
});const SUBSCRIPTION_STATUS_DESCRIPTIONS = Object.freeze({
  [SUBSCRIPTION_STATUSES.TRIAL]: 'User is in trial period with full feature access.',
  [SUBSCRIPTION_STATUSES.ACTIVE]: 'Subscription is active and paid.',
  [SUBSCRIPTION_STATUSES.PAST_DUE]: 'Renewal payment has failed. Retrying.',
  [SUBSCRIPTION_STATUSES.GRACE_PERIOD]: 'Subscription has entered the grace period after payment failure.',
  [SUBSCRIPTION_STATUSES.EXPIRED]: 'Subscription has expired. Trading automation is disabled.',
  [SUBSCRIPTION_STATUSES.CANCELLED]: 'Subscription was cancelled by the user.',
  [SUBSCRIPTION_STATUSES.SUSPENDED]: 'Subscription was suspended by an administrator.',
});const TRADING_ENABLED_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
]);const PLATFORM_ACCESS_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.PAST_DUE,
  SUBSCRIPTION_STATUSES.GRACE_PERIOD,
  SUBSCRIPTION_STATUSES.EXPIRED,
]);function canExecuteTrades(status) {
  return TRADING_ENABLED_STATUSES.includes(status);
}function canAccessPlatform(status) {
  return PLATFORM_ACCESS_STATUSES.includes(status);
}function isValidSubscriptionStatus(status) {
  return SUBSCRIPTION_STATUS_VALUES.includes(status);
}

module.exports.canExecuteTrades = canExecuteTrades;
module.exports.canAccessPlatform = canAccessPlatform;
module.exports.isValidSubscriptionStatus = isValidSubscriptionStatus;
module.exports.SUBSCRIPTION_STATUSES = SUBSCRIPTION_STATUSES;
module.exports.SUBSCRIPTION_STATUS_VALUES = SUBSCRIPTION_STATUS_VALUES;
module.exports.SUBSCRIPTION_STATUS_LABELS = SUBSCRIPTION_STATUS_LABELS;
module.exports.SUBSCRIPTION_STATUS_DESCRIPTIONS = SUBSCRIPTION_STATUS_DESCRIPTIONS;
module.exports.TRADING_ENABLED_STATUSES = TRADING_ENABLED_STATUSES;
module.exports.PLATFORM_ACCESS_STATUSES = PLATFORM_ACCESS_STATUSES;
