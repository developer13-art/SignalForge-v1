/**
 * Volume Growth Service
 *
 * Computes trading volume growth (notional volume, trade counts, and
 * realized profit) across all users for a period.
 *
 * @module server/modules/executive/growth/volume-growth.service
 */

import { db } from '../../../database';

const VALID_GRANULARITIES = Object.freeze(['day', 'week', 'month']);

function normalizeGranularity(granularity) {
  const g = granularity || 'day';
  return VALID_GRANULARITIES.includes(g) ? g : 'day';
}

function normalizeRange({ from, to }) {
  const toDate = to || new Date().toISOString();
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return { from: fromDate, to: toDate };
}

export async function getGrowth({ from, to, granularity }) {
  const range = normalizeRange({ from, to });
  const g = normalizeGranularity(granularity);
  const dateTrunc = g === 'month' ? 'month' : g === 'week' ? 'week' : 'day';

  const { rows: seriesRows } = await db.query(
    `SELECT DATE_TRUNC($1, opened_at) AS bucket,
            COUNT(*)::int AS trades,
            COALESCE(SUM(volume), 0)::numeric AS volume,
            COALESCE(SUM(realized_profit), 0)::numeric AS realized_profit
       FROM trades
      WHERE opened_at >= $2 AND opened_at <= $3
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [dateTrunc, range.from, range.to],
  );

  const { rows: totals } = await db.query(
    `SELECT
       COUNT(*)::int AS total_trades,
       COALESCE(SUM(volume), 0)::numeric AS total_volume,
       COALESCE(SUM(realized_profit), 0)::numeric AS total_realized_profit,
       COUNT(*) FILTER (WHERE realized_profit > 0)::int AS winners,
       COUNT(*) FILTER (WHERE realized_profit < 0)::int AS losers,
       COUNT(*) FILTER (WHERE status = 'OPEN')::int AS open_trades
       FROM trades
      WHERE opened_at >= $1 AND opened_at <= $2`,
    [range.from, range.to],
  );

  const { rows: symbolRows } = await db.query(
    `SELECT symbol,
            COUNT(*)::int AS trades,
            COALESCE(SUM(volume), 0)::numeric AS volume
       FROM trades
      WHERE opened_at >= $1 AND opened_at <= $2
      GROUP BY symbol
      ORDER BY volume DESC
      LIMIT 10`,
    [range.from, range.to],
  );

  const series = seriesRows.map((row) => ({
    bucket: row.bucket,
    trades: row.trades,
    volume: Number(row.volume || 0),
    realizedProfit: Number(row.realized_profit || 0),
  }));

  return {
    range,
    granularity: g,
    totalTrades: totals[0]?.total_trades || 0,
    openTrades: totals[0]?.open_trades || 0,
    totalVolume: Number(totals[0]?.total_volume || 0),
    totalRealizedProfit: Number(totals[0]?.total_realized_profit || 0),
    winners: totals[0]?.winners || 0,
    losers: totals[0]?.losers || 0,
    topSymbols: symbolRows.map((row) => ({
      symbol: row.symbol,
      trades: row.trades,
      volume: Number(row.volume || 0),
    })),
    series,
  };
}

export async function getDailyVolumeSeries({ days = 30 }) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { rows } = await db.query(
    `SELECT DATE_TRUNC('day', opened_at) AS bucket,
            COUNT(*)::int AS trades,
            COALESCE(SUM(volume), 0)::numeric AS volume
       FROM trades
      WHERE opened_at >= $1
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [since],
  );

  return rows.map((row) => ({
    bucket: row.bucket,
    trades: row.trades,
    volume: Number(row.volume || 0),
  }));
}

export const volumeGrowthService = {
  getGrowth,
  getDailyVolumeSeries,
};