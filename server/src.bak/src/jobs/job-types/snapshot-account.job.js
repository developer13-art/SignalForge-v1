/**
 * Snapshot Account Job
 *
 * @module server/jobs/job-types/snapshot-account.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

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
function registerSnapshotAccountJob() {
  registerJobHandler({
    jobType: 'SNAPSHOT_ACCOUNT',
    handler,
  });
}
module.exports = handler;
module.exports.registerSnapshotAccountJob = registerSnapshotAccountJob;
