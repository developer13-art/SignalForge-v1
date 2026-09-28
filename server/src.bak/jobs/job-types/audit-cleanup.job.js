/**
 * Audit Cleanup Job
 *
 * @module server/jobs/job-types/audit-cleanup.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(payload) {
  const retentionDays = payload.retentionDays || 365;

  const { rowCount } = await db.query(
    `DELETE FROM audit_logs
      WHERE created_at < NOW() - ($1 || ' days')::interval`,
    [retentionDays],
  );

  logger.info({ deleted: rowCount, retentionDays }, 'Audit cleanup complete');

  return { deleted: rowCount };
}

export function registerAuditCleanupJob() {
  registerJobHandler({
    jobType: 'AUDIT_CLEANUP',
    handler,
  });
}

export default handler;