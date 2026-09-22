/**
 * Idempotency Middleware
 *
 * Reads the `Idempotency-Key` header (or `X-Idempotency-Key`) and
 * stores the response for that key so that repeated requests with
 * the same key receive the same response. Uses PostgreSQL-backed
 * storage to work across instances.
 *
 * @module signalforge/server/middleware/idempotency
 */

import crypto from 'node:crypto';

import { getLogger } from '../bootstrap/initLogger.js';

const HEADER_NAMES = ['idempotency-key', 'x-idempotency-key'];
const DEFAULT_TTL_SECONDS = 86400;

export function idempotencyMiddleware(options = {}) {
  const ttlSeconds = options.ttlSeconds || DEFAULT_TTL_SECONDS;
  const requiredMethods = options.methods || ['POST', 'PATCH', 'PUT', 'DELETE'];
  const logger = getLogger('idempotency');

  return async function idempotency(req, res, next) {
    if (!requiredMethods.includes(req.method)) {
      return next();
    }

    let key = null;
    for (const name of HEADER_NAMES) {
      const value = req.headers[name];
      if (typeof value === 'string' && value.length > 0) {
        key = value;
        break;
      }
    }

    if (!key) {
      return next();
    }

    if (key.length > 255) {
      return res.status(400).json({
        error: {
          code: 'IDEMPOTENCY_KEY_TOO_LONG',
          message: 'Idempotency key must be 255 characters or fewer',
        },
      });
    }

    const scopedKey = `${req.method}:${req.originalUrl}:${key}`;
    const fingerprint = crypto.createHash('sha256').update(scopedKey).digest('hex');

    try {
      const { getDatabase } = await import('../bootstrap/initDatabase.js');
      const db = getDatabase();

      const existing = await db.query(
        `SELECT response_status, response_body FROM idempotency_records
         WHERE fingerprint = $1 AND expires_at > NOW()`,
        [fingerprint],
      );

      if (existing.rowCount > 0) {
        const record = existing.rows[0];
        logger.debug({ fingerprint }, 'Returning cached idempotent response');
        return res.status(record.response_status).json(record.response_body);
      }

      const originalJson = res.json.bind(res);
      res.json = function idempotentJson(body) {
        const status = res.statusCode || 200;
        db.query(
          `INSERT INTO idempotency_records (fingerprint, idempotency_key, method, url, response_status, response_body, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW() + ($7::int * interval '1 second'))
           ON CONFLICT (fingerprint) DO NOTHING`,
          [fingerprint, key, req.method, req.originalUrl, status, body, ttlSeconds],
        ).catch((error) => {
          logger.error({ err: error }, 'Failed to store idempotency record');
        });
        return originalJson(body);
      };

      return next();
    } catch (error) {
      logger.error({ err: error }, 'Idempotency middleware failed');
      return next();
    }
  };
}

export default idempotencyMiddleware;