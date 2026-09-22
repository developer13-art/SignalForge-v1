/**
 * RBAC Module Errors
 *
 * @module signalforge/server/modules/rbac/errors
 */

import { ConflictError } from '../../lib/errors/conflict-error.js';
import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class RoleNotFoundError extends NotFoundError {
  constructor(message = 'Role not found', details = {}) {
    super(message, { code: 'ROLE_NOT_FOUND', details });
    this.name = 'RoleNotFoundError';
  }
}

export class PermissionNotFoundError extends NotFoundError {
  constructor(message = 'Permission not found', details = {}) {
    super(message, { code: 'PERMISSION_NOT_FOUND', details });
    this.name = 'PermissionNotFoundError';
  }
}

export class RoleAlreadyExistsError extends ConflictError {
  constructor(message = 'Role already exists') {
    super(message, { code: 'ROLE_ALREADY_EXISTS' });
    this.name = 'RoleAlreadyExistsError';
  }
}

export class PermissionAlreadyExistsError extends ConflictError {
  constructor(message = 'Permission already exists') {
    super(message, { code: 'PERMISSION_ALREADY_EXISTS' });
    this.name = 'PermissionAlreadyExistsError';
  }
}

export class ProtectedRoleError extends AuthorizationError {
  constructor(message = 'Cannot modify a protected system role') {
    super(message, { code: 'PROTECTED_ROLE' });
    this.name = 'ProtectedRoleError';
  }
}

export class ProtectedPermissionError extends AuthorizationError {
  constructor(message = 'Cannot modify a protected permission') {
    super(message, { code: 'PROTECTED_PERMISSION' });
    this.name = 'ProtectedPermissionError';
  }
}

export class RoleInUseError extends ConflictError {
  constructor(message = 'Role is assigned to users and cannot be deleted') {
    super(message, { code: 'ROLE_IN_USE' });
    this.name = 'RoleInUseError';
  }
}

export class UserRoleAlreadyAssignedError extends ConflictError {
  constructor(message = 'User already has this role') {
    super(message, { code: 'USER_ROLE_ALREADY_ASSIGNED' });
    this.name = 'UserRoleAlreadyAssignedError';
  }
}

export class UserRoleNotAssignedError extends ConflictError {
  constructor(message = 'User does not have this role') {
    super(message, { code: 'USER_ROLE_NOT_ASSIGNED' });
    this.name = 'UserRoleNotAssignedError';
  }
}

export class CannotRevokeLastAdminError extends AuthorizationError {
  constructor(message = 'Cannot revoke the last administrator role from this user') {
    super(message, { code: 'CANNOT_REVOKE_LAST_ADMIN' });
    this.name = 'CannotRevokeLastAdminError';
  }
}

export class InvalidRoleNameError extends ValidationError {
  constructor(message = 'Invalid role name') {
    super(message, { code: 'INVALID_ROLE_NAME' });
    this.name = 'InvalidRoleNameError';
  }
}

export class InvalidPermissionNameError extends ValidationError {
  constructor(message = 'Invalid permission name') {
    super(message, { code: 'INVALID_PERMISSION_NAME' });
    this.name = 'InvalidPermissionNameError';
  }
}