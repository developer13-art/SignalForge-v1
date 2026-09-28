/**
 * Affiliate Referral Repository
 *
 * Persistence layer for affiliate referrals. Provides low-level data
 * access used by the affiliate referral service and admin queries.
 *
 * @module server/modules/affiliate/referrals/affiliate-referral.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function insertReferral({
  partnerUserId,
  referredUserId,
  affiliateLinkId,
  source,
  status = 'ACTIVE',
}) {
  const { rows } = await db.query(
    `INSERT INTO affiliate_referrals
       (partner_user_id, referred_user_id, affiliate_link_id, status, source, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     RETURNING *`,
    [partnerUserId, referredUserId, affiliateLinkId, status, source || null, nowIso()],
  );
  return rows[0];
}

export async function findById({ referralId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_referrals WHERE id = $1 LIMIT 1`,
    [referralId],
  );
  return rows[0] || null;
}

export async function findByReferredUserId({ referredUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_referrals WHERE referred_user_id = $1 LIMIT 1`,
    [referredUserId],
  );
  return rows[0] || null;
}

export async function findByPartnerUserId({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_referrals
      WHERE partner_user_id = $1
      ORDER BY created_at DESC`,
    [partnerUserId],
  );
  return rows;
}

export async function findActiveByPartnerUserId({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_referrals
      WHERE partner_user_id = $1 AND status = 'ACTIVE'
      ORDER BY created_at DESC`,
    [partnerUserId],
  );
  return rows;
}

export async function updateStatus({ referralId, status }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_referrals
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), referralId],
  );
  return rowCount > 0;
}

export async function countByPartner({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
       COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS inactive,
       COUNT(*) FILTER (WHERE status = 'SUSPENDED')::int AS suspended
       FROM affiliate_referrals
      WHERE partner_user_id = $1`,
    [partnerUserId],
  );
  return rows[0] || { total: 0, active: 0, inactive: 0, suspended: 0 };
}

export async function listReferrals({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.partnerUserId) {
    params.push(filters.partnerUserId);
    conditions.push(`partner_user_id = $${params.length}`);
  }

  if (filters.referredUserId) {
    params.push(filters.referredUserId);
    conditions.push(`referred_user_id = $${params.length}`);
  }

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

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM affiliate_referrals
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_referrals ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export const affiliateReferralRepository = {
  insertReferral,
  findById,
  findByReferredUserId,
  findByPartnerUserId,
  findActiveByPartnerUserId,
  updateStatus,
  countByPartner,
  listReferrals,
};