/**
 * Telegram Two-Factor Service
 *
 * Handles the two-factor authentication step of the Telegram login
 * flow. Telegram requires the user's cloud password when two-step
 * verification is enabled on the account. This service validates and
 * completes the password step.
 *
 * @module server/modules/signal-sources/telegram/auth/telegram-2fa.service
 */
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { getTelegramClient } = require('../client/telegram-client.factory');
const { telegramSessionService } = require('../session/telegram-session.service');

export async function submitPassword({ userId, sessionId, password }) {
  if (!userId || !sessionId || !password) {
    throw new AppError(
      'userId, sessionId, and password are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const pending = await telegramSessionService.getPendingSession({ userId, sessionId });

  if (!pending) {
    throw new AppError(
      'Telegram pending session not found or expired',
      ERROR_CODES.TELEGRAM_SESSION_NOT_FOUND,
      404,
    );
  }

  const client = getTelegramClient({ userId });

  let result;
  try {
    result = await client.checkPassword({
      phoneNumber: pending.phoneNumber,
      password,
    });
  } catch (err) {
    if (err && err.code === 'PASSWORD_HASH_INVALID') {
      throw new AppError(
        'Invalid Telegram two-factor password',
        ERROR_CODES.TELEGRAM_2FA_INVALID,
        401,
      );
    }
    logger.error({ err, userId }, 'Telegram checkPassword failed');
    throw new AppError(
      'Telegram two-factor verification failed',
      ERROR_CODES.TELEGRAM_2FA_FAILED,
      502,
    );
  }

  const persistedId = await telegramSessionService.persistSession({
    userId,
    sessionId,
    sessionData: result.sessionData,
    telegramUserId: result.telegramUserId,
    telegramUsername: result.telegramUsername,
  });

  return { sessionPersisted: true, sessionId: persistedId };
}

export async function isPasswordRequired({ userId, sessionId }) {
  if (!userId || !sessionId) {
    throw new AppError('userId and sessionId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const pending = await telegramSessionService.getPendingSession({ userId, sessionId });

  if (!pending) {
    throw new AppError(
      'Telegram pending session not found or expired',
      ERROR_CODES.TELEGRAM_SESSION_NOT_FOUND,
      404,
    );
  }

  const client = getTelegramClient({ userId });

  const requiresPassword = await client.isPasswordNeeded({
    phoneNumber: pending.phoneNumber,
  });

  return { requiresPassword: Boolean(requiresPassword) };
}
const telegram2faService = {
  submitPassword,
  isPasswordRequired,
};
module.exports.telegram2faService = telegram2faService;
