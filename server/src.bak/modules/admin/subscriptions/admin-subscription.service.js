/**
 * Admin Subscription Service
 *
 * @module server/modules/admin/subscriptions/admin-subscription.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-subscription.repository';
import { adminService } from '../admin.service';

export async function listSubscriptions({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listSubscriptions({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      subscriptionId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      planCode: row.plan_code,
      status: row.status,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      trialEndsAt: row.trial_ends_at,
      cancelledAt: row.cancelled_at,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getSubscriptionDetails({ subscriptionId }) {
  if (!subscriptionId) {
    throw new AppError('subscriptionId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const subscription = await repository.findSubscriptionById({ subscriptionId });

  if (!subscription) {
    throw new AppError('Subscription not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return subscription;
}

export async function cancelSubscription({ subscriptionId, adminId, reason }) {
  if (!subscriptionId || !adminId) {
    throw new AppError('subscriptionId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateSubscriptionStatus({ subscriptionId, status: 'CANCELLED' });

  if (!updated) {
    throw new AppError('Subscription not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SUBSCRIPTION_EXTEND',
    targetType: 'SUBSCRIPTION',
    targetId: subscriptionId,
    details: { action: 'CANCEL', reason },
  });

  logger.info({ subscriptionId, adminId, reason }, 'Subscription cancelled by admin');

  return { cancelled: true };
}

export async function extendSubscription({ subscriptionId, adminId, extensionDays }) {
  if (!subscriptionId || !adminId || !extensionDays) {
    throw new AppError('subscriptionId, adminId, and extensionDays are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const subscription = await repository.findSubscriptionById({ subscriptionId });

  if (!subscription) {
    throw new AppError('Subscription not found', ERROR_CODES.NOT_FOUND, 404);
  }

  const baseDate = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : new Date();

  const newEndDate = new Date(baseDate.getTime() + extensionDays * 24 * 60 * 60 * 1000).toISOString();

  await repository.extendSubscriptionPeriod({ subscriptionId, newEndDate });

  await adminService.recordAdminAction({
    adminId,
    action: 'SUBSCRIPTION_EXTEND',
    targetType: 'SUBSCRIPTION',
    targetId: subscriptionId,
    details: { extensionDays, newEndDate },
  });

  logger.info({ subscriptionId, adminId, extensionDays, newEndDate }, 'Subscription extended');

  return { extended: true, newEndDate };
}

export async function reactivateSubscription({ subscriptionId, adminId }) {
  if (!subscriptionId || !adminId) {
    throw new AppError('subscriptionId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateSubscriptionStatus({ subscriptionId, status: 'ACTIVE' });

  if (!updated) {
    throw new AppError('Subscription not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SUBSCRIPTION_EXTEND',
    targetType: 'SUBSCRIPTION',
    targetId: subscriptionId,
    details: { action: 'REACTIVATE' },
  });

  return { reactivated: true };
}

export async function getStatusBreakdown() {
  const rows = await repository.countByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}

export const adminSubscriptionService = {
  listSubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  extendSubscription,
  reactivateSubscription,
  getStatusBreakdown,
};