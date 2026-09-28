/**
 * Permission Checker Service
 *
 * Resolves a user's effective permissions from the database (roles
 * plus direct grants) and exposes helpers for checking them. Results
 * are cached per user for a short period to avoid repeated queries
 * on high-traffic endpoints.
 *
 * @module server/modules/security/rbac/permission-checker.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { db } from '../../../database';

const CACHE_TTL_MS = 60 * 1000;
const CACHE = new Map();

function readCache(userId) {
  const entry = CACHE.get(userId);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(userId);
    return null;
  }
  return entry.value;
}

function writeCache(userId, value) {
  CACHE.set(userId, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function resolvePermissions({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const cached = readCache(userId);
  if (cached) {
    return cached;
  }

  const { rows: roleRows } = await db.query(
    `SELECT r.name AS role_name, r.id AS role_id
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1`,
    [userId],
  );

  const roleNames = roleRows.map((r) => r.role_name);
  const roleIds = roleRows.map((r) => r.role_id);

  let permissions = [];

  if (roleIds.length > 0) {
    const { rows: permRows } = await db.query(
      `SELECT DISTINCT p.name AS permission_name
         FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = ANY($1)`,
      [roleIds],
    );
    permissions = permRows.map((r) => r.permission_name);
  }

  const { rows: directRows } = await db.query(
    `SELECT DISTINCT p.name AS permission_name
       FROM user_permissions up
       JOIN permissions p ON p.id = up.permission_id
      WHERE up.user_id = $1`,
    [userId],
  );

  const direct = directRows.map((r) => r.permission_name);

  const combined = Array.from(new Set([...permissions, ...direct]));

  const result = {
    userId,
    roles: roleNames,
    permissions: combined,
  };

  writeCache(userId, result);

  return result;
}

export async function hasPermission({ userId, permission }) {
  if (!permission) {
    throw new AppError('permission is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolved = await resolvePermissions({ userId });

  return resolved.permissions.includes('*') || resolved.permissions.includes(permission);
}

export async function hasAnyPermission({ userId, permissions }) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new AppError('permissions must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolved = await resolvePermissions({ userId });

  if (resolved.permissions.includes('*')) {
    return true;
  }

  return permissions.some((p) => resolved.permissions.includes(p));
}

export async function hasAllPermissions({ userId, permissions }) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new AppError('permissions must be a non-empty array', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolved = await resolvePermissions({ userId });

  if (resolved.permissions.includes('*')) {
    return true;
  }

  return permissions.every((p) => resolved.permissions.includes(p));
}

export async function hasRole({ userId, roleName }) {
  if (!roleName) {
    throw new AppError('roleName is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const resolved = await resolvePermissions({ userId });

  return resolved.roles.includes(roleName);
}

export function invalidateCache(userId) {
  if (userId) {
    CACHE.delete(userId);
  } else {
    CACHE.clear();
  }
}

export const permissionCheckerService = {
  resolvePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  invalidateCache,
};