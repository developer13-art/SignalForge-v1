/**
 * Telegram Service
 *
 * Orchestrates the Telegram User Session integration. This service is
 * the top-level entry point for Telegram-related operations and
 * delegates to the specialized services for authentication, session
 * storage, channel management, message listening, and reconnection.
 *
 * The service does not directly interact with Telegram's API; all API
 * calls are performed through the client abstraction.
 *
 * @module server/modules/signal-sources/telegram/telegram.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { buildMessageFingerprint } from '@signalforge/shared/utils/fingerprint.util';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { telegramSessionService } from './session/telegram-session.service';
import { telegramChannelService } from './channels/telegram-channel.service';
import { telegramListenerService } from './listener/telegram-listener.service';
import { telegramReconnectService } from './reconnect/telegram-reconnect.service';
import { getTelegramClient } from './client/telegram-client.factory';

const ACTIVE_LISTENERS = new Map();

/**
 * Initiate a Telegram user session login flow.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.phoneNumber
 * @param {string} params.countryCode
 * @returns {Promise<{sessionId: string, phoneCodeHash: string}>}
 */
export async function initiateLogin({ userId, phoneNumber, countryCode }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new AppError('phoneNumber is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const client = getTelegramClient({ userId });

  const result = await client.sendCode({ phoneNumber, countryCode });

  const sessionId = await telegramSessionService.createPendingSession({
    userId,
    phoneNumber,
    countryCode,
    phoneCodeHash: result.phoneCodeHash,
  });

  logger.info(
    { userId, sessionId },
    'Telegram login initiated',
  );

  return { sessionId, phoneCodeHash: result.phoneCodeHash };
}

/**
 * Complete the login flow with the OTP entered by the user.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.sessionId
 * @param {string} params.code
 * @param {string} [params.password]
 * @returns {Promise<{sessionPersisted: boolean}>}
 */
export async function completeLogin({ userId, sessionId, code, password }) {
  if (!userId || !sessionId || !code) {
    throw new AppError(
      'userId, sessionId, and code are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const session = await telegramSessionService.getPendingSession({ userId, sessionId });

  if (!session) {
    throw new AppError(
      'Telegram pending session not found or expired',
      ERROR_CODES.TELEGRAM_SESSION_NOT_FOUND,
      404,
    );
  }

  const client = getTelegramClient({ userId });

  const result = await client.signIn({
    phoneNumber: session.phoneNumber,
    phoneCodeHash: session.phoneCodeHash,
    code,
    password,
  });

  if (result.requiresPassword && !password) {
    throw new AppError(
      'Two-factor password required',
      ERROR_CODES.TELEGRAM_2FA_REQUIRED,
      401,
    );
  }

  await telegramSessionService.persistSession({
    userId,
    sessionId,
    sessionData: result.sessionData,
    telegramUserId: result.telegramUserId,
    telegramUsername: result.telegramUsername,
  });

  logger.info({ userId, sessionId }, 'Telegram login completed');

  await publishEvent({
    eventType: EVENT_TYPES.SOLANA_WALLET_CONNECTED,
    source: 'telegram.service',
    actorId: userId,
    payload: {
      userId,
      provider: SOURCE_TYPES.TELEGRAM,
    },
  }).catch((err) => {
    logger.warn({ err }, 'Failed to publish Telegram connected event');
  });

  return { sessionPersisted: true };
}

/**
 * Start listening to selected Telegram channels for a user.
 *
 * @param {object} params
 * @param {string} params.userId
 * @returns {Promise<{listening: boolean, channels: string[]}>}
 */
export async function startListening({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (ACTIVE_LISTENERS.has(userId)) {
    logger.warn({ userId }, 'Telegram listener already active');
    return { listening: true, channels: ACTIVE_LISTENERS.get(userId) };
  }

  const session = await telegramSessionService.getActiveSession({ userId });

  if (!session) {
    throw new AppError(
      'No active Telegram session for user',
      ERROR_CODES.TELEGRAM_SESSION_NOT_FOUND,
      404,
    );
  }

  const channels = await telegramChannelService.listMonitoredChannels({ userId });

  if (!channels || channels.length === 0) {
    throw new AppError(
      'No monitored Telegram channels selected',
      ERROR_CODES.TELEGRAM_NO_CHANNELS,
      400,
    );
  }

  const channelIds = channels.map((channel) => channel.channelId);

  await telegramListenerService.start({
    userId,
    session,
    channelIds,
    onMessage: handleIncomingMessage,
    onEdit: handleEditedMessage,
    onDelete: handleDeletedMessage,
  });

  ACTIVE_LISTENERS.set(userId, channelIds);

  logger.info({ userId, channelCount: channelIds.length }, 'Telegram listener started');

  return { listening: true, channels: channelIds };
}

/**
 * Stop the Telegram listener for a user.
 *
 * @param {object} params
 * @param {string} params.userId
 * @returns {Promise<{listening: boolean}>}
 */
export async function stopListening({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (!ACTIVE_LISTENERS.has(userId)) {
    return { listening: false };
  }

  await telegramListenerService.stop({ userId });
  ACTIVE_LISTENERS.delete(userId);

  logger.info({ userId }, 'Telegram listener stopped');

  return { listening: false };
}

/**
 * Disconnect a user's Telegram session entirely.
 *
 * @param {object} params
 * @param {string} params.userId
 * @returns {Promise<{disconnected: boolean}>}
 */
export async function disconnect({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await stopListening({ userId });
  await telegramReconnectService.cancel({ userId });
  await telegramSessionService.revokeSession({ userId });

  logger.info({ userId }, 'Telegram session disconnected');

  return { disconnected: true };
}

/**
 * Handler invoked by the listener when a new Telegram message arrives.
 *
 * @param {object} message
 * @returns {Promise<void>}
 */
async function handleIncomingMessage(message) {
  const idempotencyKey = buildSourceMessageKey(
    SOURCE_TYPES.TELEGRAM,
    message.channelId,
    message.messageId,
  );

  const fingerprint = buildMessageFingerprint({
    sourceType: SOURCE_TYPES.TELEGRAM,
    sourceId: message.channelId,
    externalMessageId: String(message.messageId),
    timestamp: message.timestamp,
  });

  await publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: 'telegram.listener',
    actorId: message.ownerUserId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      sourceId: message.channelId,
      channelId: message.channelId,
      externalMessageId: String(message.messageId),
      userId: message.ownerUserId,
      text: message.text,
      media: message.media || null,
      replyTo: message.replyTo || null,
      timestamp: message.timestamp,
      idempotencyKey,
      fingerprint,
    },
  });
}

/**
 * Handler invoked by the listener when a Telegram message is edited.
 *
 * @param {object} message
 * @returns {Promise<void>}
 */
async function handleEditedMessage(message) {
  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_UPDATED,
    source: 'telegram.listener',
    actorId: message.ownerUserId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      sourceId: message.channelId,
      channelId: message.channelId,
      externalMessageId: String(message.messageId),
      userId: message.ownerUserId,
      text: message.text,
      editedAt: message.editedAt || message.timestamp,
    },
  });
}

/**
 * Handler invoked by the listener when a Telegram message is deleted.
 *
 * @param {object} message
 * @returns {Promise<void>}
 */
async function handleDeletedMessage(message) {
  await publishEvent({
    eventType: EVENT_TYPES.SIGNAL_DELETED,
    source: 'telegram.listener',
    actorId: message.ownerUserId,
    payload: {
      sourceType: SOURCE_TYPES.TELEGRAM,
      sourceId: message.channelId,
      channelId: message.channelId,
      externalMessageId: String(message.messageId),
      userId: message.ownerUserId,
      deletedAt: message.deletedAt || new Date().toISOString(),
    },
  });
}

export const telegramService = {
  initiateLogin,
  completeLogin,
  startListening,
  stopListening,
  disconnect,
};