/**
 * Telegram Login Service
 *
 * Coordinates the Telegram user session login flow. Delegates to the
 * OTP service to enforce rate limits, to the session service to persist
 * state, and to the client factory to talk to Telegram.
 *
 * @module server/modules/signal-sources/telegram/auth/telegram-login.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { getTelegramClient } from '../client/telegram-client.factory';
import { telegramSessionService } from '../session/telegram-session.service';
import { telegramOtpService } from './telegram-otp.service';
import { emitTelegramSessionInitiated } from '../telegram.events';

export async function sendCode({ userId, phoneNumber, countryCode }) {
  if (!userId || !phoneNumber) {
    throw new AppError(
      'userId and phoneNumber are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  await telegramOtpService.recordOtpRequest({ userId, phoneNumber });

  const client = getTelegramClient({ userId });

  let result;
  try {
    result = await client.sendCode({ phoneNumber, countryCode });
  } catch (err) {
    logger.error({ err, userId }, 'Telegram sendCode failed');
    throw new AppError(
      'Failed to send Telegram login code',
      ERROR_CODES.TELEGRAM_SEND_CODE_FAILED,
      502,
    );
  }

  if (!result || !result.phoneCodeHash) {
    throw new AppError(
      'Telegram did not return a phone code hash',
      ERROR_CODES.TELEGRAM_SEND_CODE_FAILED,
      502,
    );
  }

  const sessionId = await telegramSessionService.createPendingSession({
    userId,
    phoneNumber,
    countryCode,
    phoneCodeHash: result.phoneCodeHash,
  });

  await emitTelegramSessionInitiated({
    userId,
    sessionId,
    phoneNumber,
  }).catch((err) => logger.warn({ err }, 'Failed to emit session initiated event'));

  return { sessionId, phoneCodeHash: result.phoneCodeHash };
}

export async function signIn({ userId, sessionId, code, password }) {
  if (!userId || !sessionId || !code) {
    throw new AppError(
      'userId, sessionId, and code are required',
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
    result = await client.signIn({
      phoneNumber: pending.phoneNumber,
      phoneCodeHash: pending.phoneCodeHash,
      code,
      password,
    });
  } catch (err) {
    if (err && err.code === 'SESSION_PASSWORD_NEEDED') {
      throw new AppError(
        'Two-factor authentication password required',
        ERROR_CODES.TELEGRAM_2FA_REQUIRED,
        401,
      );
    }
    if (err && err.code === 'PHONE_CODE_INVALID') {
      throw new AppError(
        'Invalid Telegram login code',
        ERROR_CODES.TELEGRAM_CODE_INVALID,
        400,
      );
    }
    if (err && err.code === 'PHONE_CODE_EXPIRED') {
      throw new AppError(
        'Telegram login code has expired',
        ERROR_CODES.TELEGRAM_CODE_EXPIRED,
        400,
      );
    }
    if (err && err.code === 'PASSWORD_HASH_INVALID') {
      throw new AppError(
        'Invalid Telegram two-factor password',
        ERROR_CODES.TELEGRAM_2FA_INVALID,
        401,
      );
    }

    logger.error({ err, userId }, 'Telegram signIn failed');
    throw new AppError(
      'Telegram sign-in failed',
      ERROR_CODES.TELEGRAM_SIGNIN_FAILED,
      502,
    );
  }

  if (result.requiresPassword && !password) {
    throw new AppError(
      'Two-factor authentication password required',
      ERROR_CODES.TELEGRAM_2FA_REQUIRED,
      401,
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

export const telegramLoginService = {
  sendCode,
  signIn,
};