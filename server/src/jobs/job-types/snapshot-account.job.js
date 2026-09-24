/**
 * Snapshot Account Job
 *
 * @module server/jobs/job-types/snapshot-account.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(payload) {
  if (payload.scope === 'ALL_ACCOUNTS') {
    const { rows } = await db.query(
      `INSERT INTO account_snapshots (broker_account_id, balance, equity, margin, free_margin, captured_at)
       SELECT id, balance, equity, margin, free_margin, NOW()
         FROM broker_accounts
        WHERE connection_status = 'CONNECTED'`,
    );

    logger.info({ snapshotCount: rows.length }, 'Account snapshots created');
    return;
  }

  if (!payload.brokerAccountId) {
    return;
  }

  await db.query(
    `INSERT INTO account_snapshots (broker_account_id, balance, equity, margin, free_margin, captured_at)
     SELECT id, balance, equity, margin, free_margin, NOW()
       FROM broker_accounts
      WHERE id = $1`,
    [payload.brokerAccountId],
  );
}

export function registerSnapshotAccountJob() {
  registerJobHandler({
    jobType: 'SNAPSHOT_ACCOUNT',
    handler,
  });
}

export default handler;