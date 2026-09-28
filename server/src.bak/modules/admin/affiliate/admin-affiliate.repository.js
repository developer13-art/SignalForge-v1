/**
 * Admin Affiliate Repository
 *
 * @module server/modules/admin/affiliate/admin-affiliate.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listPartners({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ap.status = $${params.length}`);
  }

  if (filters.tier) {
    params.push(filters.tier);
    conditions.push(`ap.tier = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ap.id, ap.user_id, ap.status, ap.tier, ap.created_at,
            u.email AS user_email,
            COUNT(ar.id)::int AS referral_count
       FROM affiliate_partners ap
       LEFT JOIN users u ON u.id = ap.user_id
       LEFT JOIN affiliate_referrals ar ON ar.partner_user_id = ap.user_id
       ${where}
       GROUP BY ap.id, u.email
       ORDER BY ap.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_partners ap ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findPartnerById({ partnerId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_partners WHERE id = $1 LIMIT 1`,
    [partnerId],
  );
  return rows[0] || null;
}

export async function updatePartnerStatus({ partnerId, status }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_partners
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), partnerId],
  );
  return rowCount > 0;
}

export async function updatePartnerTier({ partnerId, tier }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_partners
        SET tier = $1, updated_at = $2
      WHERE id = $3`,
    [tier, nowIso(), partnerId],
  );
  return rowCount > 0;
}

export async function listCommissions({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ac.status = $${params.length}`);
  }

  if (filters.partnerUserId) {
    params.push(filters.partnerUserId);
    conditions.push(`ac.partner_user_id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ac.id, ac.partner_user_id, ac.referral_id, ac.amount, ac.currency,
            ac.status, ac.description, ac.created_at, u.email AS partner_email
       FROM affiliate_commissions ac
       LEFT JOIN users u ON u.id = ac.partner_user_id
       ${where}
       ORDER BY ac.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM affiliate_commissions ac ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function countPartnersByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM affiliate_partners GROUP BY status`,
  );
  return rows;
}

export const adminAffiliateRepository = {
  listPartners,
  findPartnerById,
  updatePartnerStatus,
  updatePartnerTier,
  listCommissions,
  countPartnersByStatus,
};