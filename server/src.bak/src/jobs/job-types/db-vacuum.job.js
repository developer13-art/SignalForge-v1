/**
 * Database Vacuum Job
 *
 * @module server/jobs/job-types/db-vacuum.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

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
function registerDbVacuumJob() {
  registerJobHandler({
    jobType: 'DB_VACUUM',
    handler,
  });
}
module.exports = handler;
module.exports.registerDbVacuumJob = registerDbVacuumJob;
