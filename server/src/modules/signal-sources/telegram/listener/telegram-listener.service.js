/**
 * Telegram Listener Service
 *
 * Manages the lifecycle of live Telegram message listeners for a user.
 * Coordinates the client, dispatches incoming events to the correct
 * handler, and maintains per-user listener state so that a user cannot
 * accidentally start two listeners on the same session.
 *
 * @module server/modules/signal-sources/telegram/listener/telegram-listener.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { getTelegramClient } from '../client/telegram-client.factory';
import { telegramSessionService } from '../session/telegram-session.service';
import { telegramRateLimitService } from '../reconnect/telegram-rate-limit.service';
import { telegramHealthService } from '../reconnect/telegram-health.service';
import {
  emitTelegramListenerStarted,
  emitTelegramListenerStopped,
} from '../telegram.events';
import {
  handleIncomingMessage,
  handleMessageEdited,
  handleMessageDeleted,
} from './telegram-message-handler.service';
import { handleMessageEdited as handleEdited } from './telegram-edit-handler.service';
import { handleMessageDeleted as handleDeleted } from './telegram-delete-handler.service';
import { handleMediaMessage } from './telegram-media-handler.service';

const ACTIVE_LISTENERS = new Map();

const LISTENER_STATES = Object.freeze({
  IDLE: 'IDLE',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  STOPPING: 'STOPPING',
  STOPPED: 'STOPPED',
  FAILED: 'FAILED',
});

function setListenerState(userId, state, extra = {}) {
  const existing = ACTIVE_LISTENERS.get(userId) || {};
  ACTIVE_LISTENERS.set(userId, { ...existing, state, ...extra, updatedAt: Date.now() });
}

function getListenerState(userId) {
  return ACTIVE_LISTENERS.get(userId) || null;
}

export async function start({ userId, session, channelIds, onMessage, onEdit, onDelete }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!session || !session.sessionData) {
    throw new AppError('Active Telegram session is required', ERROR_CODES.TELEGRAM_SESSION_NOT_FOUND, 400);
  }

  if (!Array.isArray(channelIds) || channelIds.length === 0) {
    throw new AppError('At least one channel must be provided', ERROR_CODES.TELEGRAM_NO_CHANNELS, 400);
  }

  const existing = getListenerState(userId);
  if (existing && existing.state === LISTENER_STATES.RUNNING) {
    logger.warn({ userId }, 'Telegram listener already running for user');
    return { started: false, alreadyRunning: true, channels: existing.channelIds };
  }

  setListenerState(userId, LISTENER_STATES.STARTING, { channelIds });

  const client = getTelegramClient({ userId });

  let connection;
  try {
    connection = await client.openListenerConnection({
      sessionData: session.sessionData,
      channelIds,
    });
  } catch (err) {
    setListenerState(userId, LISTENER_STATES.FAILED, { error: err.message });
    logger.error({ err, userId }, 'Failed to open Telegram listener connection');
    throw new AppError(
      'Failed to open Telegram listener connection',
      ERROR_CODES.TELEGRAM_LISTENER_START_FAILED,
      502,
    );
  }

  connection.on('message', async (telegramMessage) => {
    try {
      await telegramRateLimitService.guard({ userId, operation: 'message' });

      if (telegramMessage.media && telegramMessage.media.length > 0) {
        await handleMediaMessage({ userId, message: telegramMessage });
      }

      await handleIncomingMessage({
        userId,
        message: telegramMessage,
        onMessage,
      });

      telegramHealthService.recordMessageReceived({ userId });
    } catch (err) {
      logger.error({ err, userId, messageId: telegramMessage && telegramMessage.messageId }, 'Failed to handle Telegram message');
    }
  });

  connection.on('editedMessage', async (telegramMessage) => {
    try {
      await handleEdited({
        userId,
        message: telegramMessage,
        onEdit: onEdit || handleMessageEdited,
      });
      telegramHealthService.recordEditReceived({ userId });
    } catch (err) {
      logger.error({ err, userId, messageId: telegramMessage && telegramMessage.messageId }, 'Failed to handle Telegram edited message');
    }
  });

  connection.on('deletedMessage', async (telegramMessage) => {
    try {
      await handleDeleted({
        userId,
        message: telegramMessage,
        onDelete: onDelete || handleMessageDeleted,
      });
      telegramHealthService.recordDeleteReceived({ userId });
    } catch (err) {
      logger.error({ err, userId, messageId: telegramMessage && telegramMessage.messageId }, 'Failed to handle Telegram deleted message');
    }
  });

  connection.on('error', (err) => {
    logger.error({ err, userId }, 'Telegram listener connection error');
    setListenerState(userId, LISTENER_STATES.FAILED, { error: err.message });
    telegramHealthService.recordError({ userId, error: err.message });
  });

  connection.on('close', () => {
    logger.warn({ userId }, 'Telegram listener connection closed');
    setListenerState(userId, LISTENER_STATES.STOPPED);
    telegramHealthService.recordDisconnection({ userId });
  });

  setListenerState(userId, LISTENER_STATES.RUNNING, {
    channelIds,
    connection,
    startedAt: Date.now(),
  });

  await emitTelegramListenerStarted({
    userId,
    channelCount: channelIds.length,
  }).catch((err) => logger.warn({ err }, 'Failed to emit listener started event'));

  logger.info({ userId, channelCount: channelIds.length }, 'Telegram listener started');

  return { started: true, channels: channelIds };
}

export async function stop({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const state = getListenerState(userId);

  if (!state || !state.connection) {
    ACTIVE_LISTENERS.delete(userId);
    return { stopped: false, reason: 'NOT_RUNNING' };
  }

  setListenerState(userId, LISTENER_STATES.STOPPING);

  try {
    await state.connection.close();
  } catch (err) {
    logger.warn({ err, userId }, 'Error while closing Telegram listener connection');
  }

  ACTIVE_LISTENERS.delete(userId);

  await emitTelegramListenerStopped({ userId, reason }).catch((err) => logger.warn({ err }, 'Failed to emit listener stopped event'));

  logger.info({ userId }, 'Telegram listener stopped');

  return { stopped: true };
}

export async function stopAll() {
  const userIds = Array.from(ACTIVE_LISTENERS.keys());
  const results = [];

  for (const userId of userIds) {
    try {
      const result = await stop({ userId, reason: 'SHUTDOWN' });
      results.push({ userId, ...result });
    } catch (err) {
      results.push({ userId, stopped: false, error: err.message });
    }
  }

  return results;
}

export function isRunning({ userId }) {
  const state = getListenerState(userId);
  return Boolean(state && state.state === LISTENER_STATES.RUNNING);
}

export function getState({ userId }) {
  return getListenerState(userId);
}

export function listRunning() {
  return Array.from(ACTIVE_LISTENERS.entries())
    .filter(([, state]) => state.state === LISTENER_STATES.RUNNING)
    .map(([userId, state]) => ({ userId, channelIds: state.channelIds, startedAt: state.startedAt }));
}

export const telegramListenerService = {
  start,
  stop,
  stopAll,
  isRunning,
  getState,
  listRunning,
  LISTENER_STATES,
};