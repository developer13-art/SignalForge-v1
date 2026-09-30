/**
 * Resolve Home
 *
 * Given the authenticated user and their roles, return the route
 * where the application should send them after login or after a
 * guarded route redirect. Roles are checked in priority order so
 * that an account with multiple roles lands in the most privileged
 * console it is entitled to.
 *
 * @module client/src/lib/utils/resolveHome
 */

const ROLE_TO_HOME = [
  // Highest privilege first.
  { role: 'SUPER_ADMIN', path: '/admin' },
  { role: 'ADMIN', path: '/admin' },
  { role: 'FINANCE_ADMIN', path: '/executive' },
  { role: 'COMPLIANCE_OFFICER', path: '/compliance' },
  { role: 'SUPPORT', path: '/support/console' },
  { role: 'MODERATOR', path: '/support/console' },
  { role: 'PROVIDER', path: '/provider/dashboard' },
  { role: 'TRADER', path: '/trading' },
  { role: 'USER', path: '/dashboard' },
];

const DEFAULT_HOME = '/dashboard';

/**
 * Resolve the landing route for an authenticated user.
 *
 * @param {object|null} user - the user object returned by the API
 * @param {string[]} roles - the roles array returned by the API
 * @returns {string} the path to navigate to
 */
export function resolveHome(user, roles) {
  const effectiveRoles = Array.isArray(roles) && roles.length > 0
    ? roles
    : user && Array.isArray(user.roles)
    ? user.roles
    : [];

  if (effectiveRoles.length === 0) {
    return DEFAULT_HOME;
  }

  for (const entry of ROLE_TO_HOME) {
    if (effectiveRoles.includes(entry.role)) {
      return entry.path;
    }
  }

  return DEFAULT_HOME;
}

/**
 * Same as resolveHome, but also confirms the roles array actually
 * contains the role. Used by ProtectedRoute to decide whether a
 * user has access to the route they requested.
 */
export function userHasRole(roles, requiredRoles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some((role) => roles.includes(role));
}

export default resolveHome;