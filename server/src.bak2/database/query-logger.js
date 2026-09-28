/**
 * Query Logger
 *
 * Wraps database queries with structured logging so that slow or
 * failing queries are visible in production without polluting
 * application logs with every query by default.
 *
 * @module server/database/query-logger
 */
const { logger } = require('../lib/logger');

const SLOW_QUERY_THRESHOLD_MS = 500;

let enabled = process.env.NODE_ENV !== 'production';
function enableQueryLogging() {
  enabled = true;
}
function disableQueryLogging() {
  enabled = false;
}
function attachQueryLogger(pool) {
  if (!pool || typeof pool.on !== 'function') {
    throw new Error('A pool with an .on() method is required');
  }

  pool.on('query', (query) => {
    if (!enabled) {
      return;
    }

    query._startTime = Date.now();

    logger.debug({ text: query.text, params: query.values }, 'Query start');
  });

  pool.on('queryComplete', (query, result) => {
    const duration = query._startTime ? Date.now() - query._startTime : null;

    if (duration !== null && duration > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn(
        { duration, text: query.text, rowCount: result ? result.rowCount : null },
        'Slow query detected',
      );
    } else if (enabled) {
      logger.debug(
        { duration, rowCount: result ? result.rowCount : null },
        'Query complete',
      );
    }
  });

  pool.on('queryError', (query, err) => {
    logger.error(
      { err, text: query.text, params: query.values },
      'Query error',
    );
  });

  return pool;
}
function logQuery({ text, params, duration, rowCount }) {
  if (duration > SLOW_QUERY_THRESHOLD_MS) {
    logger.warn({ text, params, duration, rowCount }, 'Slow query');
  } else if (enabled) {
    logger.debug({ text, duration, rowCount }, 'Query logged');
  }
}
const queryLogger = {
  attachQueryLogger,
  enableQueryLogging,
  disableQueryLogging,
  logQuery,
  SLOW_QUERY_THRESHOLD_MS,
};
module.exports.queryLogger = queryLogger;
module.exports.enableQueryLogging = enableQueryLogging;
module.exports.disableQueryLogging = disableQueryLogging;
module.exports.attachQueryLogger = attachQueryLogger;
module.exports.logQuery = logQuery;
