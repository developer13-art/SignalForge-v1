/**
 * RBAC Module Constants
 *
 * @module signalforge/server/modules/rbac/constants
 */

export const RBAC_EVENTS = Object.freeze({
  ROLE_CREATED: 'rbac.role.created',
  ROLE_UPDATED: 'rbac.role.updated',
  ROLE_DELETED: 'rbac.role.deleted',
  PERMISSION_CREATED: 'rbac.permission.created',
  PERMISSION_UPDATED: 'rbac.permission.updated',
  PERMISSION_DELETED: 'rbac.permission.deleted',
  ROLE_PERMISSION_GRANTED: 'rbac.role.permission.granted',
  ROLE_PERMISSION_REVOKED: 'rbac.role.permission.revoked',
  USER_ROLE_ASSIGNED: 'rbac.user.role.assigned',
  USER_ROLE_REVOKED: 'rbac.user.role.revoked',
});

export const SYSTEM_ROLES = Object.freeze([
  'USER',
  'PROVIDER',
  'TRADER',
  'MODERATOR',
  'COMPLIANCE_OFFICER',
  'FINANCE_ADMIN',
  'SUPPORT',
  'ADMIN',
  'SUPER_ADMIN',
]);

export const SYSTEM_PROTECTED_ROLES = Object.freeze([
  'SUPER_ADMIN',
  'ADMIN',
]);

export const PROTECTED_PERMISSIONS = Object.freeze([
  'admin.settings.manage',
  'admin.system.view',
  'security.threats.manage',
  'solana.program.manage',
]);

export const ROLE_ASSIGNMENT_MODES = Object.freeze({
  ADD: 'ADD',
  REPLACE: 'REPLACE',
});