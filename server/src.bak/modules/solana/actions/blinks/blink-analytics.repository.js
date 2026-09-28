'use strict';

const { query } = require('../../../../database/connection');

/**
 * SignalForge - Blink Analytics Repository
 *
 * Read-only analytics queries used by the Blink analytics service and
 * the provider dashboard. Every query is written to be safe for public
 * reads with tenant-scoped parameters.
 */

const TABLES = Object.freeze({
  BLINKS: 'solana_blinks',
  SHARES: 'solana_blink_shares',
  CLICKS: 'solana_blink_clicks',
  CONVERSIONS: 'solana_blink_conversions',
});

async function getConversionFunnel({ blinkId, from, to }) {
  const sql = `
    SELECT
      COALESCE(shares.total, 0)::int AS shares,
      COALESCE(clicks.total, 0)::int AS clicks,
      COALESCE(conversions.total, 0)::int AS conversions,
      COALESCE(conversions.confirmed, 0)::int AS confirmed,
      COALESCE(conversions.failed, 0)::int AS failed,
      COALESCE(conversions.pending, 0)::int AS pending
    FROM (SELECT 1) base
    LEFT JOIN (
      SELECT COUNT(*)::int AS total FROM ${TABLES.SHARES}
      WHERE blink_id = $1 AND created_at >= $2 AND created_at <= $3
    ) shares ON TRUE
    LEFT JOIN (
      SELECT COUNT(*)::int AS total FROM ${TABLES.CLICKS}
      WHERE blink_id = $1 AND created_at >= $2 AND created_at <= $3
    ) clicks ON TRUE
    LEFT JOIN (
      SELECT
        COUNT(*)::int AS total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int AS failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending
      FROM ${TABLES.CONVERSIONS}
      WHERE blink_id = $1 AND created_at >= $2 AND created_at <= $3
    ) conversions ON TRUE;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows[0] || {};
}

async function getChannelPerformance({ blinkId, from, to }) {
  const sql = `
    SELECT
      COALESCE(sh.channel, 'direct') AS channel,
      COUNT(DISTINCT sh.id)::int AS shares,
      COUNT(DISTINCT c.id)::int AS clicks,
      COUNT(DISTINCT cv.id)::int AS conversions,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN cv.amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINKS} b
    LEFT JOIN ${TABLES.SHARES} sh
      ON sh.blink_id = b.id AND sh.created_at >= $2 AND sh.created_at <= $3
    LEFT JOIN ${TABLES.CLICKS} c
      ON c.blink_id = b.id AND c.created_at >= $2 AND c.created_at <= $3
    LEFT JOIN ${TABLES.CONVERSIONS} cv
      ON cv.blink_id = b.id AND cv.created_at >= $2 AND cv.created_at <= $3
    WHERE b.id = $1
    GROUP BY COALESCE(sh.channel, 'direct')
    ORDER BY conversions DESC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function getTokenPerformance({ blinkId, from, to }) {
  const sql = `
    SELECT
      token_symbol,
      COUNT(*)::int AS total_conversions,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed_conversions,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount,
      AVG(amount) AS average_amount
    FROM ${TABLES.CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY token_symbol
    ORDER BY confirmed_amount DESC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function getConversionVelocity({ blinkId, from, to, interval = 'hour' }) {
  const allowedIntervals = ['hour', 'day', 'week', 'month'];
  const normalized = allowedIntervals.includes(interval) ? interval : 'day';

  const sql = `
    SELECT
      DATE_TRUNC('${normalized}', created_at) AS period,
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
    GROUP BY DATE_TRUNC('${normalized}', created_at)
    ORDER BY period ASC;
  `;

  const result = await query(sql, [blinkId, from, to]);
  return result.rows;
}

async function getTopConversions({ blinkId, from, to, limit = 20 }) {
  const sql = `
    SELECT *
    FROM ${TABLES.CONVERSIONS}
    WHERE blink_id = $1
      AND created_at >= $2
      AND created_at <= $3
      AND status = 'confirmed'
    ORDER BY amount DESC
    LIMIT $4;
  `;
  const result = await query(sql, [blinkId, from, to, limit]);
  return result.rows;
}

async function getOwnerFunnel({ ownerUserId, from, to }) {
  const sql = `
    SELECT
      COUNT(DISTINCT b.id)::int AS blink_count,
      COALESCE(SUM(DISTINCT CASE WHEN sh.id IS NOT NULL THEN 1 ELSE 0 END), 0)::int AS has_shares,
      COUNT(DISTINCT sh.id)::int AS total_shares,
      COUNT(DISTINCT c.id)::int AS total_clicks,
      COUNT(DISTINCT cv.id)::int AS total_conversions,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN cv.amount ELSE 0 END), 0) AS confirmed_amount
    FROM ${TABLES.BLINKS} b
    LEFT JOIN ${TABLES.SHARES} sh
      ON sh.blink_id = b.id AND sh.created_at >= $2 AND sh.created_at <= $3
    LEFT JOIN ${TABLES.CLICKS} c
      ON c.blink_id = b.id AND c.created_at >= $2 AND c.created_at <= $3
    LEFT JOIN ${TABLES.CONVERSIONS} cv
      ON cv.blink_id = b.id AND cv.created_at >= $2 AND cv.created_at <= $3
    WHERE b.owner_user_id = $1;
  `;

  const result = await query(sql, [ownerUserId, from, to]);
  return result.rows[0] || {};
}

async function getTopPerformingBlinks({ ownerUserId, limit = 10, from, to }) {
  const sql = `
    SELECT
      b.id,
      b.title,
      b.template_type,
      COALESCE(SUM(CASE WHEN cv.status = 'confirmed' THEN cv.amount ELSE 0 END), 0) AS confirmed_amount,
      COUNT(DISTINCT cv.id)::int AS total_conversions
    FROM ${TABLES.BLINKS} b
    LEFT JOIN ${TABLES.CONVERSIONS} cv
      ON cv.blink_id = b.id
      AND cv.created_at >= $2
      AND cv.created_at <= $3
    WHERE b.owner_user_id = $1
    GROUP BY b.id, b.title, b.template_type
    ORDER BY confirmed_amount DESC
    LIMIT $4;
  `;
  const result = await query(sql, [ownerUserId, from, to, limit]);
  return result.rows;
}

module.exports = {
  getConversionFunnel,
  getChannelPerformance,
  getTokenPerformance,
  getConversionVelocity,
  getTopConversions,
  getOwnerFunnel,
  getTopPerformingBlinks,
};