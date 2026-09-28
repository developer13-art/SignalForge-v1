/**
 * Broker Event Helpers
 *
 * @module signalforge/server/modules/brokers/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { BROKER_EVENTS } = require('./broker.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'brokers',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitBrokerRegistered(brokerId, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_REGISTERED, {
    brokerId,
    registeredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBrokerUpdated(brokerId, changes, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_UPDATED, {
    brokerId,
    changes,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitBrokerDeleted(brokerId, meta = {}) {
  return publish(BROKER_EVENTS.BROKER_DELETED, {
    brokerId,
    deletedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountCreated(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CREATED, {
    accountId,
    userId,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountConnecting(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CONNECTING, {
    accountId,
    userId,
    connectingAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountConnected(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CONNECTED, {
    accountId,
    userId,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountDisconnected(accountId, userId, reason, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DISCONNECTED, {
    accountId,
    userId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountDeploying(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYING, {
    accountId,
    userId,
    deployingAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountDeployed(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYED, {
    accountId,
    userId,
    deployedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountDeploymentFailed(accountId, userId, error, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_DEPLOYMENT_FAILED, {
    accountId,
    userId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountError(accountId, userId, error, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_ERROR, {
    accountId,
    userId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountSynced(accountId, userId, summary, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_SYNCED, {
    accountId,
    userId,
    summary,
    syncedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountSnapshot(accountId, userId, snapshot, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_SNAPSHOT, {
    accountId,
    userId,
    snapshot,
    capturedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountHealthCheck(accountId, healthy, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_HEALTH_CHECK, {
    accountId,
    healthy,
    checkedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitAccountCredentialsUpdated(accountId, userId, meta = {}) {
  return publish(BROKER_EVENTS.ACCOUNT_CREDENTIALS_UPDATED, {
    accountId,
    userId,
    updatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStreamConnected(accountId, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_CONNECTED, {
    accountId,
    connectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStreamDisconnected(accountId, reason, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_DISCONNECTED, {
    accountId,
    reason,
    disconnectedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStreamEvent(accountId, eventType, event, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_EVENT, {
    accountId,
    eventType,
    event,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStreamError(accountId, error, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_ERROR, {
    accountId,
    error: typeof error === 'string' ? error : error.message,
    occurredAt: new Date().toISOString(),
    ...meta,
  });
}
function emitStreamReconnecting(accountId, attempt, meta = {}) {
  return publish(BROKER_EVENTS.STREAM_RECONNECTING, {
    accountId,
    attempt,
    reconnectingAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRateLimitHit(gateway, meta = {}) {
  return publish(BROKER_EVENTS.RATE_LIMIT_HIT, {
    gateway,
    hitAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitBrokerRegistered = emitBrokerRegistered;
module.exports.emitBrokerUpdated = emitBrokerUpdated;
module.exports.emitBrokerDeleted = emitBrokerDeleted;
module.exports.emitAccountCreated = emitAccountCreated;
module.exports.emitAccountConnecting = emitAccountConnecting;
module.exports.emitAccountConnected = emitAccountConnected;
module.exports.emitAccountDisconnected = emitAccountDisconnected;
module.exports.emitAccountDeploying = emitAccountDeploying;
module.exports.emitAccountDeployed = emitAccountDeployed;
module.exports.emitAccountDeploymentFailed = emitAccountDeploymentFailed;
module.exports.emitAccountError = emitAccountError;
module.exports.emitAccountSynced = emitAccountSynced;
module.exports.emitAccountSnapshot = emitAccountSnapshot;
module.exports.emitAccountHealthCheck = emitAccountHealthCheck;
module.exports.emitAccountCredentialsUpdated = emitAccountCredentialsUpdated;
module.exports.emitStreamConnected = emitStreamConnected;
module.exports.emitStreamDisconnected = emitStreamDisconnected;
module.exports.emitStreamEvent = emitStreamEvent;
module.exports.emitStreamError = emitStreamError;
module.exports.emitStreamReconnecting = emitStreamReconnecting;
module.exports.emitRateLimitHit = emitRateLimitHit;
