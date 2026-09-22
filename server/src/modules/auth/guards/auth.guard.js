/**
 * Auth Guard
 *
 * Middleware factory that requires a valid access token. Delegates to
 * the standard authentication middleware.
 *
 * @module signalforge/server/modules/auth/guards/auth
 */

import { authenticationMiddleware } from '../../../middleware/authentication.middleware.js';

export function authGuard() {
  return authenticationMiddleware();
}

export default authGuard;