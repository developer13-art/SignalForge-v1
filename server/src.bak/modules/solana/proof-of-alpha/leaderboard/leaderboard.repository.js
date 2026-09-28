'use strict';

const { query, transaction } = require('../../../../database/connection');
const { buildPagination } = require('../../../../database/helpers/pagination.helper');

/**
 * SignalForge - Leaderboard Repository
 *
 * Persistence for the on-chain-verified provider leaderboard. The
 * cache table holds pre-computed rows per (window, sort_by) tuple so
 * that public reads remain fast. A separate history table records
 * every refresh for auditability.
 */

const TABLES = Object.freeze({
  CACHE: 'solana_leaderboard_cache',
  HISTORY: 'solana_leaderboard_history',
});

async function listCache({ window, sortBy, limit = 50, offset = 0 }) {
  const sql = `
    SELECT *
    FROM ${TABLES.CACHE}
    WHERE window = $1 AND sort_by = $2
    ORDER BY rank ASC
    LIMIT $3 OFFSET $4;
  `;
  const result = await query(sql, [window, sortBy, limit, offset]);
  return result.rows;
}

async function countCache({ window, sortBy }) {
  const sql = `
    SELECT COUNT(*)::int AS total
    FROM ${TABLES.CACHE}
    WHERE window = $1 AND sort_by = $2;
  `;
  const result = await query(sql, [window, sortBy]);
  return result.rows[0]?.total || 0;
}

async function findEntry({ window, sortBy, providerId }) {
  const sql = `
    SELECT *
    FROM ${TABLES.CACHE}
    WHERE window = $1 AND sort_by = $2 AND provider_id = $3
    LIMIT 1;
  `;
  const result = await query(sql, [window, sortBy, providerId]);
  return result.rows[0] || null;
}

async function replaceCache({ window, sortBy, rows }) {
  return transaction(async (client) => {
    await client.query(
      `DELETE FROM ${TABLES.CACHE} WHERE window = $1 AND sort_by = $2;`,
      [window, sortBy],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const inserted = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];

      const insertSql = `
        INSERT INTO ${TABLES.CACHE} (
          id,
          window,
          sort_by,
          rank,
          provider_id,
          provider_name,
          total_trades,
          winning_trades,
          losing_trades,
          break_even_trades,
          win_rate,
          total_pnl_usd,
          average_pnl_percent,
          profit_factor,
          verified_trades,
          verification_level,
          last_verified_at,
          metadata,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, NOW()
        )
        RETURNING *;
      `;

      const params = [
        `${window}_${sortBy}_${index + 1}_${row.provider_id}`,
        window,
        sortBy,
        index + 1,
        row.provider_id,
        row.provider_name || null,
        row.total_trades || 0,
        row.winning_trades || 0,
        row.losing_trades || 0,
        row.break_even_trades || 0,
        row.win_rate || 0,
        row.total_pnl_usd || 0,
        row.average_pnl_percent || 0,
        row.profit_factor || 0,
        row.verified_trades || 0,
        row.verification_level || 'unverified',
        row.last_verified_at || null,
        JSON.stringify(row.metadata || {}),
      ];

      const result = await client.query(insertSql, params);
      inserted.push(result.rows[0]);
    }

    return inserted;
  });
}

async function clearCache({ window, sortBy } = {}) {
  if (window && sortBy) {
    const sql = `DELETE FROM ${TABLES.CACHE} WHERE window = $1 AND sort_by = $2;`;
    const result = await query(sql, [window, sortBy]);
    return result.rowCount;
  }

  if (window) {
    const sql = `DELETE FROM ${TABLES.CACHE} WHERE window = $1;`;
    const result = await query(sql, [window]);
    return result.rowCount;
  }

  const sql = `DELETE FROM ${TABLES.CACHE};`;
  const result = await query(sql);
  return result.rowCount;
}

async function recordHistory({ window, sortBy, count, generatedBy, durationMs }) {
  const id = `lbhist_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const sql = `
    INSERT INTO ${TABLES.HISTORY} (
      id,
      window,
      sort_by,
      count,
      generated_by,
      duration_ms,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, NOW()
    )
    RETURNING *;
  `;

  const result = await query(sql, [
    id,
    window,
    sortBy,
    count,
    generatedBy || 'system',
    durationMs || null,
  ]);
  return result.rows[0];
}

async function listHistory({ window, sortBy, page = 1, pageSize = 20 }) {
  const conditions = [];
  const params = [];

  if (window) {
    params.push(window);
    conditions.push(`window = $${params.length}`);
  }

  if (sortBy) {
    params.push(sortBy);
    conditions.push(`sort_by = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit, offset } = buildPagination({ page, pageSize });

  const countSql = `SELECT COUNT(*)::int AS total FROM ${TABLES.HISTORY} ${whereClause};`;
  const countResult = await query(countSql, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  params.push(offset);

  const listSql = `
    SELECT * FROM ${TABLES.HISTORY}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length};
  `;
  const listResult = await query(listSql, params);

  return {
    items: listResult.rows,
    total,
    page,
    pageSize,
  };
}

async function lastRefresh({ window, sortBy }) {
  const sql = `
    SELECT *
    FROM ${TABLES.HISTORY}
    WHERE window = $1 AND sort_by = $2
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [window, sortBy]);
  return result.rows[0] || null;
}

async function isFresh({ window, sortBy, ttlSeconds = 300 }) {
  const sql = `
    SELECT EXISTS (
      SELECT 1
      FROM ${TABLES.HISTORY}
      WHERE window = $1
        AND sort_by = $2
        AND created_at >= NOW() - ($3 || ' seconds')::interval
    ) AS fresh;
  `;
  const result = await query(sql, [window, sortBy, String(ttlSeconds)]);
  return Boolean(result.rows[0]?.fresh);
}

async function deleteOldHistory({ olderThanDays = 90 } = {}) {
  const sql = `
    DELETE FROM ${TABLES.HISTORY}
    WHERE created_at < NOW() - ($1 || ' days')::interval
    RETURNING id;
  `;
  const result = await query(sql, [String(olderThanDays)]);
  return result.rowCount;
}

async function withTransaction(handler) {
  return transaction(async (client) => handler(client));
}

module.exports = {
  TABLES,
  listCache,
  countCache,
  findEntry,
  replaceCache,
  clearCache,
  recordHistory,
  listHistory,
  lastRefresh,
  isFresh,
  deleteOldHistory,
  withTransaction,
};