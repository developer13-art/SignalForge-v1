/**
 * Telegram Session Repository
 *
 * Persistence layer for Telegram sessions. Pending sessions hold the
 * temporary OTP flow state; active sessions store the encrypted
 * Telegram session payload used to reconnect without re-login.
 *
 * @module server/modules/signal-sources/telegram/session/telegram-session.repository
 */
const { db } = require('../../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertPendingSession({
  userId,
  phoneNumber,
  countryCode,
  phoneCodeHash,
  expiresAt,
}) {
  const { rows } = await db.query(
    `INSERT INTO telegram_pending_sessions
       (user_id, phone_number, country_code, phone_code_hash, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, phoneNumber, countryCode || null, phoneCodeHash, expiresAt, nowIso()],
  );
  return rows[0];
}
async function findPendingSession({ userId, sessionId }) {
  const { rows } = await db.query(
    `SELECT * FROM telegram_pending_sessions
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
    [sessionId, userId],
  );
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    ...row,
    userId: row.user_id,
    phoneNumber: row.phone_number,
    countryCode: row.country_code,
    phoneCodeHash: row.phone_code_hash,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}
async function deletePendingSession(sessionId) {
  await db.query(`DELETE FROM telegram_pending_sessions WHERE id = $1`, [sessionId]);
}
async function insertActiveSession({
  userId,
  sessionId,
  sessionCiphertext,
  telegramUserId,
  telegramUsername,
  connectedAt,
}) {
  const { rows } = await db.query(
    `INSERT INTO telegram_sessions
       (user_id, session_ciphertext, telegram_user_id, telegram_username,
        connected_at, last_used_at, revoked_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $5, NULL, $6, $6)
     RETURNING *`,
    [
      userId,
      sessionCiphertext,
      telegramUserId || null,
      telegramUsername || null,
      connectedAt,
      nowIso(),
    ],
  );
  return rows[0];
}
async function findActiveSession({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM telegram_sessions
      WHERE user_id = $1 AND revoked_at IS NULL
      ORDER BY connected_at DESC
      LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}
async function touchLastUsedAt({ userId }) {
  await db.query(
    `UPDATE telegram_sessions
        SET last_used_at = $1, updated_at = $1
      WHERE user_id = $2 AND revoked_at IS NULL`,
    [nowIso(), userId],
  );
}
async function markSessionRevoked({ sessionId, revokedAt, reason }) {
  await db.query(
    `UPDATE telegram_sessions
        SET revoked_at = $1,
            revoked_reason = $2,
            updated_at = $1
      WHERE id = $3`,
    [revokedAt, reason || null, sessionId],
  );
}
async function listAllActiveSessions() {
  const { rows } = await db.query(
    `SELECT id, user_id, telegram_user_id, telegram_username,
            connected_at, last_used_at
       FROM telegram_sessions
      WHERE revoked_at IS NULL
      ORDER BY connected_at DESC`,
  );
  return rows;
}
async function listSessionsByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT id, user_id, telegram_user_id, telegram_username,
            connected_at, last_used_at, revoked_at, revoked_reason
       FROM telegram_sessions
      WHERE user_id = $1
      ORDER BY connected_at DESC`,
    [userId],
  );
  return rows;
}
module.exports.insertPendingSession = insertPendingSession;
module.exports.findPendingSession = findPendingSession;
module.exports.deletePendingSession = deletePendingSession;
module.exports.insertActiveSession = insertActiveSession;
module.exports.findActiveSession = findActiveSession;
module.exports.touchLastUsedAt = touchLastUsedAt;
module.exports.markSessionRevoked = markSessionRevoked;
module.exports.listAllActiveSessions = listAllActiveSessions;
module.exports.listSessionsByUser = listSessionsByUser;
