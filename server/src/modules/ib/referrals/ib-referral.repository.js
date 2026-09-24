/**
 * IB Referral Repository
 *
 * Persistence layer for IB referrals.
 *
 * @module server/modules/ib/referrals/ib-referral.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

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

export async function findById({ referralId }) {
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

export async function listByPartner({ partnerUserId, pagination = {} }) {
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT * FROM ib_referrals
      WHERE partner_user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [partnerUserId, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM ib_referrals WHERE partner_user_id = $1`,
    [partnerUserId],
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function listActiveByPartner({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM ib_referrals
      WHERE partner_user_id = $1 AND status = 'ACTIVE'
      ORDER BY created_at DESC`,
    [partnerUserId],
  );
  return rows;
}

export async function updateStatus({ referralId, status }) {
  const { rowCount } = await db.query(
    `UPDATE ib_referrals
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
       COUNT(*) FILTER (WHERE status = 'SUSPENDED')::int AS suspended,
       COUNT(*) FILTER (WHERE status = 'TERMINATED')::int AS terminated
       FROM ib_referrals
      WHERE partner_user_id = $1`,
    [partnerUserId],
  );
  return rows[0] || { total: 0, active: 0, inactive: 0, suspended: 0, terminated: 0 };
}

export const ibReferralRepository = {
  insertReferral,
  findById,
  findByReferredUserId,
  listByPartner,
  listActiveByPartner,
  updateStatus,
  countByPartner,
};