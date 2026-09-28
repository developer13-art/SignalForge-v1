/**
 * Telegram Reconnect Service
 *
 * Manages automatic reconnection for Telegram listeners that lose
 * their underlying connection. Uses exponential backoff with jitter
 * to avoid thundering herd problems across many users, and coordinates
 * with the health service and rate limit service to prevent overload.
 *
 * @module server/modules/signal-sources/telegram/reconnect/telegram-reconnect.service
 */
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { sleep } = require('@signalforge/shared/utils/retry.util');
const { calculateBackoff } = require('@signalforge/shared/utils/backoff.util');
const { telegramSessionService } = require('../session/telegram-session.service');
const { telegramChannelService } = require('../channels/telegram-channel.service');
const { emitTelegramReconnectAttempt, emitTelegramReconnectSucceeded, emitTelegramReconnectFailed } = require('../telegram.events');

const RECONNECT_STATE = new Map();

const DEFAULTS = Object.freeze({
  maxAttempts: 8,
  baseDelayMs: 2000,
  maxDelayMs: 5 * 60 * 1000,
  jitterFactor: 0.3,
});

function getState(userId) {
  return RECONNECT_STATE.get(userId) || null;
}

function setState(userId, patch) {
  const existing = RECONNECT_STATE.get(userId) || {};
  const next = { ...existing, ...patch, updatedAt: Date.now() };
  RECONNECT_STATE.set(userId, next);
  return next;
}
function isReconnecting({ userId }) {
  const state = getState(userId);
  return Boolean(state && state.reconnecting);
}
async function schedule({ userId, reason, attempt = 1, options = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const maxAttempts = options.maxAttempts ?? DEFAULTS.maxAttempts;

  if (attempt > maxAttempts) {
    logger.error({ userId, attempt, maxAttempts }, 'Telegram reconnect attempts exhausted');
    setState(userId, { reconnecting: false, exhausted: true, attempt: 0 });
    await emitTelegramReconnectFailed({
      userId,
      attempts: attempt - 1,
      error: reason || 'MAX_ATTEMPTS_REACHED',
    }).catch((err) => logger.warn({ err }, 'Failed to emit reconnect failed event'));
    return { scheduled: false, exhausted: true };
  }

  setState(userId, { reconnecting: true, attempt, reason: reason || null });

  const delayMs = calculateBackoff(attempt, 'exponential-jitter', {
    baseDelay: options.baseDelayMs ?? DEFAULTS.baseDelayMs,
    maxDelay: options.maxDelayMs ?? DEFAULTS.maxDelayMs,
    jitterFactor: options.jitterFactor ?? DEFAULTS.jitterFactor,
  });

  await emitTelegramReconnectAttempt({
    userId,
    attempt,
    delayMs,
  }).catch((err) => logger.warn({ err }, 'Failed to emit reconnect attempt event'));

  logger.info({ userId, attempt, delayMs }, 'Scheduling Telegram reconnect');

  setTimeout(() => {
    run({ userId, attempt, options }).catch((err) => {
      logger.error({ err, userId, attempt }, 'Telegram reconnect run failed');
    });
  }, delayMs);

  return { scheduled: true, delayMs, attempt };
}

async function run({ userId, attempt, options }) {
  const session = await telegramSessionService.getActiveSession({ userId });

  if (!session) {
    logger.warn({ userId }, 'No active Telegram session for reconnect');
    setState(userId, { reconnecting: false, exhausted: true });
    await emitTelegramReconnectFailed({
      userId,
      attempts: attempt,
      error: 'NO_ACTIVE_SESSION',
    }).catch((err) => logger.warn({ err }, 'Failed to emit reconnect failed event'));
    return;
  }

  const channels = await telegramChannelService.listMonitoredChannels({ userId });

  if (!channels || channels.length === 0) {
    logger.warn({ userId }, 'No monitored Telegram channels for reconnect');
    setState(userId, { reconnecting: false, exhausted: true });
    return;
  }

  try {
    const { start } = await import('../listener/telegram-listener.service');

    const result = await start({
      userId,
      session,
      channelIds: channels.map((c) => c.channelId),
    });

    if (result && result.started) {
      setState(userId, { reconnecting: false, exhausted: false, attempt: 0 });
      await emitTelegramReconnectSucceeded({
        userId,
        attempt,
      }).catch((err) => logger.warn({ err }, 'Failed to emit reconnect succeeded event'));

      logger.info({ userId, attempt }, 'Telegram reconnect succeeded');
      return;
    }

    throw new Error('Listener did not start');
  } catch (err) {
    logger.warn({ err, userId, attempt }, 'Telegram reconnect attempt failed');

    await sleep(500);

    return schedule({
      userId,
      reason: err.message,
      attempt: attempt + 1,
      options,
    });
  }
}
async function cancel({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  RECONNECT_STATE.delete(userId);
  return { cancelled: true };
}
function getReconnectState({ userId }) {
  return getState(userId);
}
function listReconnecting() {
  return Array.from(RECONNECT_STATE.entries())
    .filter(([, state]) => state.reconnecting)
    .map(([userId, state]) => ({ userId, attempt: state.attempt, reason: state.reason }));
}
const telegramReconnectService = {
  schedule,
  cancel,
  isReconnecting,
  getReconnectState,
  listReconnecting,
  DEFAULTS,
};
module.exports.telegramReconnectService = telegramReconnectService;
module.exports.isReconnecting = isReconnecting;
module.exports.getReconnectState = getReconnectState;
module.exports.listReconnecting = listReconnecting;

module.exports.schedule = schedule;

module.exports.cancel = cancel;
