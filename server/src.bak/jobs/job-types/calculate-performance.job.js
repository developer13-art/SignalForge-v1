/**
 * Calculate Performance Job
 *
 * @module server/jobs/job-types/calculate-performance.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function calculateForUser({ userId, period }) {
  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(realized_profit) FILTER (WHERE realized_profit > 0), 0)::numeric AS gross_profit,
       COALESCE(SUM(realized_profit) FILTER (WHERE realized_profit < 0), 0)::numeric AS gross_loss,
       COALESCE(SUM(commission + swap), 0)::numeric AS trading_costs
       FROM trades
      WHERE user_id = $1
        AND status IN ('CLOSED', 'ARCHIVED')
        AND closed_at >= $2
        AND closed_at < $3`,
    [
      userId,
      `${period}-01T00:00:00Z`,
      `${period}-32T00:00:00Z`,
    ],
  );

  const stats = rows[0] || {};

  const grossProfit = Number(stats.gross_profit || 0);
  const grossLoss = Number(stats.gross_loss || 0);
  const tradingCosts = Number(stats.trading_costs || 0);
  const eligibleNetProfit = Math.max(0, grossProfit + grossLoss - tradingCosts);

  await db.query(
    `INSERT INTO performance_periods
       (user_id, period, gross_profit, gross_loss, trading_costs, eligible_net_profit, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', NOW(), NOW())
     ON CONFLICT (user_id, period) DO UPDATE
       SET gross_profit = EXCLUDED.gross_profit,
           gross_loss = EXCLUDED.gross_loss,
           trading_costs = EXCLUDED.trading_costs,
           eligible_net_profit = EXCLUDED.eligible_net_profit,
           updated_at = NOW()`,
    [userId, period, grossProfit, grossLoss, tradingCosts, eligibleNetProfit],
  );

  return { userId, period, eligibleNetProfit };
}

async function handler(payload) {
  const period = payload.period || new Date().toISOString().substring(0, 7);

  if (payload.scope === 'ALL_USERS') {
    const { rows } = await db.query(`SELECT id FROM users WHERE status = 'ACTIVE'`);
    const results = [];

    for (const row of rows) {
      try {
        const result = await calculateForUser({ userId: row.id, period });
        results.push(result);
      } catch (err) {
        logger.warn({ err, userId: row.id }, 'Performance calculation failed for user');
      }
    }

    return { processed: results.length, period };
  }

  if (!payload.userId) {
    return;
  }

  return calculateForUser({ userId: payload.userId, period });
}

export function registerCalculatePerformanceJob() {
  registerJobHandler({
    jobType: 'CALCULATE_PERFORMANCE',
    handler,
  });
}

export default handler;