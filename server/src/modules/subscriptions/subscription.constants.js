/**
 * Subscriptions Module Constants
 *
 * @module signalforge/server/modules/subscriptions/constants
 */

export const SUBSCRIPTION_EVENTS = Object.freeze({
  PLAN_CREATED: 'subscription.plan.created',
  PLAN_UPDATED: 'subscription.plan.updated',
  PLAN_DELETED: 'subscription.plan.deleted',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_TRIAL_STARTED: 'subscription.trial.started',
  SUBSCRIPTION_TRIAL_ENDING: 'subscription.trial.ending',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_PAST_DUE: 'subscription.past_due',
  SUBSCRIPTION_GRACE_PERIOD: 'subscription.grace_period',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  SUBSCRIPTION_UPGRADED: 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription.downgraded',
  USAGE_UPDATED: 'subscription.usage.updated',
  USAGE_LIMIT_REACHED: 'subscription.usage.limit_reached',
});

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

export const BILLING_INTERVALS = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  CUSTOM: 'CUSTOM',
});

export const BILLING_INTERVAL_VALUES = Object.freeze(
  Object.values(BILLING_INTERVALS),
);

export const PLAN_CODES = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  ENTERPRISE: 'ENTERPRISE',
});

export const PLAN_CODE_VALUES = Object.freeze(Object.values(PLAN_CODES));

export const PLAN_FEATURES = Object.freeze({
  SIGNAL_SOURCES: 'signal_sources',
  BROKER_ACCOUNTS: 'broker_accounts',
  AUTOMATION_ENABLED: 'automation_enabled',
  AI_LIMITS: 'ai_limits',
  ANALYTICS_DEPTH: 'analytics_depth',
  MARKETPLACE_ACCESS: 'marketplace_access',
  COPY_TRADING: 'copy_trading',
  PROVIDER_CERTIFICATION: 'provider_certification',
  WHITE_LABEL: 'white_label',
  API_ACCESS: 'api_access',
  SOLANA_FEATURES: 'solana_features',
});

export const PLAN_FEATURE_VALUES = Object.freeze(Object.values(PLAN_FEATURES));

export const SUBSCRIPTION_TRIAL_DAYS = 7;
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3;
export const SUBSCRIPTION_RETRY_INTERVAL_DAYS = 3;
export const SUBSCRIPTION_MAX_RETRY_ATTEMPTS = 4;
export const SUBSCRIPTION_PRORATION_ENABLED = true;
export const SUBSCRIPTION_CANCEL_AT_PERIOD_END = true;

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

export const USAGE_METRICS = Object.freeze({
  SIGNAL_SOURCES: 'signal_sources',
  BROKER_ACCOUNTS: 'broker_accounts',
  AI_REQUESTS: 'ai_requests',
  TRADES_EXECUTED: 'trades_executed',
  PROVIDERS_FOLLOWED: 'providers_followed',
  REPORTS_GENERATED: 'reports_generated',
  API_REQUESTS: 'api_requests',
});

export const USAGE_METRIC_VALUES = Object.freeze(Object.values(USAGE_METRICS));

export function isValidSubscriptionStatus(status) {
  return SUBSCRIPTION_STATUS_VALUES.includes(status);
}

export function isValidBillingInterval(interval) {
  return BILLING_INTERVAL_VALUES.includes(interval);
}

export function isValidPlanCode(code) {
  return PLAN_CODE_VALUES.includes(code);
}

export function isValidPlanFeature(feature) {
  return PLAN_FEATURE_VALUES.includes(feature);
}

export function isValidUsageMetric(metric) {
  return USAGE_METRIC_VALUES.includes(metric);
}

export function canExecuteTrades(status) {
  return TRADING_ENABLED_STATUSES.includes(status);
}

export function canAccessPlatform(status) {
  return PLATFORM_ACCESS_STATUSES.includes(status);
}