/**
 * Cookie Parser Middleware
 *
 * Parses cookies on incoming requests using the configured cookie
 * secret.
 *
 * @module signalforge/server/middleware/cookie-parser
 */
const cookieParser = require('cookie-parser');
const securityConfig = require('../config/security.config.js');
function cookieParserMiddleware() {
  const secret = process.env.COOKIE_SECRET;

  if (secret) {
    return cookieParser(secret);
  }

  return cookieParser();
}
module.exports = cookieParserMiddleware;
module.exports.cookieParserMiddleware = cookieParserMiddleware;
