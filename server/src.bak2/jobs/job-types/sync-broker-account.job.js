/**
 * Sync Broker Account Job
 *
 * @module server/jobs/job-types/sync-broker-account.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

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
function registerSyncBrokerAccountJob() {
  registerJobHandler({
    jobType: 'SYNC_BROKER_ACCOUNT',
    handler,
  });
}
module.exports = handler;
module.exports.registerSyncBrokerAccountJob = registerSyncBrokerAccountJob;
