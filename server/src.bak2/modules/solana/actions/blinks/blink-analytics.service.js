'use strict';

const blinkRepository = require('./blink.repository');
const blinkAnalyticsRepository = require('./blink-analytics.repository');
const blinkValidator = require('./blink.validator');

const {
  BLINK_ANALYTICS_WINDOWS,
  BLINK_ANALYTICS_GROUP_BY,
} = require('./blink.constants');

const { NotFoundError, InvalidParameterError } = require('../actions.errors');
const actionsRepository = require('../actions.repository');

/**
 * SignalForge - Blink Analytics Service
 *
 * Presents rich, tenant-scoped analytics for Blinks and their owners.
 * All windows and group-by options are validated and normalized before
 * any query executes.
 */

function resolveWindowRange(window, from, to) {
  const now = new Date();
  let start = from ? new Date(from) : null;
  const end = to ? new Date(to) : now;

  if (!start) {
    switch (window) {
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

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

async function getBlinkAnalytics({ blinkId, window, groupBy, from, to }) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }

  const validatedWindow = blinkValidator.validateAnalyticsWindow(window);
  const validatedGroupBy = blinkValidator.validateAnalyticsGroupBy(groupBy);
  const range = resolveWindowRange(validatedWindow, from, to);

  const [funnel, byChannel, byToken] = await Promise.all([
    blinkAnalyticsRepository.getConversionFunnel({
      blinkId,
      from: range.from,
      to: range.to,
    }),
    blinkAnalyticsRepository.getChannelPerformance({
      blinkId,
      from: range.from,
      to: range.to,
    }),
    blinkAnalyticsRepository.getTokenPerformance({
      blinkId,
      from: range.from,
      to: range.to,
    }),
  ]);

  let velocity = [];
  if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.DAY) {
    velocity = await blinkAnalyticsRepository.getConversionVelocity({
      blinkId,
      from: range.from,
      to: range.to,
      interval: 'day',
    });
  } else if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.WEEK) {
    velocity = await blinkAnalyticsRepository.getConversionVelocity({
      blinkId,
      from: range.from,
      to: range.to,
      interval: 'week',
    });
  } else if (validatedGroupBy === BLINK_ANALYTICS_GROUP_BY.MONTH) {
    velocity = await blinkAnalyticsRepository.getConversionVelocity({
      blinkId,
      from: range.from,
      to: range.to,
      interval: 'month',
    });
  }

  return {
    blinkId,
    window: validatedWindow,
    groupBy: validatedGroupBy,
    from: range.from,
    to: range.to,
    funnel,
    byChannel,
    byToken,
    velocity,
  };
}

async function getBlinkFunnel({ blinkId, window, from, to }) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }

  const validatedWindow = blinkValidator.validateAnalyticsWindow(window);
  const range = resolveWindowRange(validatedWindow, from, to);

  return blinkAnalyticsRepository.getConversionFunnel({
    blinkId,
    from: range.from,
    to: range.to,
  });
}

async function getOwnerAnalytics({ ownerUserId, window, from, to }) {
  if (!ownerUserId) {
    throw new InvalidParameterError('ownerUserId is required');
  }

  const validatedWindow = blinkValidator.validateAnalyticsWindow(window);
  const range = resolveWindowRange(validatedWindow, from, to);

  const [funnel, topBlinks] = await Promise.all([
    blinkAnalyticsRepository.getOwnerFunnel({
      ownerUserId,
      from: range.from,
      to: range.to,
    }),
    blinkAnalyticsRepository.getTopPerformingBlinks({
      ownerUserId,
      from: range.from,
      to: range.to,
      limit: 10,
    }),
  ]);

  return {
    ownerUserId,
    window: validatedWindow,
    from: range.from,
    to: range.to,
    funnel,
    topBlinks,
  };
}

async function getTopConversions({ blinkId, window, from, to, limit = 20 }) {
  const blink = await actionsRepository.findBlinkById(blinkId);
  if (!blink) {
    throw new NotFoundError(`Blink ${blinkId} was not found`);
  }
  const validatedWindow = blinkValidator.validateAnalyticsWindow(window);
  const range = resolveWindowRange(validatedWindow, from, to);
  return blinkAnalyticsRepository.getTopConversions({
    blinkId,
    from: range.from,
    to: range.to,
    limit,
  });
}

module.exports = {
  getBlinkAnalytics,
  getBlinkFunnel,
  getOwnerAnalytics,
  getTopConversions,
  resolveWindowRange,
};