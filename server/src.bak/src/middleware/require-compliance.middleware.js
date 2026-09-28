/**
 * Require Compliance Middleware
 *
 * Rejects the request unless the authenticated user has the
 * COMPLIANCE_OFFICER role or is an administrator.
 *
 * @module signalforge/server/middleware/require-compliance
 */
const { AuthorizationError } = require('../lib/errors/authorization-error.js');

const COMPLIANCE_ROLES = ['COMPLIANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN'];
function requireComplianceMiddleware() {
  return function requireCompliance(req, res, next) {
    if (!req.user) {
      return next(
        new AuthorizationError('Authentication required', {
          code: 'AUTH_REQUIRED',
        }),
      );
    }

    const roles = req.user.roles || [req.user.role].filter(Boolean);
    if (!roles.some((role) => COMPLIANCE_ROLES.includes(role))) {
      return next(
        new AuthorizationError('Compliance role required', {
          code: 'COMPLIANCE_ROLE_REQUIRED',
        }),
      );
    }

    return next();
  };
}
module.exports = requireComplianceMiddleware;
module.exports.requireComplianceMiddleware = requireComplianceMiddleware;
