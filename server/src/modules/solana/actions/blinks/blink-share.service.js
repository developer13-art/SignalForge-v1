'use strict';

const crypto = require('crypto');

const blinkShareRepository = require('./blink-share.repository');
const blinkUrlService = require('./blink-url.service');

const { InvalidParameterError, NotFoundError } = require('../actions.errors');
const actionsValidator = require('../actions.validator');
const actionsRepository = require('../actions.repository');

/**
 * SignalForge - Blink Share Service
 *
 * Orchestrates share-record creation, share URL generation, and share
 * channel tracking. Every share event flows through this service so
 * that analytics stay consistent across the platform.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

async function recordShare({
  blinkId,
  channel,
  sharedByUserId,
  targetUrl,
  userAgent,
  ip,
  metadata,
}) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }

  const validatedChannel = actionsValidator.validateShareChannel(channel);

  const share = await blinkShareRepository.create(null, {
    id: generateId('share'),
    blinkId,
    channel: validatedChannel,
    sharedByUserId: sharedByUserId || null,
    targetUrl: targetUrl || null,
    userAgent: userAgent || null,
    ip: ip || null,
    metadata: metadata || {},
  });

  return share;
}

async function listSharesByBlink({ blinkId, page, pageSize }) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return blinkShareRepository.listByBlink({ blinkId, page, pageSize });
}

async function listSharesByUser({ sharedByUserId, page, pageSize }) {
  if (!sharedByUserId) {
    throw new InvalidParameterError('sharedByUserId is required');
  }
  return blinkShareRepository.listByUser({ sharedByUserId, page, pageSize });
}

async function getShareCountsByChannel(blinkId) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return blinkShareRepository.countByChannel({ blinkId });
}

async function buildShareLinks({
  blinkId,
  text,
  via,
  hashtags,
  channels,
}) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }

  const blinkUrl = blinkUrlService.buildBlinkUrl({
    templateType: blink.template_type,
    planId: blink.plan_id,
    referralCode: blink.referral_code,
    providerId: blink.provider_id,
    token: blink.token_symbol,
    amount: blink.amount,
    utm: blinkUrlService.withUtmDefaults({
      source: 'blink',
      medium: 'share',
    }),
  });

  const targetChannels =
    Array.isArray(channels) && channels.length > 0
      ? channels.map((channel) => actionsValidator.validateShareChannel(channel))
      : ['x', 'telegram', 'whatsapp', 'email'];

  const result = {
    blinkId,
    blinkUrl,
    shortUrl: null,
    shareLinks: {},
    qr: blinkUrlService.buildQrPayload(blinkUrl),
    qrImageUrl: blinkUrlService.buildBlinkQrImageUrl(blinkUrl),
  };

  for (const channel of targetChannels) {
    result.shareLinks[channel] = blinkUrlService.buildShareUrl({
      blinkUrl,
      text,
      via,
      hashtags,
      channel,
    });
  }

  return result;
}

async function getRecentShares(blinkId, limit = 20) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return blinkShareRepository.listRecentByBlink(blinkId, limit);
}

module.exports = {
  recordShare,
  listSharesByBlink,
  listSharesByUser,
  getShareCountsByChannel,
  buildShareLinks,
  getRecentShares,
};