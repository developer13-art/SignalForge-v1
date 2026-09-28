/**
 * Cookie Parser Middleware
 *
 * Parses cookies on incoming requests using the configured cookie
 * secret.
 *
 * @module signalforge/server/middleware/cookie-parser
 */

import cookieParser from 'cookie-parser';

import securityConfig from '../config/security.config.js';

export function cookieParserMiddleware() {
  const secret = process.env.COOKIE_SECRET;

  if (secret) {
    return cookieParser(secret);
  }

  return cookieParser();
}

export default cookieParserMiddleware;