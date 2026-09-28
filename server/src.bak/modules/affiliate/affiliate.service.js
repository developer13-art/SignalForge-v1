/**
 * Affiliate Service
 *
 * Top-level orchestration service for affiliate operations. Coordinates
 * link creation, referral tracking, commission aggregation, and
 * withdrawals.
 *
 * @module server/modules/affiliate/affiliate.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import { logger } from '../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../database';
import { publishEvent } from '../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import { validateAmount, validateCurrency } from '../wallets/wallet.validator';
import { affiliateReferralService } from './referrals/affiliate-referral.service';
import { commissionService } from './commissions/commission.service';

function generateLinkCode() {
  return crypto.randomBytes(8).toString('hex');
}

export async function getDashboard({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: partnerRows } = await db.query(
    `SELECT id, status, tier, created_at
       FROM affiliate_partners
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const partner = partnerRows[0] || null;

  const { rows: statsRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_referrals,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_referrals
       FROM affiliate_referrals
      WHERE partner_user_id = $1`,
    [userId],
  );

  const stats = statsRows[0] || { total_referrals: 0, active_referrals: 0 };

  const { rows: commissionRows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending_amount,
       COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS approved_amount,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid_amount
       FROM affiliate_commissions
      WHERE partner_user_id = $1`,
    [userId],
  );

  const commissions = commissionRows[0] || { pending_amount: 0, approved_amount: 0, paid_amount: 0 };

  return {
    partner: partner
      ? { partnerId: partner.id, status: partner.status, tier: partner.tier, createdAt: partner.created_at }
      : null,
    stats: {
      totalReferrals: stats.total_referrals,
      activeReferrals: stats.active_referrals,
    },
    commissions: {
      pendingAmount: Number(commissions.pending_amount),
      approvedAmount: Number(commissions.approved_amount),
      paidAmount: Number(commissions.paid_amount),
    },
  };
}

export async function listLinks({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, code, label, destination, active, clicks, conversions, created_at
       FROM affiliate_links
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    linkId: row.id,
    code: row.code,
    label: row.label,
    destination: row.destination,
    active: row.active,
    clicks: row.clicks,
    conversions: row.conversions,
    createdAt: row.created_at,
  }));
}

export async function createLink({ userId, label, destination }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const code = generateLinkCode();

  const { rows } = await db.query(
    `INSERT INTO affiliate_links
       (user_id, code, label, destination, active, clicks, conversions, created_at, updated_at)
     VALUES ($1, $2, $3, $4, TRUE, 0, 0, $5, $5)
     RETURNING id, code, label, destination, active, clicks, conversions, created_at`,
    [userId, code, label || null, destination || null, nowIso()],
  );

  const row = rows[0];

  return {
    linkId: row.id,
    code: row.code,
    label: row.label,
    destination: row.destination,
    active: row.active,
    clicks: row.clicks,
    conversions: row.conversions,
    createdAt: row.created_at,
  };
}

export async function deactivateLink({ userId, linkId }) {
  if (!userId || !linkId) {
    throw new AppError('userId and linkId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE affiliate_links
        SET active = FALSE, updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), linkId, userId],
  );

  if (rowCount === 0) {
    throw new AppError('Link not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { deactivated: true };
}

export async function listReferrals({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const conditions = ['partner_user_id = $1'];
  const params = [userId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_referrals ${where}`,
    params,
  );

  const total = countResult.rows[0]?.total || 0;

  const { rows } = await db.query(
    `SELECT id, referred_user_id, status, source, created_at
       FROM affiliate_referrals
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return {
    items: rows.map((row) => ({
      referralId: row.id,
      referredUserId: row.referred_user_id,
      status: row.status,
      source: row.source,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function listCommissions({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const conditions = ['partner_user_id = $1'];
  const params = [userId];

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

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_commissions ${where}`,
    params,
  );

  const total = countResult.rows[0]?.total || 0;

  const { rows } = await db.query(
    `SELECT id, referral_id, amount, currency, status, description, created_at
       FROM affiliate_commissions
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return {
    items: rows.map((row) => ({
      commissionId: row.id,
      referralId: row.referral_id,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function getCommissionSummary({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS approved,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid,
       COUNT(*)::int AS total_count
       FROM affiliate_commissions
      WHERE partner_user_id = $1`,
    [userId],
  );

  const row = rows[0] || { pending: 0, approved: 0, paid: 0, total_count: 0 };

  return {
    pendingAmount: Number(row.pending),
    approvedAmount: Number(row.approved),
    paidAmount: Number(row.paid),
    totalCount: row.total_count,
  };
}

export async function requestWithdrawal({ userId, amount, method, notes }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validatedAmount = validateAmount(amount, { min: 10, fieldName: 'amount' });
  const validatedMethod = method ? String(method).trim().toUpperCase() : null;

  if (!validatedMethod || !['BANK_TRANSFER', 'CRYPTO'].includes(validatedMethod)) {
    throw new AppError('Invalid withdrawal method', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: availableRows } = await db.query(
    `SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'APPROVED'), 0)::numeric AS available
       FROM affiliate_commissions
      WHERE partner_user_id = $1`,
    [userId],
  );

  const available = Number(availableRows[0]?.available || 0);

  if (validatedAmount > available) {
    throw new AppError('Insufficient approved commission balance', ERROR_CODES.INSUFFICIENT_BALANCE, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO withdrawal_requests
       (user_id, amount, currency, method, source, status, notes, created_at, updated_at)
     VALUES ($1, $2, 'USD', $3, 'AFFILIATE', 'PENDING', $4, $5, $5)
     RETURNING id, status, created_at`,
    [userId, validatedAmount, validatedMethod, notes || null, nowIso()],
  );

  const row = rows[0];

  await publishEvent({
    eventType: EVENT_TYPES.WITHDRAWAL_REQUESTED,
    source: 'affiliate.service',
    actorId: userId,
    payload: {
      withdrawalId: row.id,
      userId,
      amount: validatedAmount,
      method: validatedMethod,
      source: 'AFFILIATE',
    },
  });

  return {
    withdrawalId: row.id,
    amount: validatedAmount,
    method: validatedMethod,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listWithdrawals({ userId, filters = {}, pagination = {} }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { page, limit, offset } = normalizePagination(pagination);

  const conditions = ['user_id = $1', `source = 'AFFILIATE'`];
  const params = [userId];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM withdrawal_requests ${where}`,
    params,
  );

  const total = countResult.rows[0]?.total || 0;

  const { rows } = await db.query(
    `SELECT id, amount, currency, method, status, notes, created_at, processed_at
       FROM withdrawal_requests
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return {
    items: rows.map((row) => ({
      withdrawalId: row.id,
      amount: Number(row.amount),
      currency: row.currency,
      method: row.method,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      processedAt: row.processed_at,
    })),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function registerPartner({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO affiliate_partners
       (user_id, status, tier, created_at, updated_at)
     VALUES ($1, 'ACTIVE', 'STANDARD', $2, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING id, status, tier, created_at`,
    [userId, nowIso()],
  );

  if (!rows[0]) {
    const existing = await db.query(
      `SELECT id, status, tier, created_at FROM affiliate_partners WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return existing.rows[0] || null;
  }

  logger.info({ userId }, 'Affiliate partner registered');

  return rows[0];
}

export const affiliateService = {
  getDashboard,
  listLinks,
  createLink,
  deactivateLink,
  listReferrals,
  listCommissions,
  getCommissionSummary,
  requestWithdrawal,
  listWithdrawals,
  registerPartner,
  recordReferral: affiliateReferralService.recordReferral,
  calculateCommission: commissionService.calculateCommission,
};