/**
 * Database Vacuum Job
 *
 * @module server/jobs/job-types/db-vacuum.job
 */

import { registerJobHandler } from '../job-registry';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler() {
  try {
    await db.query(`VACUUM (ANALYZE)`);
    logger.info('Database vacuum completed');
    return { vacuumed: true };
  } catch (err) {
    logger.warn({ err }, 'Database vacuum failed');
    return { vacuumed: false, error: err.message };
  }
}

export function registerDbVacuumJob() {
  registerJobHandler({
    jobType: 'DB_VACUUM',
    handler,
  });
}

export default handler;