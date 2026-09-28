/**
 * Telegram Health Service
 *
 * Tracks per-user Telegram listener health metrics: message throughput,
 * error counts, disconnect counts, and last activity timestamps. Used
 * by monitoring dashboards and by the reconnect scheduler to decide
 * whether a session is unhealthy.
 *
 * @module server/modules/signal-sources/telegram/reconnect/telegram-health.service
 */
const { logger } = require('../../../../lib/logger');
const { emitTelegramHealthCheck } = require('../telegram.events');

const HEALTH_STATE = new Map();

const HEALTH_THRESHOLDS = Object.freeze({
  staleAfterMs: 30 * 60 * 1000,
  errorBurstWindowMs: 5 * 60 * 1000,
  errorBurstThreshold: 10,
  disconnectBurstWindowMs: 10 * 60 * 1000,
  disconnectBurstThreshold: 5,
});

function getEntry(userId) {
  let entry = HEALTH_STATE.get(userId);
  if (!entry) {
    entry = {
      userId,
      messagesReceived: 0,
      editsReceived: 0,
      deletesReceived: 0,
      errors: [],
      disconnects: [],
      lastActivityAt: null,
      lastErrorAt: null,
      lastDisconnectAt: null,
      connectedAt: null,
    };
    HEALTH_STATE.set(userId, entry);
  }
  return entry;
}
function recordListenerStarted({ userId }) {
  const entry = getEntry(userId);
  entry.connectedAt = Date.now();
  entry.lastActivityAt = Date.now();
}
function recordMessageReceived({ userId }) {
  const entry = getEntry(userId);
  entry.messagesReceived += 1;
  entry.lastActivityAt = Date.now();
}
function recordEditReceived({ userId }) {
  const entry = getEntry(userId);
  entry.editsReceived += 1;
  entry.lastActivityAt = Date.now();
}
function recordDeleteReceived({ userId }) {
  const entry = getEntry(userId);
  entry.deletesReceived += 1;
  entry.lastActivityAt = Date.now();
}
function recordError({ userId, error }) {
  const entry = getEntry(userId);
  const now = Date.now();
  entry.errors.push({ at: now, message: error ? String(error) : null });
  entry.errors = entry.errors.filter((e) => now - e.at <= HEALTH_THRESHOLDS.errorBurstWindowMs);
  entry.lastErrorAt = now;
}
function recordDisconnection({ userId }) {
  const entry = getEntry(userId);
  const now = Date.now();
  entry.disconnects.push({ at: now });
  entry.disconnects = entry.disconnects.filter(
    (d) => now - d.at <= HEALTH_THRESHOLDS.disconnectBurstWindowMs,
  );
  entry.lastDisconnectAt = now;
}
function isHealthy({ userId }) {
  const entry = HEALTH_STATE.get(userId);

  if (!entry) {
    return { healthy: false, reason: 'NO_STATE' };
  }

  const now = Date.now();

  if (entry.errors.length >= HEALTH_THRESHOLDS.errorBurstThreshold) {
    return { healthy: false, reason: 'ERROR_BURST', count: entry.errors.length };
  }

  if (entry.disconnects.length >= HEALTH_THRESHOLDS.disconnectBurstThreshold) {
    return { healthy: false, reason: 'DISCONNECT_BURST', count: entry.disconnects.length };
  }

  if (entry.lastActivityAt && now - entry.lastActivityAt > HEALTH_THRESHOLDS.staleAfterMs) {
    return { healthy: false, reason: 'STALE', lastActivityAt: entry.lastActivityAt };
  }

  return { healthy: true };
}
function snapshot({ userId }) {
  const entry = HEALTH_STATE.get(userId);
  if (!entry) {
    return null;
  }
  return {
    userId: entry.userId,
    messagesReceived: entry.messagesReceived,
    editsReceived: entry.editsReceived,
    deletesReceived: entry.deletesReceived,
    errorsInWindow: entry.errors.length,
    disconnectsInWindow: entry.disconnects.length,
    lastActivityAt: entry.lastActivityAt,
    lastErrorAt: entry.lastErrorAt,
    lastDisconnectAt: entry.lastDisconnectAt,
    connectedAt: entry.connectedAt,
  };
}
async function runHealthCheck({ userId }) {
  const health = isHealthy({ userId });
  const snap = snapshot({ userId });

  await emitTelegramHealthCheck({
    userId,
    healthy: health.healthy,
    details: {
      reason: health.reason || null,
      ...snap,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to emit health check event'));

  return { ...health, snapshot: snap };
}
function listAllHealth() {
  return Array.from(HEALTH_STATE.keys()).map((userId) => ({
    userId,
    health: isHealthy({ userId }),
    snapshot: snapshot({ userId }),
  }));
}
function reset({ userId }) {
  if (userId) {
    HEALTH_STATE.delete(userId);
  } else {
    HEALTH_STATE.clear();
  }
}
const telegramHealthService = {
  recordListenerStarted,
  recordMessageReceived,
  recordEditReceived,
  recordDeleteReceived,
  recordError,
  recordDisconnection,
  isHealthy,
  snapshot,
  runHealthCheck,
  listAllHealth,
  reset,
  HEALTH_THRESHOLDS,
};
module.exports.telegramHealthService = telegramHealthService;
module.exports.recordListenerStarted = recordListenerStarted;
module.exports.recordMessageReceived = recordMessageReceived;
module.exports.recordEditReceived = recordEditReceived;
module.exports.recordDeleteReceived = recordDeleteReceived;
module.exports.recordError = recordError;
module.exports.recordDisconnection = recordDisconnection;
module.exports.isHealthy = isHealthy;
module.exports.snapshot = snapshot;
module.exports.listAllHealth = listAllHealth;
module.exports.reset = reset;

module.exports.runHealthCheck = runHealthCheck;
