/**
 * Telegram Session Service
 *
 * Manages Telegram user session lifecycle: pending session creation,
 * OTP verification, encrypted session persistence, retrieval, and
 * revocation. Session data is encrypted at rest using the shared
 * crypto utilities and the configured Telegram session encryption key.
 *
 * @module server/modules/signal-sources/telegram/session/telegram-session.service
 */

import { AppError } from '../../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../../lib/errors/error-codes';
import { logger } from '../../../../lib/logger';
import { encryptPacked, decryptPacked } from '@signalforge/shared/utils/crypto.util';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { config } from '../../../../config';
import * as repository from './telegram-session.repository';
import {
  emitTelegramSessionConnected,
  emitTelegramSessionRevoked,
} from '../telegram.events';

const PENDING_SESSION_TTL_MS = 10 * 60 * 1000;

function getEncryptionKey() {
  const key = config.telegram?.sessionEncryptionKey;
  if (!key) {
    throw new AppError(
      'Telegram session encryption key is not configured',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
  return key;
}

export async function createPendingSession({ userId, phoneNumber, countryCode, phoneCodeHash }) {
  if (!userId || !phoneNumber || !phoneCodeHash) {
    throw new AppError(
      'userId, phoneNumber, and phoneCodeHash are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const expiresAt = new Date(Date.now() + PENDING_SESSION_TTL_MS).toISOString();

  const record = await repository.insertPendingSession({
    userId,
    phoneNumber,
    countryCode,
    phoneCodeHash,
    expiresAt,
  });

  return record.id;
}

export async function getPendingSession({ userId, sessionId }) {
  if (!userId || !sessionId) {
    throw new AppError('userId and sessionId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findPendingSession({ userId, sessionId });

  if (!record) {
    return null;
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await repository.deletePendingSession(record.id);
    return null;
  }

  return record;
}

export async function persistSession({
  userId,
  sessionId,
  sessionData,
  telegramUserId,
  telegramUsername,
}) {
  if (!userId || !sessionId || !sessionData) {
    throw new AppError(
      'userId, sessionId, and sessionData are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const encryptionKey = getEncryptionKey();
  const packed = encryptPacked(JSON.stringify(sessionData), encryptionKey);

  const persisted = await repository.insertActiveSession({
    userId,
    sessionId,
    sessionCiphertext: packed,
    telegramUserId: telegramUserId || null,
    telegramUsername: telegramUsername || null,
    connectedAt: nowIso(),
  });

  await repository.deletePendingSession(sessionId).catch(() => {});

  logger.info({ userId, sessionId }, 'Telegram active session persisted');

  await emitTelegramSessionConnected({
    userId,
    sessionId: persisted.id,
    telegramUserId,
  }).catch((err) => logger.warn({ err }, 'Failed to emit session connected event'));

  return persisted.id;
}

export async function getActiveSession({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findActiveSession({ userId });

  if (!record) {
    return null;
  }

  const encryptionKey = getEncryptionKey();
  let sessionData;

  try {
    sessionData = JSON.parse(decryptPacked(record.sessionCiphertext, encryptionKey));
  } catch (err) {
    logger.error({ err, userId }, 'Failed to decrypt Telegram session');
    throw new AppError(
      'Telegram session could not be decrypted',
      ERROR_CODES.TELEGRAM_SESSION_DECRYPT_FAILED,
      500,
    );
  }

  return {
    id: record.id,
    userId: record.userId,
    telegramUserId: record.telegramUserId,
    telegramUsername: record.telegramUsername,
    connectedAt: record.connectedAt,
    sessionData,
  };
}

export async function touchSession({ userId }) {
  if (!userId) {
    return;
  }
  await repository.touchLastUsedAt({ userId });
}

export async function revokeSession({ userId, reason }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findActiveSession({ userId });

  if (!record) {
    return { revoked: false };
  }

  await repository.markSessionRevoked({
    sessionId: record.id,
    revokedAt: nowIso(),
    reason: reason || null,
  });

  await emitTelegramSessionRevoked({
    userId,
    sessionId: record.id,
    reason,
  }).catch((err) => logger.warn({ err }, 'Failed to emit session revoked event'));

  return { revoked: true };
}

export async function listActiveSessions() {
  return repository.listAllActiveSessions();
}

export async function listSessionsForUser({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return repository.listSessionsByUser({ userId });
}

export const telegramSessionService = {
  createPendingSession,
  getPendingSession,
  persistSession,
  getActiveSession,
  touchSession,
  revokeSession,
  listActiveSessions,
  listSessionsForUser,
};