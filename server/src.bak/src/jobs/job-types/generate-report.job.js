/**
 * Generate Report Job
 *
 * @module server/jobs/job-types/generate-report.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

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
function registerGenerateReportJob() {
  registerJobHandler({
    jobType: 'GENERATE_REPORT',
    handler,
  });
}
module.exports = handler;
module.exports.registerGenerateReportJob = registerGenerateReportJob;
