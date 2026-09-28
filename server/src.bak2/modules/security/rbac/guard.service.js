/**
 * Guard Service
 *
 * Composable request guards used across the platform. Each guard is
 * a small, pure function that inspects the request context and
 * throws an AppError if the request should not proceed.
 *
 * @module server/modules/security/rbac/guard.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { ACCOUNT_STATUSES } = require('@signalforge/shared/constants/account-statuses');
const { KYC_STATUSES } = require('@signalforge/shared/constants/kyc-statuses');
function requireAuthenticated(user) {
  if (!user || !user.id) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return user;
}
function requireEmailVerified(user) {
  requireAuthenticated(user);

  if (!user.email_verified_at && !user.emailVerifiedAt) {
    throw new AppError(
      'Email verification required',
      ERROR_CODES.EMAIL_VERIFICATION_REQUIRED,
      403,
    );
  }

  return user;
}
function requireActiveAccount(user) {
  requireAuthenticated(user);

  if (user.status !== ACCOUNT_STATUSES.ACTIVE) {
    throw new AppError('Account is not active', ERROR_CODES.ACCOUNT_INACTIVE, 403);
  }

  return user;
}
function requireKycVerified(user) {
  requireAuthenticated(user);

  if (user.kyc_status !== KYC_STATUSES.VERIFIED && user.kycStatus !== KYC_STATUSES.VERIFIED) {
    throw new AppError(
      'KYC verification required',
      ERROR_CODES.KYC_REQUIRED,
      403,
    );
  }

  return user;
}
function requireFeaturePermission(user, permission) {
  requireAuthenticated(user);

  if (!permission) {
    throw new AppError('permission is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  if (permissions.includes('*') || permissions.includes(permission)) {
    return user;
  }

  throw new AppError('Permission denied', ERROR_CODES.AUTHORIZATION_FAILED, 403);
}
function requireRole(user, roleNames) {
  requireAuthenticated(user);

  if (!Array.isArray(roleNames) || roleNames.length === 0) {
    throw new AppError('roleNames must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];

  if (roles.some((r) => roleNames.includes(r))) {
    return user;
  }

  throw new AppError('Role required', ERROR_CODES.AUTHORIZATION_FAILED, 403);
}
const guardService = {
  requireAuthenticated,
  requireEmailVerified,
  requireActiveAccount,
  requireKycVerified,
  requireFeaturePermission,
  requireRole,
};
module.exports.guardService = guardService;
module.exports.requireAuthenticated = requireAuthenticated;
module.exports.requireEmailVerified = requireEmailVerified;
module.exports.requireActiveAccount = requireActiveAccount;
module.exports.requireKycVerified = requireKycVerified;
module.exports.requireFeaturePermission = requireFeaturePermission;
module.exports.requireRole = requireRole;
