'use strict';

const { query } = require('../../../../database/connection');
const proofRepository = require('../proof.repository');

const {
  PROOF_STATUSES,
  PROOF_KINDS,
} = require('../proof.constants');

/**
 * SignalForge - Leaderboard Aggregator Service
 *
 * Aggregates every confirmed trade proof written by SignalForge into
 * per-provider statistics. The aggregator is deliberately database-only
 * so that it can run without invoking the Solana RPC layer; freshness
 * is guaranteed by the fact that only confirmed proofs enter the
 * aggregate.
 */

function resolveWindowRange(window) {
  const now = new Date();
  let start = null;

  switch (window) {
    case 'day':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      start = new Date('2000-01-01T00:00:00.000Z');
  }

  return {
    from: start.toISOString(),
    to: now.toISOString(),
  };
}

async function aggregateAllProviders({ window } = {}) {
  const range = resolveWindowRange(window || 'month');

  const sql = `
    SELECT
      p.provider_id,
      COUNT(*)::int AS total_trades,
      SUM(CASE WHEN (p.memo_payload->>'r')::numeric > 0 THEN 1 ELSE 0 END)::int AS winning_trades,
      SUM(CASE WHEN (p.memo_payload->>'r')::numeric < 0 THEN 1 ELSE 0 END)::int AS losing_trades,
      SUM(CASE WHEN (p.memo_payload->>'r')::numeric = 0 THEN 1 ELSE 0 END)::int AS break_even_trades,
      COALESCE(SUM((p.memo_payload->>'u')::numeric), 0) AS total_pnl_usd,
      COALESCE(AVG((p.memo_payload->>'r')::numeric), 0) AS average_pnl_percent,
      COUNT(DISTINCT p.signature)::int AS verified_trades,
      MAX(p.confirmed_at) AS last_verified_at
    FROM solana_proof_records p
    WHERE p.status = $1
      AND p.kind = $2
      AND p.created_at >= $3
      AND p.created_at <= $4
    GROUP BY p.provider_id
    HAVING COUNT(*) > 0;
  `;

  const result = await query(sql, [
    PROOF_STATUSES.CONFIRMED,
    PROOF_KINDS.TRADE_CLOSED,
    range.from,
    range.to,
  ]);

  return result.rows.map((row) => {
    const total = Number(row.total_trades) || 0;
    const winning = Number(row.winning_trades) || 0;
    const losing = Number(row.losing_trades) || 0;
    const breakEven = Number(row.break_even_trades) || 0;
    const totalPnl = Number(row.total_pnl_usd) || 0;
    const avgPnlPercent = Number(row.average_pnl_percent) || 0;

    const winRate = total > 0 ? (winning / total) * 100 : 0;

    const winningShare = winning + losing > 0 ? winning / (winning + losing) : 0;
    const losingShare = winning + losing > 0 ? losing / (winning + losing) : 0;
    const grossProfit = totalPnl > 0 ? totalPnl * winningShare : 0;
    const grossLoss = losingShare > 0 && totalPnl < 0 ? Math.abs(totalPnl) * losingShare : 0;
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    return {
      provider_id: row.provider_id,
      total_trades: total,
      winning_trades: winning,
      losing_trades: losing,
      break_even_trades: breakEven,
      win_rate: Math.round(winRate * 100) / 100,
      total_pnl_usd: Math.round(totalPnl * 100) / 100,
      average_pnl_percent: Math.round(avgPnlPercent * 100) / 100,
      profit_factor: Math.round(profitFactor * 100) / 100,
      verified_trades: Number(row.verified_trades) || 0,
      last_verified_at: row.last_verified_at || null,
      verification_level: 'on_chain_confirmed',
    };
  });
}

async function aggregateProvider({ providerId, window } = {}) {
  const range = resolveWindowRange(window || 'month');

  const sql = `
    SELECT
      COUNT(*)::int AS total_trades,
      SUM(CASE WHEN (memo_payload->>'r')::numeric > 0 THEN 1 ELSE 0 END)::int AS winning_trades,
      SUM(CASE WHEN (memo_payload->>'r')::numeric < 0 THEN 1 ELSE 0 END)::int AS losing_trades,
      SUM(CASE WHEN (memo_payload->>'r')::numeric = 0 THEN 1 ELSE 0 END)::int AS break_even_trades,
      COALESCE(SUM((memo_payload->>'u')::numeric), 0) AS total_pnl_usd,
      COALESCE(AVG((memo_payload->>'r')::numeric), 0) AS average_pnl_percent,
      COUNT(DISTINCT signature)::int AS verified_trades,
      MAX(confirmed_at) AS last_verified_at
    FROM solana_proof_records
    WHERE status = $1
      AND kind = $2
      AND provider_id = $3
      AND created_at >= $4
      AND created_at <= $5;
  `;

  const result = await query(sql, [
    PROOF_STATUSES.CONFIRMED,
    PROOF_KINDS.TRADE_CLOSED,
    providerId,
    range.from,
    range.to,
  ]);

  const row = result.rows[0];

  if (!row || Number(row.total_trades) === 0) {
    return {
      provider_id: providerId,
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      break_even_trades: 0,
      win_rate: 0,
      total_pnl_usd: 0,
      average_pnl_percent: 0,
      profit_factor: 0,
      verified_trades: 0,
      last_verified_at: null,
      verification_level: 'unverified',
    };
  }

  const total = Number(row.total_trades) || 0;
  const winning = Number(row.winning_trades) || 0;
  const losing = Number(row.losing_trades) || 0;
  const breakEven = Number(row.break_even_trades) || 0;
  const totalPnl = Number(row.total_pnl_usd) || 0;
  const avgPnlPercent = Number(row.average_pnl_percent) || 0;

  const winRate = total > 0 ? (winning / total) * 100 : 0;
  const winningShare = winning + losing > 0 ? winning / (winning + losing) : 0;
  const losingShare = winning + losing > 0 ? losing / (winning + losing) : 0;
  const grossProfit = totalPnl > 0 ? totalPnl * winningShare : 0;
  const grossLoss = losingShare > 0 && totalPnl < 0 ? Math.abs(totalPnl) * losingShare : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  return {
    provider_id: providerId,
    total_trades: total,
    winning_trades: winning,
    losing_trades: losing,
    break_even_trades: breakEven,
    win_rate: Math.round(winRate * 100) / 100,
    total_pnl_usd: Math.round(totalPnl * 100) / 100,
    average_pnl_percent: Math.round(avgPnlPercent * 100) / 100,
    profit_factor: Math.round(profitFactor * 100) / 100,
    verified_trades: Number(row.verified_trades) || 0,
    last_verified_at: row.last_verified_at || null,
    verification_level: 'on_chain_confirmed',
  };
}

async function attachProviderMetadata(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return rows;
  }

  const providerIds = rows.map((row) => row.provider_id).filter(Boolean);
  if (providerIds.length === 0) {
    return rows;
  }

  let providerMap = {};

  try {
    const sql = `
      SELECT id, name, display_name, avatar_url
      FROM providers
      WHERE id = ANY($1::text[]);
    `;
    const result = await query(sql, [providerIds]);

    providerMap = result.rows.reduce((acc, entry) => {
      acc[entry.id] = entry;
      return acc;
    }, {});
  } catch (_error) {
    providerMap = {};
  }

  return rows.map((row) => {
    const provider = providerMap[row.provider_id];
    return {
      ...row,
      provider_name: provider ? provider.display_name || provider.name || null : null,
      provider_avatar_url: provider ? provider.avatar_url || null : null,
    };
  });
}

async function getLeaderboardAggregates({ window } = {}) {
  const rows = await aggregateAllProviders({ window });
  return attachProviderMetadata(rows);
}

async function getProviderAggregate({ providerId, window } = {}) {
  return aggregateProvider({ providerId, window });
}

async function listTopProofsByProvider({ providerId, limit = 10 } = {}) {
  const sql = `
    SELECT *
    FROM solana_proof_records
    WHERE provider_id = $1
      AND status = $2
      AND kind = $3
    ORDER BY (memo_payload->>'r')::numeric DESC
    LIMIT $4;
  `;
  const result = await query(sql, [
    providerId,
    PROOF_STATUSES.CONFIRMED,
    PROOF_KINDS.TRADE_CLOSED,
    limit,
  ]);
  return result.rows;
}

async function getProofCounts({ providerId } = {}) {
  return proofRepository.aggregateProviderStats({ providerId });
}

module.exports = {
  resolveWindowRange,
  aggregateAllProviders,
  aggregateProvider,
  attachProviderMetadata,
  getLeaderboardAggregates,
  getProviderAggregate,
  listTopProofsByProvider,
  getProofCounts,
};