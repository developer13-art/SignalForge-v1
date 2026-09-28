'use strict';

const { query } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Blink Share Repository
 *
 * Persistence layer for Blink share events across every supported
 * channel. Share records are immutable once written and never updated.
 */

const TABLE = 'solana_blink_shares';

async function create(client, payload) {
  const sql = `
    INSERT INTO ${TABLE} (
      id,
      blink_id,
      channel,
      shared_by_user_id,
      target_url,
      user_agent,
      ip,
      metadata,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    RETURNING *;
  `;

  const params = [
    payload.id,
    payload.blinkId,
    payload.channel,
    payload.sharedByUserId || null,
    payload.targetUrl || null,
    payload.userAgent || null,
    payload.ip || null,
    payload.metadata ? JSON.stringify(payload.metadata) : JSON.stringify({}),
  ];

  const executor = client || { query: (text, values) => query(text, values) };
  const result = await executor.query(sql, params);
  return result.rows[0];
}

async function findById(id) {
  const sql = `SELECT * FROM ${TABLE} WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function listByBlink({ blinkId, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE blink_id = $1;`;
  const countResult = await query(countSql, [blinkId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLE}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [blinkId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function listByUser({ sharedByUserId, page = 1, pageSize = 20 }) {
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE shared_by_user_id = $1;`;
  const countResult = await query(countSql, [sharedByUserId]);
  const total = countResult.rows[0]?.total || 0;

  const listSql = `
    SELECT * FROM ${TABLE}
    WHERE shared_by_user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const listResult = await query(listSql, [sharedByUserId, limit, offset]);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function countByBlink(blinkId) {
  const sql = `SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE blink_id = $1;`;
  const result = await query(sql, [blinkId]);
  return result.rows[0]?.total || 0;
}

async function countByChannel({ blinkId }) {
  const sql = `
    SELECT channel, COUNT(*)::int AS total
    FROM ${TABLE}
    WHERE blink_id = $1
    GROUP BY channel
    ORDER BY total DESC;
  `;
  const result = await query(sql, [blinkId]);
  return result.rows;
}

async function listRecentByBlink(blinkId, limit = 20) {
  const sql = `
    SELECT * FROM ${TABLE}
    WHERE blink_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;
  const result = await query(sql, [blinkId, limit]);
  return result.rows;
}

module.exports = {
  TABLE,
  create,
  findById,
  listByBlink,
  listByUser,
  countByBlink,
  countByChannel,
  listRecentByBlink,
};