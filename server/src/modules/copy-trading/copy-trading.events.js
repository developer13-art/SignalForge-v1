/**
 * Copy Trading Event Helpers
 *
 * @module signalforge/server/modules/copy-trading/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { COPY_TRADING_EVENTS } from './copy-trading.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'copy-trading',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitSubscribed(subscriberId, providerId, subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIBED, {
    subscriberId,
    providerId,
    subscriptionId,
    subscribedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitUnsubscribed(subscriberId, providerId, subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.UNSUBSCRIBED, {
    subscriberId,
    providerId,
    subscriptionId,
    unsubscribedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionUpdated(subscriptionId, changes, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_UPDATED, {
    subscriptionId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionPaused(subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_PAUSED, {
    subscriptionId,
    pausedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriptionResumed(subscriptionId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIPTION_RESUMED, {
    subscriptionId,
    resumedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFanOutStarted(signalId, providerId, subscriberCount, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_STARTED, {
    signalId,
    providerId,
    subscriberCount,
    startedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFanOutBatchCreated(batchId, signalId, batchIndex, totalBatches, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_BATCH_CREATED, {
    batchId,
    signalId,
    batchIndex,
    totalBatches,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFanOutBatchCompleted(batchId, signalId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_BATCH_COMPLETED, {
    batchId,
    signalId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFanOutCompleted(signalId, providerId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_COMPLETED, {
    signalId,
    providerId,
    summary,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitFanOutFailed(signalId, providerId, error, meta = {}) {
  return publish(COPY_TRADING_EVENTS.FANOUT_FAILED, {
    signalId,
    providerId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPersonalizedTradeCreated(subscriberId, tradeId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PERSONALIZED_TRADE_CREATED, {
    subscriberId,
    tradeId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPersonalizationFailed(subscriberId, error, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PERSONALIZATION_FAILED, {
    subscriberId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitProviderStopSync(subscriberId, tradeId, meta = {}) {
  return publish(COPY_TRADING_EVENTS.PROVIDER_STOP_SYNC, {
    subscriberId,
    tradeId,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitSubscriberReconciled(subscriberId, summary, meta = {}) {
  return publish(COPY_TRADING_EVENTS.SUBSCRIBER_RECONCILED, {
    subscriberId,
    summary,
    reconciledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitLatencyAlert(subscriberId, latencyMs, threshold, meta = {}) {
  return publish(COPY_TRADING_EVENTS.LATENCY_ALERT, {
    subscriberId,
    latencyMs,
    threshold,
    alertedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitCopyFailed(subscriberId, reason, meta = {}) {
  return publish(COPY_TRADING_EVENTS.COPY_FAILED, {
    subscriberId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export { COPY_TRADING_EVENTS };