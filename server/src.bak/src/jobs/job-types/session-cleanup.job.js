/**
 * Session Cleanup Job
 *
 * @module server/jobs/job-types/session-cleanup.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler() {
  const { rowCount } = await db.query(
    `UPDATE user_sessions
        SET revoked_at = NOW()
      WHERE revoked_at IS NULL
        AND expires_at IS NOT NULL
        AND expires_at < NOW()`,
  );

  logger.info({ revokedCount: rowCount }, 'Session cleanup complete');

  return { revoked: rowCount };
}
function registerSessionCleanupJob() {
  registerJobHandler({
    jobType: 'SESSION_CLEANUP',
    handler,
  });
}
module.exports = handler;
module.exports.registerSessionCleanupJob = registerSessionCleanupJob;
