/**
 * Telegram Client Factory
 *
 * Provides a cached, per-user Telegram client instance. The underlying
 * client library is abstracted behind an interface so it can be swapped
 * without changes to higher-level code. Clients are keyed by user id so
 * that multiple concurrent operations for the same user reuse a single
 * connection where appropriate.
 *
 * @module server/modules/signal-sources/telegram/client/telegram-client.factory
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { config } from '../../../../config';
import { createTelegramClientAdapter } from './telegram-client.interface';

const CLIENT_CACHE = new Map();

function assertTelegramConfig() {
  if (!config.telegram) {
    throw new AppError('Telegram configuration is missing', ERROR_CODES.CONFIGURATION_MISSING, 500);
  }
  if (!config.telegram.apiId || !config.telegram.apiHash) {
    throw new AppError(
      'Telegram apiId and apiHash are required',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
}

export function getTelegramClient({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  assertTelegramConfig();

  const cached = CLIENT_CACHE.get(userId);
  if (cached) {
    return cached;
  }

  const adapter = createTelegramClientAdapter({
    apiId: config.telegram.apiId,
    apiHash: config.telegram.apiHash,
    sessionEncryptionKey: config.telegram.sessionEncryptionKey,
    userId,
    logger,
  });

  CLIENT_CACHE.set(userId, adapter);

  logger.debug({ userId }, 'Telegram client adapter created');

  return adapter;
}

export function disposeTelegramClient({ userId }) {
  if (!userId) {
    return;
  }

  const cached = CLIENT_CACHE.get(userId);
  if (!cached) {
    return;
  }

  if (typeof cached.destroy === 'function') {
    try {
      cached.destroy();
    } catch (err) {
      logger.warn({ err, userId }, 'Error disposing Telegram client');
    }
  }

  CLIENT_CACHE.delete(userId);
}

export function disposeAll() {
  for (const userId of CLIENT_CACHE.keys()) {
    disposeTelegramClient({ userId });
  }
}

export function listCachedClients() {
  return Array.from(CLIENT_CACHE.keys());
}

export const telegramClientFactory = {
  getTelegramClient,
  disposeTelegramClient,
  disposeAll,
  listCachedClients,
};