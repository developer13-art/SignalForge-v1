/**
 * Subscription Plans
 *
 * Default subscription plan identifiers seeded into the platform. Actual
 * plan pricing and features are stored in the `subscription_plans` table
 * and are configurable by administrators.
 *
 * @module @signalforge/shared/constants/subscription-plans
 */

export const SUBSCRIPTION_PLAN_CODES = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  ENTERPRISE: 'ENTERPRISE',
});

export const SUBSCRIPTION_PLAN_CODE_VALUES = Object.freeze(
  Object.values(SUBSCRIPTION_PLAN_CODES),
);

export const BILLING_INTERVALS = Object.freeze({
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
  CUSTOM: 'CUSTOM',
});

export const BILLING_INTERVAL_VALUES = Object.freeze(Object.values(BILLING_INTERVALS));

export const DEFAULT_MONTHLY_PRICE_USD = 19;
export const DEFAULT_YEARLY_PRICE_USD = 190;

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

export function isValidPlanCode(code) {
  return SUBSCRIPTION_PLAN_CODE_VALUES.includes(code);
}

export function isValidBillingInterval(interval) {
  return BILLING_INTERVAL_VALUES.includes(interval);
}