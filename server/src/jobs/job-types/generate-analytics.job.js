/**
 * Generate Analytics Job
 *
 * @module server/jobs/job-types/generate-analytics.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(payload) {
  const scope = payload.scope || 'DAILY';

  if (scope === 'DAILY') {
    const { rows } = await db.query(
      `INSERT INTO trade_analytics_daily (user_id, day, trades, net_profit, winners, losers)
       SELECT
         user_id,
         DATE(closed_at) AS day,
         COUNT(*)::int AS trades,
         COALESCE(SUM(realized_profit), 0)::numeric AS net_profit,
         COUNT(*) FILTER (WHERE realized_profit > 0)::int AS winners,
         COUNT(*) FILTER (WHERE realized_profit < 0)::int AS losers
       FROM trades
       WHERE status IN ('CLOSED', 'ARCHIVED')
         AND closed_at >= NOW() - INTERVAL '2 days'
       GROUP BY user_id, day
       ON CONFLICT (user_id, day) DO UPDATE
         SET trades = EXCLUDED.trades,
             net_profit = EXCLUDED.net_profit,
             winners = EXCLUDED.winners,
             losers = EXCLUDED.losers`,
    );

    logger.info({ rowsInserted: rows.length }, 'Daily analytics generated');
  }
}

export function registerGenerateAnalyticsJob() {
  registerJobHandler({
    jobType: 'GENERATE_ANALYTICS',
    handler,
  });
}

export default handler;