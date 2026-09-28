/**
 * Sync Broker Account Job
 *
 * @module server/jobs/job-types/sync-broker-account.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(payload) {
  if (payload.scope === 'ACTIVE_ACCOUNTS') {
    const { rows } = await db.query(
      `SELECT id FROM broker_accounts WHERE connection_status = 'CONNECTED'`,
    );

    logger.info({ accountCount: rows.length }, 'Sync scope resolved for active accounts');
    return;
  }

  if (!payload.brokerAccountId) {
    return;
  }

  logger.debug({ brokerAccountId: payload.brokerAccountId }, 'Syncing broker account');

  await db.query(
    `UPDATE broker_accounts SET last_synced_at = NOW(), updated_at = NOW()
      WHERE id = $1`,
    [payload.brokerAccountId],
  );
}

export function registerSyncBrokerAccountJob() {
  registerJobHandler({
    jobType: 'SYNC_BROKER_ACCOUNT',
    handler,
  });
}

export default handler;