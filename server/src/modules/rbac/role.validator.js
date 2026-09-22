/**
 * Role Validators
 *
 * @module signalforge/server/modules/rbac/role-validator
 */

import { isValidPermission } from '@signalforge/shared/constants/permissions';

const ROLE_NAME_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/;

export function validateRoleCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('Role name is required');
  } else if (!ROLE_NAME_PATTERN.test(body.name)) {
    errors.push('Role name must be uppercase letters, numbers, and underscores, 3 to 64 characters, starting with a letter');
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 512) {
      errors.push('Description must not exceed 512 characters');
    }
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== 'number' || body.priority < 0 || body.priority > 1000) {
      errors.push('Priority must be a number between 0 and 1000');
    }
  }

  if (body.permissions !== undefined) {
    if (!Array.isArray(body.permissions)) {
      errors.push('Permissions must be an array');
    } else {
      for (const perm of body.permissions) {
        if (!isValidPermission(perm)) {
          errors.push(`Unknown permission: ${perm}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRoleUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 512) {
      errors.push('Description must not exceed 512 characters');
    }
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== 'number' || body.priority < 0 || body.priority > 1000) {
      errors.push('Priority must be a number between 0 and 1000');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRoleAssignPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.roleId && !body.roleName) {
    errors.push('Either roleId or roleName is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRolesReplacePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!Array.isArray(body.roles)) {
    errors.push('Roles must be an array');
  }

  if (!Array.isArray(body.roleIds) && !Array.isArray(body.roleNames)) {
    errors.push('Either roleIds or roleNames must be provided');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePermissionsUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!Array.isArray(body.permissions)) {
    errors.push('Permissions must be an array');
    return { valid: false, errors };
  }

  for (const perm of body.permissions) {
    if (!isValidPermission(perm)) {
      errors.push(`Unknown permission: ${perm}`);
    }
  }

  return { valid: errors.length === 0, errors };
}