/**
 * Commission Service
 *
 * Calculates and records affiliate commissions based on referred user
 * activity. Uses a tier-based rate card and publishes commission
 * events on the platform event bus.
 *
 * @module server/modules/affiliate/commissions/commission.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';

const TIER_RATES = Object.freeze({
  STANDARD: 0.2,
  SILVER: 0.25,
  GOLD: 0.3,
  PLATINUM: 0.35,
  ENTERPRISE: 0.4,
});

function getRateForTier(tier) {
  return TIER_RATES[tier] || TIER_RATES.STANDARD;
}

export async function calculateCommission({
  partnerUserId,
  referralId,
  baseAmount,
  currency = 'USD',
  description,
}) {
  if (!partnerUserId || !referralId || baseAmount === undefined) {
    throw new AppError(
      'partnerUserId, referralId, and baseAmount are required',
      ERROR_CODES.VALIDATION_FAILED,
      400,
    );
  }

  const base = Number(baseAmount);

  if (!Number.isFinite(base) || base <= 0) {
    throw new AppError('baseAmount must be a positive number', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: partnerRows } = await db.query(
    `SELECT tier FROM affiliate_partners WHERE user_id = $1 LIMIT 1`,
    [partnerUserId],
  );

  const tier = partnerRows[0]?.tier || 'STANDARD';
  const rate = getRateForTier(tier);

  const commissionAmount = Number((base * rate).toFixed(8));

  const { rows } = await db.query(
    `INSERT INTO affiliate_commissions
       (partner_user_id, referral_id, amount, currency, status, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $6)
     RETURNING id, status, created_at`,
    [partnerUserId, referralId, commissionAmount, currency, description || null, nowIso()],
  );

  const commission = rows[0];

  await publishEvent({
    eventType: EVENT_TYPES.AFFILIATE_COMMISSION_CALCULATED,
    source: 'commission.service',
    actorId: partnerUserId,
    payload: {
      commissionId: commission.id,
      partnerUserId,
      referralId,
      baseAmount: base,
      rate,
      tier,
      amount: commissionAmount,
      currency,
    },
  });

  logger.info(
    { partnerUserId, referralId, commissionId: commission.id, amount: commissionAmount },
    'Affiliate commission calculated',
  );

  return {
    commissionId: commission.id,
    partnerUserId,
    referralId,
    baseAmount: base,
    rate,
    tier,
    amount: commissionAmount,
    currency,
    status: commission.status,
    createdAt: commission.created_at,
  };
}

export async function approveCommission({ commissionId, reviewerId }) {
  if (!commissionId) {
    throw new AppError('commissionId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'APPROVED',
            approved_at = $1,
            updated_at = $1
      WHERE id = $2 AND status = 'PENDING'`,
    [nowIso(), commissionId],
  );

  if (rowCount === 0) {
    throw new AppError('Commission not found or not in PENDING status', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ commissionId, reviewerId }, 'Affiliate commission approved');

  return { approved: true };
}

export async function rejectCommission({ commissionId, reviewerId, reason }) {
  if (!commissionId) {
    throw new AppError('commissionId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'REJECTED',
            rejection_reason = $1,
            updated_at = $2
      WHERE id = $3 AND status IN ('PENDING', 'APPROVED')`,
    [reason || null, nowIso(), commissionId],
  );

  if (rowCount === 0) {
    throw new AppError('Commission not found or not in a rejectable state', ERROR_CODES.NOT_FOUND, 404);
  }

  logger.info({ commissionId, reviewerId, reason }, 'Affiliate commission rejected');

  return { rejected: true };
}

export async function markCommissionPaid({ commissionId }) {
  if (!commissionId) {
    throw new AppError('commissionId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'PAID',
            paid_at = $1,
            updated_at = $1
      WHERE id = $2 AND status = 'APPROVED'`,
    [nowIso(), commissionId],
  );

  if (rowCount === 0) {
    throw new AppError('Commission not found or not in APPROVED status', ERROR_CODES.NOT_FOUND, 404);
  }

  return { paid: true };
}

export async function getCommissionSummary({ partnerUserId }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS approved,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid,
       COALESCE(SUM(amount) FILTER (WHERE status = 'REJECTED'), 0)::numeric AS rejected,
       COUNT(*)::int AS total_count
       FROM affiliate_commissions
      WHERE partner_user_id = $1`,
    [partnerUserId],
  );

  const row = rows[0] || { pending: 0, approved: 0, paid: 0, rejected: 0, total_count: 0 };

  return {
    pendingAmount: Number(row.pending),
    approvedAmount: Number(row.approved),
    paidAmount: Number(row.paid),
    rejectedAmount: Number(row.rejected),
    totalCount: row.total_count,
  };
}

export async function listCommissions({ partnerUserId, filters = {}, pagination = {} }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const conditions = ['partner_user_id = $1'];
  const params = [partnerUserId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM affiliate_commissions
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_commissions ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export const commissionService = {
  calculateCommission,
  approveCommission,
  rejectCommission,
  markCommissionPaid,
  getCommissionSummary,
  listCommissions,
  TIER_RATES,
};