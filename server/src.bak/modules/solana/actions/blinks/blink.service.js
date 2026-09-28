'use strict';

const crypto = require('crypto');

const actionsRepository = require('../actions.repository');
const blinkRepository = require('./blink.repository');
const blinkUrlService = require('./blink-url.service');
const blinkValidator = require('./blink.validator');

const {
  BLINK_LIFECYCLE_STATES,
  BLINK_LIFECYCLE_TRANSITIONS,
  BLINK_TEMPLATE_DEFINITIONS,
  BLINK_ANALYTICS_WINDOWS,
  BLINK_ANALYTICS_GROUP_BY,
  BLINK_ANALYTICS_EVENT_TYPES,
} = require('./blink.constants');

const { config } = require('../actions.config');
const actionsValidator = require('../actions.validator');

const {
  NotFoundError,
  InvalidActionError,
  InvalidParameterError,
} = require('../actions.errors');

/**
 * SignalForge - Blink Service
 *
 * The Blink service owns the complete lifecycle of a Blink: creation,
 * pausing, resuming, archiving, sharing, URL generation, and analytics.
 * It composes the generic Actions repository, the dedicated Blink
 * repository, and the URL service into a single cohesive API.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function resolveIconUrl() {
  const path = config.icon.path;
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${blinkUrlService.resolveBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveWebsite() {
  return config.icon.website || blinkUrlService.resolveBaseUrl();
}

function assertTransition(currentStatus, nextStatus) {
  const allowed = BLINK_LIFECYCLE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new InvalidActionError(
      `Cannot transition Blink from ${currentStatus} to ${nextStatus}`,
      { from: currentStatus, to: nextStatus, allowed },
    );
  }
}

async function createBlink({ ownerUserId, providerId, payload }) {
  const validated = blinkValidator.validateCreateBlinkPayload(payload);
  const definition = BLINK_TEMPLATE_DEFINITIONS[validated.templateType];

  const tokenSymbol = validated.tokenSymbol || config.token.defaultSymbol;
  const tokenMint = validated.tokenMint
    ? validated.tokenMint
    : actionsValidator.resolveMintForSymbol(tokenSymbol, config.network);

  const amount =
    validated.amount !== undefined
      ? validated.amount
      : definition.requiresAmount
      ? 1
      : 0;

  if (definition.requiresAmount && (!amount || amount <= 0)) {
    throw new InvalidParameterError('This template requires a positive amount');
  }

  const blink = await actionsRepository.createBlink(null, {
    id: generateId('blink'),
    providerId: providerId || null,
    ownerUserId: ownerUserId || null,
    templateType: validated.templateType,
    status: BLINK_LIFECYCLE_STATES.ACTIVE,
    title: validated.title,
    description: validated.description,
    label: validated.label,
    message: validated.message || '',
    iconUrl: validated.iconUrl || resolveIconUrl(),
    website: validated.website || resolveWebsite(),
    planId: validated.planId || null,
    referralCode: validated.referralCode || null,
    tokenSymbol,
    tokenMint,
    amount,
    amountDecimals: validated.amountDecimals,
    chainId: null,
    network: config.network,
    metadata: validated.metadata || {},
  });

  const url = blinkUrlService.buildBlinkUrl({
    templateType: blink.template_type,
    planId: blink.plan_id,
    referralCode: blink.referral_code,
    providerId: blink.provider_id,
    token: blink.token_symbol,
    amount: blink.amount,
    utm: blinkUrlService.withUtmDefaults(),
  });

  return {
    ...blink,
    url,
  };
}

async function getBlinkById(blinkId) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  return blink;
}

async function getBlinkWithUrl(blinkId) {
  const blink = await getBlinkById(blinkId);
  const url = blinkUrlService.buildBlinkUrl({
    templateType: blink.template_type,
    planId: blink.plan_id,
    referralCode: blink.referral_code,
    providerId: blink.provider_id,
    token: blink.token_symbol,
    amount: blink.amount,
  });
  return {
    ...blink,
    url,
  };
}

async function listBlinks(filters) {
  const pagination = blinkValidator.validatePagination(filters);
  return actionsRepository.listBlinks({
    ...filters,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

async function updateBlink(blinkId, payload) {
  const blink = await getBlinkById(blinkId);
  const validated = blinkValidator.validateUpdateBlinkPayload(payload);

  const updatedMetadata = {
    ...(blink.metadata || {}),
    ...(validated.metadata || {}),
  };

  const updatePayload = {
    title: validated.title || blink.title,
    description: validated.description || blink.description,
    label: validated.label || blink.label,
    message: validated.message !== undefined ? validated.message : blink.message,
    icon_url: validated.iconUrl || blink.icon_url,
    website: validated.website || blink.website,
    plan_id: validated.planId !== undefined ? validated.planId : blink.plan_id,
    referral_code:
      validated.referralCode !== undefined ? validated.referralCode : blink.referral_code,
    token_symbol: validated.tokenSymbol || blink.token_symbol,
    token_mint: validated.tokenMint || blink.token_mint,
    amount: validated.amount !== undefined ? validated.amount : blink.amount,
    amount_decimals:
      validated.amountDecimals !== undefined
        ? validated.amountDecimals
        : blink.amount_decimals,
    metadata: updatedMetadata,
  };

  const sql = `
    UPDATE solana_blinks
    SET
      title = $2,
      description = $3,
      label = $4,
      message = $5,
      icon_url = $6,
      website = $7,
      plan_id = $8,
      referral_code = $9,
      token_symbol = $10,
      token_mint = $11,
      amount = $12,
      amount_decimals = $13,
      metadata = $14,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  const { query } = require('../../../../database/connection');
  const result = await query(sql, [
    blinkId,
    updatePayload.title,
    updatePayload.description,
    updatePayload.label,
    updatePayload.message,
    updatePayload.icon_url,
    updatePayload.website,
    updatePayload.plan_id,
    updatePayload.referral_code,
    updatePayload.token_symbol,
    updatePayload.token_mint,
    updatePayload.amount,
    updatePayload.amount_decimals,
    JSON.stringify(updatePayload.metadata),
  ]);

  return result.rows[0];
}

async function pauseBlink(blinkId) {
  const blink = await getBlinkById(blinkId);
  assertTransition(blink.status, BLINK_LIFECYCLE_STATES.PAUSED);
  return actionsRepository.updateBlinkStatus(blinkId, BLINK_LIFECYCLE_STATES.PAUSED);
}

async function resumeBlink(blinkId) {
  const blink = await getBlinkById(blinkId);
  assertTransition(blink.status, BLINK_LIFECYCLE_STATES.ACTIVE);
  return actionsRepository.updateBlinkStatus(blinkId, BLINK_LIFECYCLE_STATES.ACTIVE);
}

async function archiveBlink(blinkId) {
  const blink = await getBlinkById(blinkId);
  assertTransition(blink.status, BLINK_LIFECYCLE_STATES.ARCHIVED);
  return actionsRepository.updateBlinkStatus(blinkId, BLINK_LIFECYCLE_STATES.ARCHIVED);
}

async function getBlinkAnalytics({
  blinkId,
  window = BLINK_ANALYTICS_WINDOWS.MONTH,
  groupBy = BLINK_ANALYTICS_GROUP_BY.DAY,
  from,
  to,
}) {
  await getBlinkById(blinkId);

  const validatedWindow = blinkValidator.validateAnalyticsWindow(window);
  const validatedGroupBy = blinkValidator.validateAnalyticsGroupBy(groupBy);
  const range = blinkValidator.validateAnalyticsDateRange({ from, to });

  const now = new Date();
  let start = range.from ? new Date(range.from) : null;
  const end = range.to ? new Date(range.to) : now;

  if (!start) {
    switch (validatedWindow) {
      case BLINK_ANALYTICS_WINDOWS.DAY:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case BLINK_ANALYTICS_WINDOWS.WEEK:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case BLINK_ANALYTICS_WINDOWS.MONTH:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case BLINK_ANALYTICS_WINDOWS.QUARTER:
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case BLINK_ANALYTICS_WINDOWS.YEAR:
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case BLINK_ANALYTICS_WINDOWS.ALL:
      default:
        start = new Date('2000-01-01T00:00:00.000Z');
    }
  }

  const [summary, byChannel, byToken] = await Promise.all([
    blinkRepository.aggregateConversionsByBlink(blinkId),
    blinkRepository.aggregateConversionsByChannel(blinkId),
    blinkRepository.aggregateConversionsByToken(blinkId),
  ]);

  let timeline = [];
  if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.DAY) {
    timeline = await blinkRepository.aggregateConversionsByDay({
      blinkId,
      from: start.toISOString(),
      to: end.toISOString(),
    });
  } else if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.WEEK) {
    timeline = await blinkRepository.aggregateConversionsByWeek({
      blinkId,
      from: start.toISOString(),
      to: end.toISOString(),
    });
  } else if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.MONTH) {
    timeline = await blinkRepository.aggregateConversionsByMonth({
      blinkId,
      from: start.toISOString(),
      to: end.toISOString(),
    });
  }

  return {
    blinkId,
    window: validatedWindow,
    groupBy: validatedGroupBy,
    from: start.toISOString(),
    to: end.toISOString(),
    summary: summary || {},
    byChannel,
    byToken,
    timeline,
  };
}

async function getRecentActivity({ blinkId, limit = 20 }) {
  await getBlinkById(blinkId);
  const [conversions, shares, clicks] = await Promise.all([
    blinkRepository.findRecentConversions(blinkId, limit),
    blinkRepository.findRecentShares(blinkId, limit),
    blinkRepository.findRecentClicks(blinkId, limit),
  ]);

  const events = [];

  for (const item of conversions) {
    events.push({
      type: BLINK_ANALYTICS_EVENT_TYPES.CONFIRMED,
      at: item.created_at,
      data: item,
    });
  }
  for (const item of shares) {
    events.push({
      type: BLINK_ANALYTICS_EVENT_TYPES.SHARE,
      at: item.created_at,
      data: item,
    });
  }
  for (const item of clicks) {
    events.push({
      type: BLINK_ANALYTICS_EVENT_TYPES.CLICK,
      at: item.created_at,
      data: item,
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return events.slice(0, limit);
}

module.exports = {
  createBlink,
  getBlinkById,
  getBlinkWithUrl,
  listBlinks,
  updateBlink,
  pauseBlink,
  resumeBlink,
  archiveBlink,
  getBlinkAnalytics,
  getRecentActivity,
  resolveIconUrl,
  resolveWebsite,
};