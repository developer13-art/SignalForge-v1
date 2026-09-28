/**
 * Copy Trading Event Helpers
 *
 * @module signalforge/server/modules/copy-trading/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { COPY_TRADING_EVENTS } = require('./copy-trading.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'copy-trading',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitSubscribed(subscriberId, providerId, subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIBED, {
    subscriberId,
    providerId,
    subscriptionId,
    subscribedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitUnsubscribed(subscriberId, providerId, subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.UNSUBSCRIBED, {
    subscriberId,
    providerId,
    subscriptionId,
    unsubscribedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionUpdated(subscriptionId, changes, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_UPDATED, {
    subscriptionId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionPaused(subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_PAUSED, {
    subscriptionId,
    pausedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriptionResumed(subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_RESUMED, {
    subscriptionId,
    resumedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFanOutStarted(signalId, providerId, subscriberCount, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_STARTED, {
    signalId,
    providerId,
    subscriberCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFanOutBatchCreated(batchId, signalId, batchIndex, totalBatches, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_BATCH_CREATED, {
    batchId,
    signalId,
    batchIndex,
    totalBatches,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFanOutBatchCompleted(batchId, signalId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_BATCH_COMPLETED, {
    batchId,
    signalId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFanOutCompleted(signalId, providerId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_COMPLETED, {
    signalId,
    providerId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitFanOutFailed(signalId, providerId, error, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_FAILED, {
    signalId,
    providerId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPersonalizedTradeCreated(subscriberId, tradeId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PERSONALIZED_TRADE_CREATED, {
    subscriberId,
    tradeId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPersonalizationFailed(subscriberId, error, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PERSONALIZATION_FAILED, {
    subscriberId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitProviderStopSync(subscriberId, tradeId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PROVIDER_STOP_SYNC, {
    subscriberId,
    tradeId,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitSubscriberReconciled(subscriberId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIBER_RECONCILED, {
    subscriberId,
    summary,
    reconciledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitLatencyAlert(subscriberId, latencyMs, threshold, meta = {}) {
  return publish(COPY_TRADING_EVENTS.LATENCY_ALERT, {
    subscriberId,
    latencyMs,
    threshold,
    alertedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitCopyFailed(subscriberId, reason, meta = {}) {
  return publish(COPY_TRADING_EVENTS.COPY_FAILED, {
    subscriberId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitSubscribed = emitSubscribed;
module.exports.emitUnsubscribed = emitUnsubscribed;
module.exports.emitSubscriptionUpdated = emitSubscriptionUpdated;
module.exports.emitSubscriptionPaused = emitSubscriptionPaused;
module.exports.emitSubscriptionResumed = emitSubscriptionResumed;
module.exports.emitFanOutStarted = emitFanOutStarted;
module.exports.emitFanOutBatchCreated = emitFanOutBatchCreated;
module.exports.emitFanOutBatchCompleted = emitFanOutBatchCompleted;
module.exports.emitFanOutCompleted = emitFanOutCompleted;
module.exports.emitFanOutFailed = emitFanOutFailed;
module.exports.emitPersonalizedTradeCreated = emitPersonalizedTradeCreated;
module.exports.emitPersonalizationFailed = emitPersonalizationFailed;
module.exports.emitProviderStopSync = emitProviderStopSync;
module.exports.emitSubscriberReconciled = emitSubscriberReconciled;
module.exports.emitLatencyAlert = emitLatencyAlert;
module.exports.emitCopyFailed = emitCopyFailed;
