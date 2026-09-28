/**
 * User Roles
 *
 * Defines all roles supported by the SignalForge platform. Roles are
 * assigned through the user_roles table and grant a set of permissions
 * defined in permissions.js.
 *
 * @module @signalforge/shared/constants/roles
 */const ROLES = Object.freeze({
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  TRADER: 'TRADER',
  MODERATOR: 'MODERATOR',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  SUPPORT: 'SUPPORT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
});const ROLE_VALUES = Object.freeze(Object.values(ROLES));const PRIVILEGED_ROLES = Object.freeze([
  ROLES.MODERATOR,
  ROLES.COMPLIANCE_OFFICER,
  ROLES.FINANCE_ADMIN,
  ROLES.SUPPORT,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
]);const ADMIN_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
]);const INTERNAL_ROLES = Object.freeze([
  ROLES.MODERATOR,
  ROLES.COMPLIANCE_OFFICER,
  ROLES.FINANCE_ADMIN,
  ROLES.SUPPORT,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
]);const EXTERNAL_ROLES = Object.freeze([
  ROLES.USER,
  ROLES.PROVIDER,
  ROLES.TRADER,
]);const ROLE_LABELS = Object.freeze({
  [ROLES.USER]: 'User',
  [ROLES.PROVIDER]: 'Signal Provider',
  [ROLES.TRADER]: 'Trader',
  [ROLES.MODERATOR]: 'Moderator',
  [ROLES.COMPLIANCE_OFFICER]: 'Compliance Officer',
  [ROLES.FINANCE_ADMIN]: 'Finance Administrator',
  [ROLES.SUPPORT]: 'Support Agent',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
});function isValidRole(role) {
  return ROLE_VALUES.includes(role);
}

module.exports.isValidRole = isValidRole;
module.exports.ROLES = ROLES;
module.exports.ROLE_VALUES = ROLE_VALUES;
module.exports.PRIVILEGED_ROLES = PRIVILEGED_ROLES;
module.exports.ADMIN_ROLES = ADMIN_ROLES;
module.exports.INTERNAL_ROLES = INTERNAL_ROLES;
module.exports.EXTERNAL_ROLES = EXTERNAL_ROLES;
module.exports.ROLE_LABELS = ROLE_LABELS;
