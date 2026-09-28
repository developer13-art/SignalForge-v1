/**
 * Subscriptions Module Constants
 *
 * @module signalforge/server/modules/subscriptions/constants
 */
const SUBSCRIPTION_EVENTS = Object.freeze({
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
const SUBSCRIPTION_STATUSES = Object.freeze({
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  SUSPENDED: 'SUSPENDED',
});
const SUBSCRIPTION_STATUS_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_STATUSES),
);
const BILLING_INTERVALS = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  CUSTOM: 'CUSTOM',
});
const BILLING_INTERVAL_VALUES = Object.freeze(
  Object.values(BILLING_INTERVALS),
);
const PLAN_CODES = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  ENTERPRISE: 'ENTERPRISE',
});
const PLAN_CODE_VALUES = Object.freeze(Object.values(PLAN_CODES));
const PLAN_FEATURES = Object.freeze({
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
const PLAN_FEATURE_VALUES = Object.freeze(Object.values(PLAN_FEATURES));
const SUBSCRIPTION_TRIAL_DAYS = 7;
const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3;
const SUBSCRIPTION_RETRY_INTERVAL_DAYS = 3;
const SUBSCRIPTION_MAX_RETRY_ATTEMPTS = 4;
const SUBSCRIPTION_PRORATION_ENABLED = true;
const SUBSCRIPTION_CANCEL_AT_PERIOD_END = true;
const TRADING_ENABLED_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
]);
const PLATFORM_ACCESS_STATUSES = Object.freeze([
  SUBSCRIPTION_STATUSES.TRIAL,
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.PAST_DUE,
  SUBSCRIPTION_STATUSES.GRACE_PERIOD,
  SUBSCRIPTION_STATUSES.EXPIRED,
]);
const USAGE_METRICS = Object.freeze({
  SIGNAL_SOURCES: 'signal_sources',
  BROKER_ACCOUNTS: 'broker_accounts',
  AI_REQUESTS: 'ai_requests',
  TRADES_EXECUTED: 'trades_executed',
  PROVIDERS_FOLLOWED: 'providers_followed',
  REPORTS_GENERATED: 'reports_generated',
  API_REQUESTS: 'api_requests',
});
const USAGE_METRIC_VALUES = Object.freeze(Object.values(USAGE_METRICS));
function isValidSubscriptionStatus(status) {
  return SUBSCRIPTION_STATUS_VALUES.includes(status);
}
function isValidBillingInterval(interval) {
  return BILLING_INTERVAL_VALUES.includes(interval);
}
function isValidPlanCode(code) {
  return PLAN_CODE_VALUES.includes(code);
}
function isValidPlanFeature(feature) {
  return PLAN_FEATURE_VALUES.includes(feature);
}
function isValidUsageMetric(metric) {
  return USAGE_METRIC_VALUES.includes(metric);
}
function canExecuteTrades(status) {
  return TRADING_ENABLED_STATUSES.includes(status);
}
function canAccessPlatform(status) {
  return PLATFORM_ACCESS_STATUSES.includes(status);
}
module.exports.SUBSCRIPTION_EVENTS = SUBSCRIPTION_EVENTS;
module.exports.SUBSCRIPTION_STATUSES = SUBSCRIPTION_STATUSES;
module.exports.SUBSCRIPTION_STATUS_VALUES = SUBSCRIPTION_STATUS_VALUES;
module.exports.BILLING_INTERVALS = BILLING_INTERVALS;
module.exports.BILLING_INTERVAL_VALUES = BILLING_INTERVAL_VALUES;
module.exports.PLAN_CODES = PLAN_CODES;
module.exports.PLAN_CODE_VALUES = PLAN_CODE_VALUES;
module.exports.PLAN_FEATURES = PLAN_FEATURES;
module.exports.PLAN_FEATURE_VALUES = PLAN_FEATURE_VALUES;
module.exports.SUBSCRIPTION_TRIAL_DAYS = SUBSCRIPTION_TRIAL_DAYS;
module.exports.SUBSCRIPTION_GRACE_PERIOD_DAYS = SUBSCRIPTION_GRACE_PERIOD_DAYS;
module.exports.SUBSCRIPTION_RETRY_INTERVAL_DAYS = SUBSCRIPTION_RETRY_INTERVAL_DAYS;
module.exports.SUBSCRIPTION_MAX_RETRY_ATTEMPTS = SUBSCRIPTION_MAX_RETRY_ATTEMPTS;
module.exports.SUBSCRIPTION_PRORATION_ENABLED = SUBSCRIPTION_PRORATION_ENABLED;
module.exports.SUBSCRIPTION_CANCEL_AT_PERIOD_END = SUBSCRIPTION_CANCEL_AT_PERIOD_END;
module.exports.TRADING_ENABLED_STATUSES = TRADING_ENABLED_STATUSES;
module.exports.PLATFORM_ACCESS_STATUSES = PLATFORM_ACCESS_STATUSES;
module.exports.USAGE_METRICS = USAGE_METRICS;
module.exports.USAGE_METRIC_VALUES = USAGE_METRIC_VALUES;
module.exports.isValidSubscriptionStatus = isValidSubscriptionStatus;
module.exports.isValidBillingInterval = isValidBillingInterval;
module.exports.isValidPlanCode = isValidPlanCode;
module.exports.isValidPlanFeature = isValidPlanFeature;
module.exports.isValidUsageMetric = isValidUsageMetric;
module.exports.canExecuteTrades = canExecuteTrades;
module.exports.canAccessPlatform = canAccessPlatform;
