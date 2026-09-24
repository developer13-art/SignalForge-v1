/**
 * IB Service
 *
 * Top-level orchestration for Introducing Broker operations. Manages
 * broker referral links, referral tracking, and IB revenue
 * aggregation.
 *
 * @module server/modules/ib/ib.service
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
import { ibLinkService } from './links/ib-link.service';
import { ibReferralService } from './referrals/ib-referral.service';
import { ibRevenueService } from './revenue/ib-revenue.service';

function generateCode() {
  return crypto.randomBytes(8).toString('hex');
}

export async function getDashboard({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: partnerRows } = await db.query(
    `SELECT id, status, tier, created_at
       FROM ib_partners
      WHERE user_id = $1
      LIMIT 1`,
    [userId],
  );

  const partner = partnerRows[0] || null;

  const { rows: statsRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_referrals,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_referrals
       FROM ib_referrals
      WHERE partner_user_id = $1`,
    [userId],
  );

  const stats = statsRows[0] || { total_referrals: 0, active_referrals: 0 };

  const { rows: revenueRows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid
       FROM ib_revenue_entries
      WHERE partner_user_id = $1`,
    [userId],
  );

  const revenue = revenueRows[0] || { pending: 0, paid: 0 };

  return {
    partner: partner
      ? { partnerId: partner.id, status: partner.status, tier: partner.tier, createdAt: partner.created_at }
      : null,
    stats: {
      totalReferrals: stats.total_referrals,
      activeReferrals: stats.active_referrals,
    },
    revenue: {
      pendingAmount: Number(revenue.pending),
      paidAmount: Number(revenue.paid),
    },
  };
}

export async function listLinks({ userId }) {
  return ibLinkService.listLinks({ userId });
}

export async function createLink({ userId, brokerId, label, destination }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const code = generateCode();

  const { rows } = await db.query(
    `INSERT INTO ib_links
       (user_id, broker_id, code, label, destination, active, clicks, conversions, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, 0, 0, $6, $6)
     RETURNING id, code, broker_id, label, destination, active, created_at`,
    [userId, brokerId || null, code, label || null, destination || null, nowIso()],
  );

  const row = rows[0];

  return {
    linkId: row.id,
    code: row.code,
    brokerId: row.broker_id,
    label: row.label,
    destination: row.destination,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function deactivateLink({ userId, linkId }) {
  if (!userId || !linkId) {
    throw new AppError('userId and linkId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE ib_links
        SET active = FALSE, updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), linkId, userId],
  );

  if (rowCount === 0) {
    throw new AppError('IB link not found', ERROR_CODES.NOT_FOUND, 404);
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
    `SELECT COUNT(*)::int AS total FROM ib_referrals ${where}`,
    params,
  );

  const total = countResult.rows[0]?.total || 0;

  const { rows } = await db.query(
    `SELECT id, referred_user_id, broker_account_id, status, source, created_at
       FROM ib_referrals
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
      brokerAccountId: row.broker_account_id,
      status: row.status,
      source: row.source,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function getRevenue({ userId, from, to }) {
  return ibRevenueService.getRevenueSummary({ userId, from, to });
}

export async function listRevenueEntries({ userId, filters = {}, pagination = {} }) {
  return ibRevenueService.listRevenueEntries({ userId, filters, pagination });
}

export async function registerPartner({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `INSERT INTO ib_partners
       (user_id, status, tier, created_at, updated_at)
     VALUES ($1, 'ACTIVE', 'STANDARD', $2, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING id, status, tier, created_at`,
    [userId, nowIso()],
  );

  if (!rows[0]) {
    const existing = await db.query(
      `SELECT id, status, tier, created_at FROM ib_partners WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return existing.rows[0] || null;
  }

  logger.info({ userId }, 'IB partner registered');

  return rows[0];
}

export async function recordReferral({ partnerUserId, referredUserId, brokerAccountId, source }) {
  return ibReferralService.recordReferral({
    partnerUserId,
    referredUserId,
    brokerAccountId,
    source,
  });
}

export const ibService = {
  getDashboard,
  listLinks,
  createLink,
  deactivateLink,
  listReferrals,
  getRevenue,
  listRevenueEntries,
  registerPartner,
  recordReferral,
};