/**
 * Admin Signal Repository
 *
 * Persistence layer for administrative signal monitoring.
 *
 * @module server/modules/admin/signals/admin-signal.repository
 */

import { db } from '../../../database';

export async function listSignals({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`s.status = $${params.length}`);
  }

  if (filters.providerId) {
    params.push(filters.providerId);
    conditions.push(`s.provider_id = $${params.length}`);
  }

  if (filters.symbol) {
    params.push(filters.symbol);
    conditions.push(`s.symbol = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`s.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`s.created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT s.id, s.provider_id, s.symbol, s.direction, s.confidence, s.classification,
            s.status, s.created_at, p.display_name AS provider_name
       FROM signals s
       LEFT JOIN providers p ON p.id = s.provider_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM signals s ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findSignalById({ signalId }) {
  const { rows } = await db.query(
    `SELECT * FROM signals WHERE id = $1 LIMIT 1`,
    [signalId],
  );
  return rows[0] || null;
}

export async function listRejectedSignals({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT s.id, s.provider_id, s.symbol, s.direction, s.status, s.rejection_reason, s.created_at
       FROM signals s
      WHERE s.status IN ('VALIDATION_FAILED', 'RISK_REJECTED')
      ORDER BY s.created_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function listDuplicateSignals({ limit = 50 }) {
  const { rows } = await db.query(
    `SELECT s.id, s.provider_id, s.symbol, s.direction, s.status, s.created_at, s.fingerprint
       FROM signals s
      WHERE s.status = 'DUPLICATE'
      ORDER BY s.created_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByStatus({ since }) {
  const params = [];
  let where = '';

  if (since) {
    params.push(since);
    where = `WHERE created_at >= $1`;
  }

  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM signals ${where} GROUP BY status`,
    params,
  );
  return rows;
}

export const adminSignalRepository = {
  listSignals,
  findSignalById,
  listRejectedSignals,
  listDuplicateSignals,
  countByStatus,
};