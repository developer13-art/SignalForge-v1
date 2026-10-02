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
const { AppError } = require('../../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../../lib/errors/error-codes');
const { logger } = require('../../../../lib/logger');
const { encryptPacked, decryptPacked } = require('@signalforge/shared/utils/crypto.util');
const { nowIso } = require('@signalforge/shared/utils/date.util');
const { config } = require('../../../../config');
const repository = require('./telegram-session.repository');
const { emitTelegramSessionConnected, emitTelegramSessionRevoked } = require('../telegram.events');

const PENDING_SESSION_TTL_MS = 10 * 60 * 1000;

function getEncryptionKey() {
  const key = config.telegram?.sessionEncryptionKey ?? config.telegram?.session?.encryptionKey;
  if (!key) {
    throw new AppError(
      'Telegram session encryption key is not configured',
      ERROR_CODES.CONFIGURATION_MISSING,
      500,
    );
  }
  return key;
}
async function createPendingSession({ userId, phoneNumber, countryCode, phoneCodeHash }) {
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
async function getPendingSession({ userId, sessionId }) {
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
async function persistSession({
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
async function getActiveSession({ userId }) {
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
async function touchSession({ userId }) {
  if (!userId) {
    return;
  }
  await repository.touchLastUsedAt({ userId });
}
async function revokeSession({ userId, reason }) {
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
async function listActiveSessions() {
  return repository.listAllActiveSessions();
}
async function listSessionsForUser({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }
  return repository.listSessionsByUser({ userId });
}
const telegramSessionService = {
  createPendingSession,
  getPendingSession,
  persistSession,
  getActiveSession,
  touchSession,
  revokeSession,
  listActiveSessions,
  listSessionsForUser,
};
module.exports.telegramSessionService = telegramSessionService;

module.exports.createPendingSession = createPendingSession;

module.exports.getPendingSession = getPendingSession;

module.exports.persistSession = persistSession;

module.exports.getActiveSession = getActiveSession;

module.exports.touchSession = touchSession;

module.exports.revokeSession = revokeSession;

module.exports.listActiveSessions = listActiveSessions;

module.exports.listSessionsForUser = listSessionsForUser;
