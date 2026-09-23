/**
 * Broker Event Helpers
 *
 * @module signalforge/server/modules/brokers/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { BROKER_EVENTS } from './broker.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'brokers',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitBrokerRegistered(brokerId, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_REGISTERED, {
    brokerId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBrokerUpdated(brokerId, changes, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_UPDATED, {
    brokerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitBrokerDeleted(brokerId, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_DELETED, {
    brokerId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountCreated(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CREATED, {
    accountId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountConnecting(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CONNECTING, {
    accountId,
    userId,
    connectingAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountConnected(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CONNECTED, {
    accountId,
    userId,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountDisconnected(accountId, userId, reason, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DISCONNECTED, {
    accountId,
    userId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountDeploying(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYING, {
    accountId,
    userId,
    deployingAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountDeployed(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYED, {
    accountId,
    userId,
    deployedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountDeploymentFailed(accountId, userId, error, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYMENT_FAILED, {
    accountId,
    userId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountError(accountId, userId, error, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_ERROR, {
    accountId,
    userId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountSynced(accountId, userId, summary, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_SYNCED, {
    accountId,
    userId,
    summary,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountSnapshot(accountId, userId, snapshot, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_SNAPSHOT, {
    accountId,
    userId,
    snapshot,
    capturedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountHealthCheck(accountId, healthy, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_HEALTH_CHECK, {
    accountId,
    healthy,
    checkedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitAccountCredentialsUpdated(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CREDENTIALS_UPDATED, {
    accountId,
    userId,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStreamConnected(accountId, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_CONNECTED, {
    accountId,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStreamDisconnected(accountId, reason, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_DISCONNECTED, {
    accountId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStreamEvent(accountId, eventType, event, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_EVENT, {
    accountId,
    eventType,
    event,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStreamError(accountId, error, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_ERROR, {
    accountId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitStreamReconnecting(accountId, attempt, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_RECONNECTING, {
    accountId,
    attempt,
    reconnectingAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRateLimitHit(gateway, meta = {}) {
  return publish(BROKER_EVENTS.RATE_LIMIT_HIT, {
    gateway,
    hitAt: new Date().toISOString(),
    ...meta,
  });
}

export { BROKER_EVENTS };