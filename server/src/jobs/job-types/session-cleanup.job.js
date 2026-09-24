/**
 * Session Cleanup Job
 *
 * @module server/jobs/job-types/session-cleanup.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

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

export function registerSessionCleanupJob() {
  registerJobHandler({
    jobType: 'SESSION_CLEANUP',
    handler,
  });
}

export default handler;