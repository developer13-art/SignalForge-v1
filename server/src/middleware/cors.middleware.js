/**
 * CORS Middleware
 *
 * Applies Cross-Origin Resource Sharing rules to the Express
 * application using the configuration defined in `cors.config.js`.
 *
 * @module signalforge/server/middleware/cors
 */

import cors from 'cors';

import corsConfig from '../config/cors.config.js';

export function corsMiddleware() {
  if (!corsConfig.enabled) {
    return (req, res, next) => next();
  }

  const originOption = corsConfig.originWildcard
    ? '*'
    : (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        if (corsConfig.origins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not permitted by CORS`));
      };

  return cors({
    origin: originOption,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders,
    credentials: corsConfig.credentials && !corsConfig.originWildcard,
    maxAge: corsConfig.maxAge,
    preflightContinue: corsConfig.preflightContinue,
    optionsSuccessStatus: corsConfig.optionsSuccessStatus,
  });
}

export default corsMiddleware;