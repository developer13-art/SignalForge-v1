/**
 * Request ID Middleware
 *
 * Assigns a unique identifier to each incoming request and exposes
 * it on the request object and response headers. Uses the
 * `X-Request-ID` header when provided by an upstream proxy or client.
 *
 * @module signalforge/server/middleware/request-id
 */

import { randomUUID } from 'node:crypto';

import appConfig from '../config/app.config.js';

const HEADER_NAME = appConfig.requestIdHeader;

export function requestIdMiddleware(req, res, next) {
  const incoming =
    req.headers[HEADER_NAME] ||
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'];

  const requestId =
    typeof incoming === 'string' && incoming.length > 0 && incoming.length < 128
      ? incoming
      : randomUUID();

  req.id = requestId;
  req.requestId = requestId;
  req.correlationId = requestId;

  res.setHeader(HEADER_NAME, requestId);

  next();
}

export default requestIdMiddleware;