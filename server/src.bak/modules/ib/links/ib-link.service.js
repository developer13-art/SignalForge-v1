/**
 * IB Link Service
 *
 * Manages Introducing Broker referral links: creation, listing,
 * deactivation, and tracking of clicks and conversions. Each IB link
 * carries a unique code that is used to attribute new broker-account
 * referrals to a partner.
 *
 * @module server/modules/ib/links/ib-link.service
 */

import crypto from 'node:crypto';
import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { nowIso } from '@signalforge/shared/utils/date.util';
import { db } from '../../../database';
import * as repository from './ib-link.repository';

function generateLinkCode() {
  return crypto.randomBytes(8).toString('hex');
}

export async function createLink({ userId, brokerId, label, destination }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  let code = generateLinkCode();
  let attempts = 0;

  while (attempts < 5) {
    const existing = await repository.findByCode({ code });
    if (!existing) {
      break;
    }
    code = generateLinkCode();
    attempts++;
  }

  if (attempts >= 5) {
    throw new AppError('Failed to generate a unique IB link code', ERROR_CODES.INTERNAL_ERROR, 500);
  }

  const record = await repository.insertLink({
    userId,
    brokerId: brokerId || null,
    code,
    label: label || null,
    destination: destination || null,
  });

  logger.info({ userId, linkId: record.id, code }, 'IB link created');

  return {
    linkId: record.id,
    code: record.code,
    brokerId: record.broker_id,
    label: record.label,
    destination: record.destination,
    active: record.active,
    clicks: record.clicks,
    conversions: record.conversions,
    createdAt: record.created_at,
  };
}

export async function listLinks({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const rows = await repository.listByUser({ userId });

  return rows.map((row) => ({
    linkId: row.id,
    code: row.code,
    brokerId: row.broker_id,
    label: row.label,
    destination: row.destination,
    active: row.active,
    clicks: row.clicks,
    conversions: row.conversions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function deactivateLink({ userId, linkId }) {
  if (!userId || !linkId) {
    throw new AppError('userId and linkId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const existing = await repository.findById({ linkId });

  if (!existing || existing.user_id !== userId) {
    throw new AppError('IB link not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await repository.deactivateLink({ linkId, userId });

  logger.info({ userId, linkId }, 'IB link deactivated');

  return { deactivated: true };
}

export async function recordClick({ code }) {
  if (!code) {
    throw new AppError('code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const link = await repository.findByCode({ code });

  if (!link) {
    return { recorded: false, reason: 'LINK_NOT_FOUND' };
  }

  if (!link.active) {
    return { recorded: false, reason: 'LINK_INACTIVE' };
  }

  await repository.incrementClicks({ linkId: link.id });

  return { recorded: true, linkId: link.id };
}

export async function recordConversion({ code }) {
  if (!code) {
    throw new AppError('code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const link = await repository.findByCode({ code });

  if (!link) {
    return { recorded: false, reason: 'LINK_NOT_FOUND' };
  }

  if (!link.active) {
    return { recorded: false, reason: 'LINK_INACTIVE' };
  }

  await repository.incrementConversions({ linkId: link.id });

  logger.info({ linkId: link.id, code }, 'IB link conversion recorded');

  return { recorded: true, linkId: link.id };
}

export async function resolveByCode({ code }) {
  if (!code) {
    throw new AppError('code is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const link = await repository.findByCode({ code });

  if (!link) {
    return null;
  }

  return {
    linkId: link.id,
    userId: link.user_id,
    code: link.code,
    brokerId: link.broker_id,
    label: link.label,
    destination: link.destination,
    active: link.active,
  };
}

export async function listActiveLinksForUser({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return repository.listActiveByUser({ userId });
}

export async function countLinks({ userId }) {
  if (!userId) {
    throw new AppError('userId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  return repository.countByUser({ userId });
}

export const ibLinkService = {
  createLink,
  listLinks,
  deactivateLink,
  recordClick,
  recordConversion,
  resolveByCode,
  listActiveLinksForUser,
  countLinks,
};