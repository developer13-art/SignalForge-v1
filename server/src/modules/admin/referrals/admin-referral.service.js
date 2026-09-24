/**
 * Admin Referral Service
 *
 * @module server/modules/admin/referrals/admin-referral.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-referral.repository';
import { adminService } from '../admin.service';

export async function listRewards({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listReferralRewards({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      rewardId: row.id,
      referrerId: row.referrer_id,
      referrerEmail: row.referrer_email,
      referredUserId: row.referred_user_id,
      referredEmail: row.referred_email,
      settlementPeriod: row.settlement_period,
      eligibleNetProfit: Number(row.eligible_net_profit || 0),
      rewardRate: row.reward_rate,
      rewardAmount: Number(row.reward_amount || 0),
      status: row.status,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getRewardDetails({ rewardId }) {
  if (!rewardId) {
    throw new AppError('rewardId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const reward = await repository.findRewardById({ rewardId });

  if (!reward) {
    throw new AppError('Referral reward not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return reward;
}

export async function approveReward({ rewardId, adminId }) {
  if (!rewardId || !adminId) {
    throw new AppError('rewardId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateRewardStatus({ rewardId, status: 'APPROVED' });

  if (!updated) {
    throw new AppError('Referral reward not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'REFERRAL_REWARD',
    targetId: rewardId,
    details: { action: 'APPROVE_REWARD' },
  });

  logger.info({ rewardId, adminId }, 'Referral reward approved');

  return { approved: true };
}

export async function rejectReward({ rewardId, adminId, reason }) {
  if (!rewardId || !adminId) {
    throw new AppError('rewardId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateRewardStatus({ rewardId, status: 'REJECTED', reason });

  if (!updated) {
    throw new AppError('Referral reward not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'REFERRAL_REWARD',
    targetId: rewardId,
    details: { action: 'REJECT_REWARD', reason },
  });

  logger.info({ rewardId, adminId, reason }, 'Referral reward rejected');

  return { rejected: true };
}

export async function listRelationships({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listReferralRelationships({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      relationshipId: row.id,
      referrerId: row.referrer_id,
      referredUserId: row.referred_user_id,
      status: row.status,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function getRewardStatusBreakdown() {
  const rows = await repository.countRewardsByStatus();

  const breakdown = {};
  let totalAmount = 0;

  for (const row of rows) {
    breakdown[row.status] = {
      count: row.count,
      totalAmount: Number(row.total_amount || 0),
    };
    totalAmount += Number(row.total_amount || 0);
  }

  return { breakdown, totalAmount };
}

export const adminReferralService = {
  listRewards,
  getRewardDetails,
  approveReward,
  rejectReward,
  listRelationships,
  getRewardStatusBreakdown,
};