/**
 * Admin Referral Repository
 *
 * @module server/modules/admin/referrals/admin-referral.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listReferralRewards({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`rr.status = $${params.length}`);
  }

  if (filters.referrerId) {
    params.push(filters.referrerId);
    conditions.push(`rr.referrer_id = $${params.length}`);
  }

  if (filters.settlementPeriod) {
    params.push(filters.settlementPeriod);
    conditions.push(`rr.settlement_period = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    conditions.push(`rr.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    conditions.push(`rr.created_at <= $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT rr.id, rr.referrer_id, rr.referred_user_id, rr.settlement_period,
            rr.eligible_net_profit, rr.reward_rate, rr.reward_amount, rr.status,
            rr.created_at, ru.email AS referrer_email, du.email AS referred_email
       FROM referral_rewards rr
       LEFT JOIN users ru ON ru.id = rr.referrer_id
       LEFT JOIN users du ON du.id = rr.referred_user_id
       ${where}
       ORDER BY rr.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM referral_rewards rr ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function findRewardById({ rewardId }) {
  const { rows } = await db.query(
    `SELECT * FROM referral_rewards WHERE id = $1 LIMIT 1`,
    [rewardId],
  );
  return rows[0] || null;
}

export async function updateRewardStatus({ rewardId, status, reason }) {
  const { rowCount } = await db.query(
    `UPDATE referral_rewards
        SET status = $1,
            rejection_reason = $2,
            approved_at = CASE WHEN $1 = 'APPROVED' THEN $3 ELSE approved_at END,
            settled_at = CASE WHEN $1 = 'SETTLED' THEN $3 ELSE settled_at END,
            updated_at = $3
      WHERE id = $4`,
    [status, reason || null, nowIso(), rewardId],
  );
  return rowCount > 0;
}

export async function listReferralRelationships({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.referrerId) {
    params.push(filters.referrerId);
    conditions.push(`rr.referrer_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`rr.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT rr.id, rr.referrer_id, rr.referred_user_id, rr.status, rr.created_at
       FROM referral_relationships rr
       ${where}
       ORDER BY rr.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM referral_relationships rr ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function countRewardsByStatus() {
  const { rows } = await db.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(reward_amount), 0)::numeric AS total_amount
       FROM referral_rewards
      GROUP BY status`,
  );
  return rows;
}

export const adminReferralRepository = {
  listReferralRewards,
  findRewardById,
  updateRewardStatus,
  listReferralRelationships,
  countRewardsByStatus,
};