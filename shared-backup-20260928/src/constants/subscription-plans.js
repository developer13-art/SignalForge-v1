/**
 * Subscription Plans
 *
 * Default subscription plan identifiers seeded into the platform. Actual
 * plan pricing and features are stored in the `subscription_plans` table
 * and are configurable by administrators.
 *
 * @module @signalforge/shared/constants/subscription-plans
 */const SUBSCRIPTION_PLAN_CODES = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  ENTERPRISE: 'ENTERPRISE',
});const SUBSCRIPTION_PLAN_CODE_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_PLAN_CODES),
);const BILLING_INTERVALS = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  CUSTOM: 'CUSTOM',
});const BILLING_INTERVAL_VALUES = Object.freeze(Object.values(BILLING_INTERVALS));const DEFAULT_MONTHLY_PRICE_USD = 19;const DEFAULT_YEARLY_PRICE_USD = 190;const PLAN_FEATURES = Object.freeze({
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
});const PLAN_FEATURE_VALUES = Object.freeze(Object.values(PLAN_FEATURES));function isValidPlanCode(code) {
  return SUBSCRIPTION_PLAN_CODE_VALUES.includes(code);
}function isValidBillingInterval(interval) {
  return BILLING_INTERVAL_VALUES.includes(interval);
}

module.exports.isValidPlanCode = isValidPlanCode;
module.exports.isValidBillingInterval = isValidBillingInterval;
module.exports.SUBSCRIPTION_PLAN_CODES = SUBSCRIPTION_PLAN_CODES;
module.exports.SUBSCRIPTION_PLAN_CODE_VALUES = SUBSCRIPTION_PLAN_CODE_VALUES;
module.exports.BILLING_INTERVALS = BILLING_INTERVALS;
module.exports.BILLING_INTERVAL_VALUES = BILLING_INTERVAL_VALUES;
module.exports.DEFAULT_MONTHLY_PRICE_USD = DEFAULT_MONTHLY_PRICE_USD;
module.exports.DEFAULT_YEARLY_PRICE_USD = DEFAULT_YEARLY_PRICE_USD;
module.exports.PLAN_FEATURES = PLAN_FEATURES;
module.exports.PLAN_FEATURE_VALUES = PLAN_FEATURE_VALUES;
