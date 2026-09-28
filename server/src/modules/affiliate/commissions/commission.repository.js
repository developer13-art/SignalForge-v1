/**
 * Commission Repository
 *
 * Low-level persistence for affiliate commissions. Used by the
 * commission service and administrative reporting.
 *
 * @module server/modules/affiliate/commissions/commission.repository
 */
const { db } = require('../../../database');
const { nowIso } = require('@signalforge/shared/utils/date.util');
async function insertCommission({
  partnerUserId,
  referralId,
  amount,
  currency = 'USD',
  status = 'PENDING',
  description,
}) {
  const { rows } = await db.query(
    `INSERT INTO affiliate_commissions
       (partner_user_id, referral_id, amount, currency, status, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING *`,
    [partnerUserId, referralId, amount, currency, status, description || null, nowIso()],
  );
  return rows[0];
}
async function findById({ commissionId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_commissions WHERE id = $1 LIMIT 1`,
    [commissionId],
  );
  return rows[0] || null;
}
async function findByReferralId({ referralId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_commissions
      WHERE referral_id = $1
      ORDER BY created_at DESC`,
    [referralId],
  );
  return rows;
}
async function findByPartnerUserId({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT * FROM affiliate_commissions
      WHERE partner_user_id = $1
      ORDER BY created_at DESC`,
    [partnerUserId],
  );
  return rows;
}
async function updateStatus({
  commissionId,
  status,
  rejectionReason,
}) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = $1,
            rejection_reason = $2,
            updated_at = $3
      WHERE id = $4`,
    [status, rejectionReason || null, nowIso(), commissionId],
  );
  return rowCount > 0;
}
async function approve({ commissionId }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'APPROVED',
            approved_at = $1,
            updated_at = $1
      WHERE id = $2 AND status = 'PENDING'`,
    [nowIso(), commissionId],
  );
  return rowCount > 0;
}
async function reject({ commissionId, reason }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'REJECTED',
            rejection_reason = $1,
            updated_at = $2
      WHERE id = $3 AND status IN ('PENDING', 'APPROVED')`,
    [reason || null, nowIso(), commissionId],
  );
  return rowCount > 0;
}
async function markPaid({ commissionId }) {
  const { rowCount } = await db.query(
    `UPDATE affiliate_commissions
        SET status = 'PAID',
            paid_at = $1,
            updated_at = $1
      WHERE id = $2 AND status = 'APPROVED'`,
    [nowIso(), commissionId],
  );
  return rowCount > 0;
}
async function aggregateByStatus({ partnerUserId }) {
  const { rows } = await db.query(
    `SELECT status, COALESCE(SUM(amount), 0)::numeric AS total, COUNT(*)::int AS count
       FROM affiliate_commissions
      WHERE partner_user_id = $1
      GROUP BY status`,
    [partnerUserId],
  );
  return rows;
}
async function listCommissions({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.partnerUserId) {
    params.push(filters.partnerUserId);
    conditions.push(`partner_user_id = $${params.length}`);
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
const commissionRepository = {
  insertCommission,
  findById,
  findByReferralId,
  findByPartnerUserId,
  updateStatus,
  approve,
  reject,
  markPaid,
  aggregateByStatus,
  listCommissions,
};
module.exports.commissionRepository = commissionRepository;

module.exports.insertCommission = insertCommission;

module.exports.findById = findById;

module.exports.findByReferralId = findByReferralId;

module.exports.findByPartnerUserId = findByPartnerUserId;

module.exports.updateStatus = updateStatus;

module.exports.approve = approve;

module.exports.reject = reject;

module.exports.markPaid = markPaid;

module.exports.aggregateByStatus = aggregateByStatus;

module.exports.listCommissions = listCommissions;
