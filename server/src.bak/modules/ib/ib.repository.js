/**
 * IB Repository
 *
 * Low-level persistence for IB partners, links, referrals, and revenue
 * entries. Used by the IB service and administrative reporting.
 *
 * @module server/modules/ib/ib.repository
 */

import { db } from '../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function findPartnerByUserId({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_partners WHERE user_id = $1 LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

export async function insertPartner({ userId, tier = 'STANDARD' }) {
  const { rows } = await db.query(
    `INSERT INTO ib_partners
       (user_id, status, tier, created_at, updated_at)
     VALUES ($1, 'ACTIVE', $2, $3, $3)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [userId, tier, nowIso()],
  );
  return rows[0] || null;
}

export async function updatePartnerStatus({ partnerId, status }) {
  const { rowCount } = await db.query(
    `UPDATE ib_partners
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), partnerId],
  );
  return rowCount > 0;
}

export async function updatePartnerTier({ partnerId, tier }) {
  const { rowCount } = await db.query(
    `UPDATE ib_partners
        SET tier = $1, updated_at = $2
      WHERE id = $3`,
    [tier, nowIso(), partnerId],
  );
  return rowCount > 0;
}

export async function findLinkById({ linkId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links WHERE id = $1 LIMIT 1`,
    [linkId],
  );
  return rows[0] || null;
}

export async function findLinkByCode({ code }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links WHERE code = $1 LIMIT 1`,
    [code],
  );
  return rows[0] || null;
}

export async function listLinksByUser({ userId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_links
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function deactivateLink({ linkId, userId }) {
  const { rowCount } = await db.query(
    `UPDATE ib_links
        SET active = FALSE, updated_at = $1
      WHERE id = $2 AND user_id = $3`,
    [nowIso(), linkId, userId],
  );
  return rowCount > 0;
}

export async function insertReferral({
  partnerUserId,
  referredUserId,
  brokerAccountId,
  ibLinkId,
  source,
  status = 'ACTIVE',
}) {
  const { rows } = await db.query(
    `INSERT INTO ib_referrals
       (partner_user_id, referred_user_id, broker_account_id, ib_link_id, status, source, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [
      partnerUserId,
      referredUserId,
      brokerAccountId || null,
      ibLinkId || null,
      status,
      source || null,
      nowIso(),
    ],
  );
  return rows[0];
}

export async function findReferralById({ referralId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_referrals WHERE id = $1 LIMIT 1`,
    [referralId],
  );
  return rows[0] || null;
}

export async function findByReferredUserId({ referredUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_referrals WHERE referred_user_id = $1 LIMIT 1`,
    [referredUserId],
  );
  return rows[0] || null;
}

export async function countReferralsByPartner({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
       FROM ib_referrals
      WHERE partner_user_id = $1`,
    [partnerUserId],
  );
  return rows[0] || { total: 0, active: 0 };
}

export async function insertRevenueEntry({
  partnerUserId,
  referralId,
  amount,
  currency = 'USD',
  status = 'PENDING',
  description,
}) {
  const { rows } = await db.query(
    `INSERT INTO ib_revenue_entries
       (partner_user_id, referral_id, amount, currency, status, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [partnerUserId, referralId || null, amount, currency, status, description || null, nowIso()],
  );
  return rows[0];
}

export async function aggregateRevenueByPartner({ partnerUserId, from, to }) {
  const conditions = ['partner_user_id = $1'];
  const params = [partnerUserId];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const { rows } = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::numeric AS pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::numeric AS paid,
       COUNT(*)::int AS total_count
       FROM ib_revenue_entries
       ${where}`,
    params,
  );

  return rows[0] || { pending: 0, paid: 0, total_count: 0 };
}

export const ibRepository = {
  findPartnerByUserId,
  insertPartner,
  updatePartnerStatus,
  updatePartnerTier,
  findLinkById,
  findLinkByCode,
  listLinksByUser,
  deactivateLink,
  insertReferral,
  findReferralById,
  findByReferredUserId,
  countReferralsByPartner,
  insertRevenueEntry,
  aggregateRevenueByPartner,
};