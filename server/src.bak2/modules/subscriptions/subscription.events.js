/**
 * Subscription Event Helpers
 *
 * @module signalforge/server/modules/subscriptions/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { SUBSCRIPTION_EVENTS } = require('./subscription.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'subscriptions',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitPlanCreated(planId, code, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_CREATED, {
    planId,
    code,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPlanUpdated(planId, code, changes, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_UPDATED, {
    planId,
    code,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPlanDeleted(planId, code, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.PLAN_DELETED, {
    planId,
    code,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionCreated(userId, subscriptionId, planCode, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_CREATED, {
    userId,
    subscriptionId,
    planCode,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionActivated(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_ACTIVATED, {
    userId,
    subscriptionId,
    activatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTrialStarted(userId, subscriptionId, trialEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_TRIAL_STARTED, {
    userId,
    subscriptionId,
    trialEndsAt,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitTrialEnding(userId, subscriptionId, trialEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_TRIAL_ENDING, {
    userId,
    subscriptionId,
    trialEndsAt,
    notifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionRenewed(userId, subscriptionId, periodEnd, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_RENEWED, {
    userId,
    subscriptionId,
    periodEnd,
    renewedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionPastDue(userId, subscriptionId, attempts, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_PAST_DUE, {
    userId,
    subscriptionId,
    attempts,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionGracePeriod(userId, subscriptionId, graceEndsAt, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_GRACE_PERIOD, {
    userId,
    subscriptionId,
    graceEndsAt,
    enteredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionExpired(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_EXPIRED, {
    userId,
    subscriptionId,
    expiredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionCancelled(userId, subscriptionId, reason, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_CANCELLED, {
    userId,
    subscriptionId,
    reason,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionResumed(userId, subscriptionId, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_RESUMED, {
    userId,
    subscriptionId,
    resumedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionUpgraded(userId, subscriptionId, fromPlan, toPlan, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_UPGRADED, {
    userId,
    subscriptionId,
    fromPlan,
    toPlan,
    upgradedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionDowngraded(userId, subscriptionId, fromPlan, toPlan, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.SUBSCRIPTION_DOWNGRADED, {
    userId,
    subscriptionId,
    fromPlan,
    toPlan,
    downgradedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitUsageUpdated(userId, subscriptionId, metric, used, limit, meta = {}) {
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
function emitUsageLimitReached(userId, subscriptionId, metric, limit, meta = {}) {
  return publish(SUBSCRIPTION_EVENTS.USAGE_LIMIT_REACHED, {
    userId,
    subscriptionId,
    metric,
    limit,
    reachedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitPlanCreated = emitPlanCreated;
module.exports.emitPlanUpdated = emitPlanUpdated;
module.exports.emitPlanDeleted = emitPlanDeleted;
module.exports.emitSubscriptionCreated = emitSubscriptionCreated;
module.exports.emitSubscriptionActivated = emitSubscriptionActivated;
module.exports.emitTrialStarted = emitTrialStarted;
module.exports.emitTrialEnding = emitTrialEnding;
module.exports.emitSubscriptionRenewed = emitSubscriptionRenewed;
module.exports.emitSubscriptionPastDue = emitSubscriptionPastDue;
module.exports.emitSubscriptionGracePeriod = emitSubscriptionGracePeriod;
module.exports.emitSubscriptionExpired = emitSubscriptionExpired;
module.exports.emitSubscriptionCancelled = emitSubscriptionCancelled;
module.exports.emitSubscriptionResumed = emitSubscriptionResumed;
module.exports.emitSubscriptionUpgraded = emitSubscriptionUpgraded;
module.exports.emitSubscriptionDowngraded = emitSubscriptionDowngraded;
module.exports.emitUsageUpdated = emitUsageUpdated;
module.exports.emitUsageLimitReached = emitUsageLimitReached;
