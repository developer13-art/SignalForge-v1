/**
 * Auth Guard
 *
 * Middleware factory that requires a valid access token. Delegates to
 * the standard authentication middleware.
 *
 * @module signalforge/server/modules/auth/guards/auth
 */
const { authenticationMiddleware } = require('../../../middleware/authentication.middleware.js');
function authGuard() {
  return authenticationMiddleware();
}
module.exports = authGuard;
module.exports.authGuard = authGuard;
