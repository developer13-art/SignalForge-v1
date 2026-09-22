/**
 * Request Logger Middleware
 *
 * Logs incoming HTTP requests and their outcomes using pino-http.
 * Attaches a child logger to the request object for downstream use.
 *
 * @module signalforge/server/middleware/request-logger
 */

import pinoHttp from 'pino-http';

import { getLogger } from '../bootstrap/initLogger.js';
import loggerConfig from '../config/logger.config.js';

export function requestLoggerMiddleware() {
  const logger = getLogger('http');

  return pinoHttp({
    logger,
    genReqId: (req) => req.id,
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} completed with ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} failed: ${err.message}`;
    },
    customAttributeKeys: {
      req: 'request',
      res: 'response',
      err: 'error',
      responseTime: 'durationMs',
    },
    serializers: loggerConfig.serializers,
    autoLogging: {
      ignore: (req) => {
        if (req.url === '/api/health' || req.url === '/api/health/live' || req.url === '/api/health/ready') {
          return true;
        }
        if (req.url.startsWith('/metrics')) {
          return true;
        }
        return false;
      },
    },
    quietReqLogger: true,
  });
}

export default requestLoggerMiddleware;