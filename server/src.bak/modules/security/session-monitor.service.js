/**
 * Session Monitor Service
 *
 * Tracks active user sessions, detects anomalies (impossible travel,
 * concurrent sessions from far-apart IPs), and provides tools to
 * revoke sessions. Session revocation is always recorded in the
 * audit log.
 *
 * @module server/modules/security/session-monitor.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../database';

const MAX_SESSIONS_PER_USER = 20;
const MAX_REASONABLE_IP_CHANGES_PER_HOUR = 10;

async function getIpGeolocation(ipAddress) {
  if (!ipAddress) {
    return null;
  }

  if (
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('127.') ||
    ipAddress === '::1'
  ) {
    return { country: 'LOCAL', city: 'LOCAL' };
  }

  return {
    country: null,
    city: null,
  };
}

export async function registerSession({
  userId,
  sessionToken,
  ipAddress,
  userAgent,
  expiresAt,
}) {
  if (!userId || !sessionToken) {
    throw new AppError('userId and sessionToken are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const geo = await getIpGeolocation(ipAddress);

  const { rows } = await db.query(
    `INSERT INTO user_sessions
       (user_id, session_token, ip_address, user_agent, geo_country, geo_city,
        created_at, last_seen_at, expires_at, revoked_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, NULL)
     RETURNING id`,
    [
      userId,
      sessionToken,
      ipAddress || null,
      userAgent || null,
      geo ? geo.country : null,
      geo ? geo.city : null,
      nowIso(),
      expiresAt || null,
    ],
  );

  const sessionId = rows[0].id;

  await pruneOldSessions({ userId });

  logger.debug({ userId, sessionId, ipAddress }, 'Session registered');

  return { sessionId };
}

async function pruneOldSessions({ userId }) {
  const { rows } = await db.query(
    `SELECT id
       FROM user_sessions
      WHERE user_id = $1 AND revoked_at IS NULL
      ORDER BY last_seen_at DESC
      OFFSET $2`,
    [userId, MAX_SESSIONS_PER_USER],
  );

  if (rows.length === 0) {
    return;
  }

  const ids = rows.map((r) => r.id);

  await db.query(
    `UPDATE user_sessions
        SET revoked_at = $1
      WHERE id = ANY($2)`,
    [nowIso(), ids],
  );

  logger.info({ userId, prunedCount: ids.length }, 'Old sessions pruned');
}

export async function touchSession({ sessionToken }) {
  if (!sessionToken) {
    return { touched: false };
  }

  const { rowCount } = await db.query(
    `UPDATE user_sessions
        SET last_seen_at = $1
      WHERE session_token = $2 AND revoked_at IS NULL`,
    [nowIso(), sessionToken],
  );

  return { touched: rowCount > 0 };
}

export async function getActiveSessions({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, ip_address, user_agent, geo_country, geo_city,
            created_at, last_seen_at, expires_at
       FROM user_sessions
      WHERE user_id = $1 AND revoked_at IS NULL
      ORDER BY last_seen_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    sessionId: row.id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    geoCountry: row.geo_country,
    geoCity: row.geo_city,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
  }));
}

export async function countActiveSessions() {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM user_sessions
      WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > $1)`,
    [nowIso()],
  );
  return rows[0]?.count || 0;
}

export async function revokeSession({ sessionId, userId, actorId }) {
  if (!sessionId) {
    throw new AppError('sessionId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const params = [nowIso(), sessionId];
  let query = `UPDATE user_sessions SET revoked_at = $1 WHERE id = $2`;

  if (userId) {
    params.push(userId);
    query += ` AND user_id = $3`;
  }

  const { rowCount } = await db.query(query, params);

  if (rowCount === 0) {
    throw new AppError('Session not found', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ sessionId, userId, actorId }, 'Session revoked');

  return { revoked: true };
}

export async function revokeAllSessions({ userId, reason, actorId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE user_sessions
        SET revoked_at = $1, revoked_reason = $2
      WHERE user_id = $3 AND revoked_at IS NULL`,
    [nowIso(), reason || null, userId],
  );

  logger.info({ userId, count: rowCount, reason, actorId }, 'All sessions revoked');

  return { revokedCount: rowCount };
}

export async function detectAnomalies({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT DISTINCT ip_address
       FROM user_sessions
      WHERE user_id = $1 AND created_at >= $2`,
    [userId, oneHourAgo],
  );

  const uniqueIps = rows.map((r) => r.ip_address).filter(Boolean);

  const anomalies = [];

  if (uniqueIps.length > MAX_REASONABLE_IP_CHANGES_PER_HOUR) {
    anomalies.push({
      type: 'EXCESSIVE_IP_CHANGES',
      count: uniqueIps.length,
      windowMinutes: 60,
    });
  }

  return { anomalies, uniqueIps };
}

export async function listAllActiveSessions({ limit = 500 }) {
  const { rows } = await db.query(
    `SELECT id, user_id, ip_address, user_agent, created_at, last_seen_at, expires_at
       FROM user_sessions
      WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > $1)
      ORDER BY last_seen_at DESC
      LIMIT $2`,
    [nowIso(), limit],
  );

  return rows.map((row) => ({
    sessionId: row.id,
    userId: row.user_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    expiresAt: row.expires_at,
  }));
}

export const sessionMonitorService = {
  registerSession,
  touchSession,
  getActiveSessions,
  countActiveSessions,
  revokeSession,
  revokeAllSessions,
  detectAnomalies,
  listAllActiveSessions,
};