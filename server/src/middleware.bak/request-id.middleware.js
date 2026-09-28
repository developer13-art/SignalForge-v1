/**
 * Request ID Middleware
 *
 * Assigns a unique identifier to each incoming request and exposes
 * it on the request object and response headers. Uses the
 * `X-Request-ID` header when provided by an upstream proxy or client.
 *
 * @module signalforge/server/middleware/request-id
 */
const { randomUUID } = require('node:crypto');
const appConfig = require('../config/app.config.js');

const HEADER_NAME = appConfig.requestIdHeader;
function requestIdMiddleware(req, res, next) {
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
module.exports = requestIdMiddleware;
module.exports.requestIdMiddleware = requestIdMiddleware;
