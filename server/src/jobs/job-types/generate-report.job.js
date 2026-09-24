/**
 * Generate Report Job
 *
 * @module server/jobs/job-types/generate-report.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';

async function handler(payload) {
  logger.info(
    { reportType: payload.reportType, format: payload.format },
    'Report generation requested',
  );

  if (payload.notifyUserId) {
    const { db } = await import('../../database');

    await db.query(
      `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
       VALUES ($1, 'SYSTEM_ANNOUNCEMENT', 'SYSTEM', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
      [
        payload.notifyUserId,
        'Report ready',
        `Your ${payload.reportType || 'report'} is ready to download.`,
        JSON.stringify(['IN_APP']),
      ],
    );
  }
}

export function registerGenerateReportJob() {
  registerJobHandler({
    jobType: 'GENERATE_REPORT',
    handler,
  });
}

export default handler;