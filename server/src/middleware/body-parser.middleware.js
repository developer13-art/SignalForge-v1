/**
 * Body Parser Middleware
 *
 * Parses JSON and URL-encoded request bodies. Webhook routes are
 * excluded here because signature verification requires the raw
 * body; those routes apply their own `express.raw()` handler in
 * `app.js` before this middleware.
 *
 * @module signalforge/server/middleware/body-parser
 */

import express from 'express';

import appConfig from '../config/app.config.js';

export function bodyParserMiddleware() {
  const limit = appConfig.maxRequestBodySize;

  const jsonParser = express.json({
    limit,
    strict: true,
    type: ['application/json', 'application/*+json'],
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  });

  const urlencodedParser = express.urlencoded({
    extended: true,
    limit,
    parameterLimit: 1000,
  });

  return (req, res, next) => {
    jsonParser(req, res, (err) => {
      if (err) {
        return next(err);
      }
      urlencodedParser(req, res, next);
    });
  };
}

export default bodyParserMiddleware;