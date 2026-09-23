/**
 * Usage Limits Service
 *
 * @module signalforge/server/modules/subscriptions/usage/limits
 */

import { USAGE_METRICS, PLAN_FEATURES } from '../subscription.constants.js';
import { PlanFeatureService } from '../plans/feature.js';

const METRIC_TO_FEATURE = Object.freeze({
  [USAGE_METRICS.SIGNAL_SOURCES]: PLAN_FEATURES.SIGNAL_SOURCES,
  [USAGE_METRICS.BROKER_ACCOUNTS]: PLAN_FEATURES.BROKER_ACCOUNTS,
  [USAGE_METRICS.AI_REQUESTS]: PLAN_FEATURES.AI_LIMITS,
  [USAGE_METRICS.TRADES_EXECUTED]: PLAN_FEATURES.AI_LIMITS,
  [USAGE_METRICS.PROVIDERS_FOLLOWED]: PLAN_FEATURES.COPY_TRADING,
  [USAGE_METRICS.REPORTS_GENERATED]: PLAN_FEATURES.ANALYTICS_DEPTH,
  [USAGE_METRICS.API_REQUESTS]: PLAN_FEATURES.API_ACCESS,
});

export class UsageLimitsService {
  constructor(features = null) {
    this.features = features || new PlanFeatureService();
  }

  getLimitForMetric(plan, metric) {
    const featureKey = METRIC_TO_FEATURE[metric];
    if (!featureKey) {
      return null;
    }
    const featureValue = this.features.getFeature(plan.features, featureKey);
    if (typeof featureValue === 'number') {
      return featureValue;
    }
    if (featureValue === true) {
      return Infinity;
    }
    if (featureValue === false) {
      return 0;
    }
    return null;
  }

  checkLimit(plan, metric, used) {
    const limit = this.getLimitForMetric(plan, metric);
    if (limit === null || limit === Infinity) {
      return { allowed: true, limit, remaining: null };
    }
    const remaining = Math.max(0, limit - used);
    return {
      allowed: used < limit,
      limit,
      remaining,
    };
  }

  isFeatureEnabled(plan, metric) {
    const limit = this.getLimitForMetric(plan, metric);
    if (limit === null) {
      return false;
    }
    return limit > 0 || limit === Infinity;
  }

  describeLimit(plan, metric) {
    const limit = this.getLimitForMetric(plan, metric);
    if (limit === null) {
      return 'not_configured';
    }
    if (limit === Infinity) {
      return 'unlimited';
    }
    if (limit === 0) {
      return 'disabled';
    }
    return limit;
  }
}

export default UsageLimitsService;