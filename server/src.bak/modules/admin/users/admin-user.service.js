/**
 * Admin User Service
 *
 * Administrative business logic for user management: listing,
 * suspending, activating, deactivating, and impersonating.
 *
 * @module server/modules/admin/users/admin-user.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { ACCOUNT_STATUS_VALUES, ACCOUNT_STATUSES } from '@signalforge/shared/constants/account-statuses';
import * as repository from './admin-user.repository';
import { adminService } from '../admin.service';

export async function listUsers({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listUsers({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      userId: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      status: row.status,
      kycStatus: row.kyc_status,
      accountType: row.account_type,
      emailVerifiedAt: row.email_verified_at,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getUserDetails({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const user = await repository.findUserById({ userId });

  if (!user) {
    throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const sessions = await repository.listUserSessions({ userId });

  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    phone: user.phone,
    status: user.status,
    kycStatus: user.kyc_status,
    accountType: user.account_type,
    emailVerifiedAt: user.email_verified_at,
    phoneVerifiedAt: user.phone_verified_at,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    sessions: sessions.map((s) => ({
      sessionId: s.id,
      ipAddress: s.ip_address,
      userAgent: s.user_agent,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      revokedAt: s.revoked_at,
    })),
  };
}

export async function suspendUser({ userId, adminId, reason }) {
  if (!userId || !adminId) {
    throw new AppError('userId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const user = await repository.findUserById({ userId });

  if (!user) {
    throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (user.status === ACCOUNT_STATUSES.SUSPENDED) {
    return { suspended: false, reason: 'ALREADY_SUSPENDED' };
  }

  await repository.updateUserStatus({ userId, status: ACCOUNT_STATUSES.SUSPENDED });
  await repository.revokeAllSessions({ userId });

  await adminService.recordAdminAction({
    adminId,
    action: 'USER_SUSPEND',
    targetType: 'USER',
    targetId: userId,
    details: { reason },
  });

  logger.info({ userId, adminId, reason }, 'User suspended');

  return { suspended: true };
}

export async function activateUser({ userId, adminId }) {
  if (!userId || !adminId) {
    throw new AppError('userId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const user = await repository.findUserById({ userId });

  if (!user) {
    throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
  }

  if (user.status === ACCOUNT_STATUSES.ACTIVE) {
    return { activated: false, reason: 'ALREADY_ACTIVE' };
  }

  await repository.updateUserStatus({ userId, status: ACCOUNT_STATUSES.ACTIVE });

  await adminService.recordAdminAction({
    adminId,
    action: 'USER_ACTIVATE',
    targetType: 'USER',
    targetId: userId,
    details: { previousStatus: user.status },
  });

  logger.info({ userId, adminId }, 'User activated');

  return { activated: true };
}

export async function deactivateUser({ userId, adminId, reason }) {
  if (!userId || !adminId) {
    throw new AppError('userId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  await repository.updateUserStatus({ userId, status: ACCOUNT_STATUSES.DEACTIVATED });
  await repository.revokeAllSessions({ userId });

  await adminService.recordAdminAction({
    adminId,
    action: 'USER_DELETE',
    targetType: 'USER',
    targetId: userId,
    details: { reason },
  });

  logger.info({ userId, adminId, reason }, 'User deactivated');

  return { deactivated: true };
}

export async function revokeUserSessions({ userId, adminId }) {
  if (!userId || !adminId) {
    throw new AppError('userId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const count = await repository.revokeAllSessions({ userId });

  await adminService.recordAdminAction({
    adminId,
    action: 'USER_SUSPEND',
    targetType: 'USER',
    targetId: userId,
    details: { action: 'REVOKE_SESSIONS', count },
  });

  return { revoked: count };
}

export async function getStatusBreakdown() {
  const rows = await repository.countUsersByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminUserService = {
  listUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  deactivateUser,
  revokeUserSessions,
  getStatusBreakdown,
  VALID_STATUSES: ACCOUNT_STATUS_VALUES,
};