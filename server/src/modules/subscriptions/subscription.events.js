/**
 * Subscription Event Helpers
 *
 * @module signalforge/server/modules/subscriptions/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { SUBSCRIPTION_EVENTS } from './subscription.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'subscriptions',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitPlanCreated(planId, code, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_CREATED, {
    planId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPlanUpdated(planId, code, changes, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_UPDATED, {
    planId,
    code,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPlanDeleted(planId, code, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_DELETED, {
    planId,
    code,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionCreated(userId, subscriptionId, planCode, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_CREATED, {
    userId,
    subscriptionId,
    planCode,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionActivated(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_ACTIVATED, {
    userId,
    subscriptionId,
    activatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTrialStarted(userId, subscriptionId, trialEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_TRIAL_STARTED, {
    userId,
    subscriptionId,
    trialEndsAt,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitTrialEnding(userId, subscriptionId, trialEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_TRIAL_ENDING, {
    userId,
    subscriptionId,
    trialEndsAt,
    notifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionRenewed(userId, subscriptionId, periodEnd, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_RENEWED, {
    userId,
    subscriptionId,
    periodEnd,
    renewedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionPastDue(userId, subscriptionId, attempts, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_PAST_DUE, {
    userId,
    subscriptionId,
    attempts,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionGracePeriod(userId, subscriptionId, graceEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_GRACE_PERIOD, {
    userId,
    subscriptionId,
    graceEndsAt,
    enteredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionExpired(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_EXPIRED, {
    userId,
    subscriptionId,
    expiredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionCancelled(userId, subscriptionId, reason, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_CANCELLED, {
    userId,
    subscriptionId,
    reason,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionResumed(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_RESUMED, {
    userId,
    subscriptionId,
    resumedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionUpgraded(userId, subscriptionId, fromPlan, toPlan, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_UPGRADED, {
    userId,
    subscriptionId,
    fromPlan,
    toPlan,
    upgradedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionDowngraded(userId, subscriptionId, fromPlan, toPlan, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_DOWNGRADED, {
    userId,
    subscriptionId,
    fromPlan,
    toPlan,
    downgradedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitUsageUpdated(userId, subscriptionId, metric, used, limit, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.USAGE_UPDATED, {
    userId,
    subscriptionId,
    metric,
    used,
    limit,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitUsageLimitReached(userId, subscriptionId, metric, limit, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.USAGE_LIMIT_REACHED, {
    userId,
    subscriptionId,
    metric,
    limit,
    reachedAt: new Date().toISOString(),
    ...meta,
  });
}

export { SUBSCRIPTION_EVENTS };