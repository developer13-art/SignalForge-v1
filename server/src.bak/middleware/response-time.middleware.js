/**
 * Response Time Middleware
 *
 * Measures the time taken to process each request and exposes it on
 * the response via the `X-Response-Time` header. Also available on
 * the request object for logging.
 *
 * @module signalforge/server/middleware/response-time
 */

import appConfig from '../config/app.config.js';

const HEADER_NAME = appConfig.responseTimeHeader || 'x-response-time';

export function responseTimeMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    req.responseTimeMs = durationMs;
    if (!res.headersSent) {
      res.setHeader(HEADER_NAME, `${durationMs.toFixed(2)}ms`);
    }
  });

  res.on('close', () => {
    if (req.responseTimeMs === undefined) {
      const end = process.hrtime.bigint();
      req.responseTimeMs = Number(end - start) / 1_000_000;
    }
  });

  next();
}

export default responseTimeMiddleware;