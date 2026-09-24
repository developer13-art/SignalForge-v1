/**
 * Affiliate Referral Service
 *
 * Records new affiliate referrals when a user signs up via an
 * affiliate link, tracks their status over time, and provides the
 * data used by the commission engine.
 *
 * @module server/modules/affiliate/referrals/affiliate-referral.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';

export async function recordReferral({ affiliateCode, referredUserId, source }) {
  if (!affiliateCode || !referredUserId) {
    throw new AppError('affiliateCode and referredUserId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows: linkRows } = await db.query(
    `SELECT id, user_id, active
       FROM affiliate_links
      WHERE code = $1
      LIMIT 1`,
    [affiliateCode],
  );

  const link = linkRows[0];

  if (!link) {
    logger.debug({ affiliateCode }, 'Affiliate link not found');
    return { recorded: false, reason: 'LINK_NOT_FOUND' };
  }

  if (!link.active) {
    return { recorded: false, reason: 'LINK_INACTIVE' };
  }

  const partnerUserId = link.user_id;

  if (partnerUserId === referredUserId) {
    return { recorded: false, reason: 'SELF_REFERRAL' };
  }

  const { rows: existingRows } = await db.query(
    `SELECT id FROM affiliate_referrals WHERE referred_user_id = $1 LIMIT 1`,
    [referredUserId],
  );

  if (existingRows[0]) {
    return { recorded: false, reason: 'ALREADY_REFERRED', referralId: existingRows[0].id };
  }

  const { rows } = await db.query(
    `INSERT INTO affiliate_referrals
       (partner_user_id, referred_user_id, affiliate_link_id, status, source, created_at, updated_at)
     VALUES ($1, $2, $3, 'ACTIVE', $4, $5, $5)
     RETURNING id, status, created_at`,
    [partnerUserId, referredUserId, link.id, source || null, nowIso()],
  );

  const referral = rows[0];

  await db.query(
    `UPDATE affiliate_links SET conversions = conversions + 1, updated_at = $1 WHERE id = $2`,
    [nowIso(), link.id],
  );

  await publishEvent({
    eventType: EVENT_TYPES.REFERRAL_RELATIONSHIP_CREATED,
    source: 'affiliate-referral.service',
    actorId: partnerUserId,
    payload: {
      referralId: referral.id,
      partnerUserId,
      referredUserId,
      affiliateCode,
      source: source || null,
      kind: 'AFFILIATE',
    },
  });

  logger.info({ partnerUserId, referredUserId, referralId: referral.id }, 'Affiliate referral recorded');

  return {
    recorded: true,
    referralId: referral.id,
    partnerUserId,
    status: referral.status,
    createdAt: referral.created_at,
  };
}

export async function getReferralById({ referralId }) {
  if (!referralId) {
    throw new AppError('referralId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, partner_user_id, referred_user_id, status, source, created_at, updated_at
       FROM affiliate_referrals
      WHERE id = $1
      LIMIT 1`,
    [referralId],
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    referralId: row.id,
    partnerUserId: row.partner_user_id,
    referredUserId: row.referred_user_id,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listActiveReferralsForPartner({ partnerUserId }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT id, referred_user_id, status, created_at
       FROM affiliate_referrals
      WHERE partner_user_id = $1 AND status = 'ACTIVE'
      ORDER BY created_at DESC`,
    [partnerUserId],
  );

  return rows.map((row) => ({
    referralId: row.id,
    referredUserId: row.referred_user_id,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function updateReferralStatus({ referralId, status }) {
  if (!referralId || !status) {
    throw new AppError('referralId and status are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status: ${status}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rowCount } = await db.query(
    `UPDATE affiliate_referrals
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), referralId],
  );

  return { updated: rowCount > 0 };
}

export async function countReferralsForPartner({ partnerUserId }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const { rows } = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
       FROM affiliate_referrals
      WHERE partner_user_id = $1`,
    [partnerUserId],
  );

  return {
    total: rows[0]?.total || 0,
    active: rows[0]?.active || 0,
  };
}

export const affiliateReferralService = {
  recordReferral,
  getReferralById,
  listActiveReferralsForPartner,
  updateReferralStatus,
  countReferralsForPartner,
};