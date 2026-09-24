/**
 * Threat Detection Service
 *
 * Evaluates inbound requests against a set of heuristics and
 * maintains a rolling record of detected threats. Provides the
 * evaluation function used by the platform's request guards.
 *
 * @module server/modules/security/threat-detection.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../database';

const BLOCK_DURATION_MS = 15 * 60 * 1000;

const THREAT_LEVELS = Object.freeze({
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

const BLOCKED_IP_CACHE = new Map();

function isIpBlocked({ ipAddress }) {
  if (!ipAddress) {
    return false;
  }

  const entry = BLOCKED_IP_CACHE.get(ipAddress);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    BLOCKED_IP_CACHE.delete(ipAddress);
    return false;
  }

  return true;
}

function blockIp({ ipAddress, reason, durationMs = BLOCK_DURATION_MS }) {
  if (!ipAddress) {
    return;
  }

  BLOCKED_IP_CACHE.set(ipAddress, {
    reason,
    expiresAt: Date.now() + durationMs,
  });

  logger.warn({ ipAddress, reason, durationMs }, 'IP address blocked');
}

async function countRecentFailures({ userId, windowMinutes = 15 }) {
  if (!userId) {
    return 0;
  }

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM audit_logs
      WHERE actor_id = $1
        AND created_at >= $2
        AND action IN ('LOGIN', 'PASSWORD_RESET', 'PASSWORD_CHANGE')
        AND severity IN ('WARNING', 'CRITICAL')`,
    [userId, since],
  );

  return rows[0]?.count || 0;
}

async function countRecentAuthFailures({ userId, windowMinutes = 15 }) {
  if (!userId) {
    return 0;
  }

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM login_attempts
      WHERE user_id = $1 AND success = FALSE AND created_at >= $2`,
    [userId, since],
  );

  return rows[0]?.count || 0;
}

export async function evaluateRequest({ userId, ipAddress, userAgent, endpoint }) {
  if (isIpBlocked({ ipAddress })) {
    return {
      allowed: false,
      reason: 'IP_BLOCKED',
      level: THREAT_LEVELS.HIGH,
    };
  }

  const recentAuthFailures = await countRecentAuthFailures({ userId }).catch(() => 0);

  if (recentAuthFailures >= 10) {
    blockIp({ ipAddress, reason: 'EXCESSIVE_AUTH_FAILURES' });

    await recordThreat({
      userId,
      ipAddress,
      userAgent,
      type: 'EXCESSIVE_AUTH_FAILURES',
      level: THREAT_LEVELS.HIGH,
      details: { count: recentAuthFailures },
    }).catch((err) => logger.warn({ err }, 'Failed to record threat'));

    return {
      allowed: false,
      reason: 'EXCESSIVE_AUTH_FAILURES',
      level: THREAT_LEVELS.HIGH,
    };
  }

  const recentFailures = await countRecentFailures({ userId }).catch(() => 0);

  if (recentFailures >= 20) {
    await recordThreat({
      userId,
      ipAddress,
      userAgent,
      type: 'HIGH_FAILURE_RATE',
      level: THREAT_LEVELS.MEDIUM,
      details: { count: recentFailures, endpoint },
    }).catch((err) => logger.warn({ err }, 'Failed to record threat'));

    return {
      allowed: true,
      reason: 'ELEVATED_RISK',
      level: THREAT_LEVELS.MEDIUM,
    };
  }

  return { allowed: true, level: THREAT_LEVELS.NONE };
}

export async function recordThreat({
  userId,
  ipAddress,
  userAgent,
  type,
  level,
  details,
}) {
  if (!type || !level) {
    throw new AppError('type and level are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO security_threats
       (user_id, ip_address, user_agent, threat_type, level, details, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      userId || null,
      ipAddress || null,
      userAgent || null,
      type,
      level,
      details ? JSON.stringify(details) : null,
      nowIso(),
    ],
  );

  return { threatId: rows[0].id };
}

export async function listRecentThreats({ limit = 100, level } = {}) {
  const params = [];
  let where = '';

  if (level) {
    params.push(level);
    where = `WHERE level = $1`;
  }

  const { rows } = await db.query(
    `SELECT id, user_id, ip_address, user_agent, threat_type, level, details, resolved_at, created_at
       FROM security_threats
       ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}`,
    [...params, limit],
  );

  return rows.map((row) => ({
    threatId: row.id,
    userId: row.user_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    threatType: row.threat_type,
    level: row.level,
    details: row.details ? JSON.parse(row.details) : null,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }));
}

export async function resolveThreat({ threatId, resolvedBy, notes }) {
  if (!threatId || !resolvedBy) {
    throw new AppError('threatId and resolvedBy are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE security_threats
        SET resolved_at = $1, resolved_by = $2, resolution_notes = $3
      WHERE id = $4 AND resolved_at IS NULL`,
    [nowIso(), resolvedBy, notes || null, threatId],
  );

  if (rowCount === 0) {
    throw new AppError('Threat not found or already resolved', ERROR_CODES.NOT_FOUND, 404);
  }

  return { resolved: true };
}

export async function getThreatSummary({ windowDays = 7 } = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT level, COUNT(*)::int AS count
       FROM security_threats
      WHERE created_at >= $1
      GROUP BY level`,
    [since],
  );

  const bySeverity = {};
  let totalThreats = 0;

  for (const row of rows) {
    bySeverity[row.level] = row.count;
    totalThreats += row.count;
  }

  const { rows: unresolvedRows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM security_threats
      WHERE resolved_at IS NULL`,
  );

  return {
    windowDays,
    totalThreats,
    unresolvedThreats: unresolvedRows[0]?.count || 0,
    bySeverity,
  };
}

export function listBlockedIps() {
  return Array.from(BLOCKED_IP_CACHE.entries()).map(([ipAddress, entry]) => ({
    ipAddress,
    reason: entry.reason,
    expiresAt: new Date(entry.expiresAt).toISOString(),
  }));
}

export function unblockIp({ ipAddress }) {
  return { unblocked: BLOCKED_IP_CACHE.delete(ipAddress) };
}

export const threatDetectionService = {
  evaluateRequest,
  recordThreat,
  listRecentThreats,
  resolveThreat,
  getThreatSummary,
  listBlockedIps,
  unblockIp,
  THREAT_LEVELS,
};