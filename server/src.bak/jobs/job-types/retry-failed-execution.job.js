/**
 * Retry Failed Execution Job
 *
 * @module server/jobs/job-types/retry-failed-execution.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(payload) {
  if (!payload.tradeId) {
    return;
  }

  const { rows } = await db.query(
    `SELECT * FROM trades WHERE id = $1 LIMIT 1`,
    [payload.tradeId],
  );

  const trade = rows[0];

  if (!trade) {
    return;
  }

  if (trade.status !== 'EXECUTION_REJECTED' && trade.status !== 'FAILED') {
    return;
  }

  logger.info({ tradeId: trade.id }, 'Retrying failed execution');

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('EXECUTE_TRADE', $1, 'PENDING', 90, NOW(), NOW(), NOW())`,
    [JSON.stringify({ tradeId: trade.id })],
  );
}

export function registerRetryFailedExecutionJob() {
  registerJobHandler({
    jobType: 'RETRY_FAILED_EXECUTION',
    handler,
  });
}

export default handler;