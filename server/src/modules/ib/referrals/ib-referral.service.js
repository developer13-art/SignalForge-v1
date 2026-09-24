/**
 * IB Referral Service
 *
 * Records and manages IB referrals when a user attributes a broker
 * account to a partner via an IB link. A referred user maps to exactly
 * one IB partner.
 *
 * @module server/modules/ib/referrals/ib-referral.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { publishEvent } from '../../../events/event-publisher';
import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import * as repository from './ib-referral.repository';

export async function recordReferral({ partnerUserId, referredUserId, brokerAccountId, source, ibLinkId }) {
  if (!partnerUserId || !referredUserId) {
    throw new AppError('partnerUserId and referredUserId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  if (partnerUserId === referredUserId) {
    throw new AppError('Self-referral is not permitted', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await repository.findByReferredUserId({ referredUserId });

  if (existing) {
    return { recorded: false, reason: 'ALREADY_REFERRED', referralId: existing.id };
  }

  const record = await repository.insertReferral({
    partnerUserId,
    referredUserId,
    brokerAccountId: brokerAccountId || null,
    ibLinkId: ibLinkId || null,
    source: source || null,
    status: 'ACTIVE',
  });

  await publishEvent({
    eventType: EVENT_TYPES.REFERRAL_RELATIONSHIP_CREATED,
    source: 'ib-referral.service',
    actorId: partnerUserId,
    payload: {
      referralId: record.id,
      partnerUserId,
      referredUserId,
      brokerAccountId: brokerAccountId || null,
      source: source || null,
      kind: 'IB',
    },
  }).catch((err) => logger.warn({ err }, 'Failed to publish IB referral event'));

  logger.info(
    { partnerUserId, referredUserId, referralId: record.id },
    'IB referral recorded',
  );

  return {
    recorded: true,
    referralId: record.id,
    status: record.status,
    createdAt: record.created_at,
  };
}

export async function getReferralById({ referralId }) {
  if (!referralId) {
    throw new AppError('referralId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const record = await repository.findById({ referralId });

  if (!record) {
    return null;
  }

  return {
    referralId: record.id,
    partnerUserId: record.partner_user_id,
    referredUserId: record.referred_user_id,
    brokerAccountId: record.broker_account_id,
    status: record.status,
    source: record.source,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function listActiveReferralsForPartner({ partnerUserId }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listActiveByPartner({ partnerUserId });

  return rows.map((row) => ({
    referralId: row.id,
    referredUserId: row.referred_user_id,
    brokerAccountId: row.broker_account_id,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function listReferralsForPartner({ partnerUserId, pagination = {} }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const result = await repository.listByPartner({ partnerUserId, pagination });

  return {
    items: result.items.map((row) => ({
      referralId: row.id,
      referredUserId: row.referred_user_id,
      brokerAccountId: row.broker_account_id,
      status: row.status,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    total: result.total,
  };
}

export async function updateReferralStatus({ referralId, status }) {
  if (!referralId || !status) {
    throw new AppError('referralId and status are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status: ${status}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateStatus({ referralId, status });

  return { updated };
}

export async function countReferrals({ partnerUserId }) {
  if (!partnerUserId) {
    throw new AppError('partnerUserId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return repository.countByPartner({ partnerUserId });
}

export const ibReferralService = {
  recordReferral,
  getReferralById,
  listActiveReferralsForPartner,
  listReferralsForPartner,
  updateReferralStatus,
  countReferrals,
};