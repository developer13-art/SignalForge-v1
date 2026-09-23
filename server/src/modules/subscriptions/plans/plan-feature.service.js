/**
 * Plan Feature Service
 *
 * @module signalforge/server/modules/subscriptions/plans/feature
 */

import { PLAN_FEATURES } from '../subscription.constants.js';

const DEFAULT_FEATURES = Object.freeze({
  MONTHLY: {
    [PLAN_FEATURES.SIGNAL_SOURCES]: 3,
    [PLAN_FEATURES.BROKER_ACCOUNTS]: 1,
    [PLAN_FEATURES.AUTOMATION_ENABLED]: true,
    [PLAN_FEATURES.AI_LIMITS]: 5000,
    [PLAN_FEATURES.ANALYTICS_DEPTH]: 'standard',
    [PLAN_FEATURES.MARKETPLACE_ACCESS]: true,
    [PLAN_FEATURES.COPY_TRADING]: true,
    [PLAN_FEATURES.PROVIDER_CERTIFICATION]: false,
    [PLAN_FEATURES.WHITE_LABEL]: false,
    [PLAN_FEATURES.API_ACCESS]: false,
    [PLAN_FEATURES.SOLANA_FEATURES]: true,
  },
  YEARLY: {
    [PLAN_FEATURES.SIGNAL_SOURCES]: 10,
    [PLAN_FEATURES.BROKER_ACCOUNTS]: 3,
    [PLAN_FEATURES.AUTOMATION_ENABLED]: true,
    [PLAN_FEATURES.AI_LIMITS]: 50000,
    [PLAN_FEATURES.ANALYTICS_DEPTH]: 'advanced',
    [PLAN_FEATURES.MARKETPLACE_ACCESS]: true,
    [PLAN_FEATURES.COPY_TRADING]: true,
    [PLAN_FEATURES.PROVIDER_CERTIFICATION]: true,
    [PLAN_FEATURES.WHITE_LABEL]: false,
    [PLAN_FEATURES.API_ACCESS]: true,
    [PLAN_FEATURES.SOLANA_FEATURES]: true,
  },
  LIFETIME: {
    [PLAN_FEATURES.SIGNAL_SOURCES]: 50,
    [PLAN_FEATURES.BROKER_ACCOUNTS]: 10,
    [PLAN_FEATURES.AUTOMATION_ENABLED]: true,
    [PLAN_FEATURES.AI_LIMITS]: 500000,
    [PLAN_FEATURES.ANALYTICS_DEPTH]: 'advanced',
    [PLAN_FEATURES.MARKETPLACE_ACCESS]: true,
    [PLAN_FEATURES.COPY_TRADING]: true,
    [PLAN_FEATURES.PROVIDER_CERTIFICATION]: true,
    [PLAN_FEATURES.WHITE_LABEL]: true,
    [PLAN_FEATURES.API_ACCESS]: true,
    [PLAN_FEATURES.SOLANA_FEATURES]: true,
  },
  ENTERPRISE: {
    [PLAN_FEATURES.SIGNAL_SOURCES]: 9999,
    [PLAN_FEATURES.BROKER_ACCOUNTS]: 9999,
    [PLAN_FEATURES.AUTOMATION_ENABLED]: true,
    [PLAN_FEATURES.AI_LIMITS]: 99999999,
    [PLAN_FEATURES.ANALYTICS_DEPTH]: 'enterprise',
    [PLAN_FEATURES.MARKETPLACE_ACCESS]: true,
    [PLAN_FEATURES.COPY_TRADING]: true,
    [PLAN_FEATURES.PROVIDER_CERTIFICATION]: true,
    [PLAN_FEATURES.WHITE_LABEL]: true,
    [PLAN_FEATURES.API_ACCESS]: true,
    [PLAN_FEATURES.SOLANA_FEATURES]: true,
  },
});

export class PlanFeatureService {
  getDefaultFeatures(planCode) {
    return DEFAULT_FEATURES[planCode] || DEFAULT_FEATURES.MONTHLY;
  }

  mergeFeatures(planCode, customFeatures = {}) {
    const base = this.getDefaultFeatures(planCode);
    return { ...base, ...customFeatures };
  }

  getFeature(planFeatures, featureKey) {
    if (!planFeatures || typeof planFeatures !== 'object') {
      return null;
    }
    return planFeatures[featureKey] !== undefined ? planFeatures[featureKey] : null;
  }

  featureEnabled(planFeatures, featureKey) {
    const value = this.getFeature(planFeatures, featureKey);
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    return false;
  }

  getNumericLimit(planFeatures, featureKey, defaultValue = 0) {
    const value = this.getFeature(planFeatures, featureKey);
    if (typeof value === 'number') {
      return value;
    }
    return defaultValue;
  }
}

export default PlanFeatureService;