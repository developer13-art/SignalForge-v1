'use strict';

/**
 * SignalForge - Blink Analytics Schema
 *
 * Describes the shape of the analytics payload returned for a Blink
 * or a Blink owner. Used by the client to render dashboards and by
 * the server to assert output structure.
 */

const BLINK_ANALYTICS_SCHEMA = Object.freeze({
  type: 'object',
  required: ['blinkId', 'window', 'from', 'to'],
  properties: {
    blinkId: { type: 'string' },
    window: { type: 'string', enum: ['day', 'week', 'month', 'quarter', 'year', 'all'] },
    groupBy: { type: 'string', enum: ['day', 'week', 'month', 'channel', 'token', 'template'] },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' },
    funnel: {
      type: 'object',
      properties: {
        shares: { type: 'number' },
        clicks: { type: 'number' },
        conversions: { type: 'number' },
        confirmed: { type: 'number' },
        failed: { type: 'number' },
        pending: { type: 'number' },
      },
    },
    byChannel: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          shares: { type: 'number' },
          clicks: { type: 'number' },
          conversions: { type: 'number' },
          confirmed_amount: { type: 'number' },
        },
      },
    },
    byToken: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          token_symbol: { type: 'string' },
          total: { type: 'number' },
          confirmed: { type: 'number' },
          confirmed_amount: { type: 'number' },
        },
      },
    },
    velocity: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          period: { type: 'string' },
          total: { type: 'number' },
          confirmed: { type: 'number' },
          confirmed_amount: { type: 'number' },
        },
      },
    },
  },
  additionalProperties: true,
});

function validateBlinkAnalytics(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['analytics must be an object'] };
  }

  if (!payload.blinkId) {
    errors.push('blinkId is required');
  }

  const allowedWindows = ['day', 'week', 'month', 'quarter', 'year', 'all'];
  if (!payload.window || !allowedWindows.includes(payload.window)) {
    errors.push(`window must be one of: ${allowedWindows.join(', ')}`);
  }

  if (!payload.from || !payload.to) {
    errors.push('from and to timestamps are required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function summarizeFunnel(funnel) {
  if (!funnel) {
    return {
      shares: 0,
      clicks: 0,
      conversions: 0,
      confirmed: 0,
      failed: 0,
      pending: 0,
      conversionRate: 0,
      confirmedRate: 0,
    };
  }

  const conversionRate = funnel.clicks > 0 ? (funnel.conversions / funnel.clicks) * 100 : 0;
  const confirmedRate = funnel.conversions > 0 ? (funnel.confirmed / funnel.conversions) * 100 : 0;

  return {
    shares: Number(funnel.shares) || 0,
    clicks: Number(funnel.clicks) || 0,
    conversions: Number(funnel.conversions) || 0,
    confirmed: Number(funnel.confirmed) || 0,
    failed: Number(funnel.failed) || 0,
    pending: Number(funnel.pending) || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    confirmedRate: Math.round(confirmedRate * 100) / 100,
  };
}

function buildAnalyticsSummary(analytics) {
  return {
    blinkId: analytics.blinkId,
    window: analytics.window,
    from: analytics.from,
    to: analytics.to,
    summary: summarizeFunnel(analytics.funnel),
    byChannel: analytics.byChannel || [],
    byToken: analytics.byToken || [],
    velocity: analytics.velocity || [],
  };
}

module.exports = {
  BLINK_ANALYTICS_SCHEMA,
  validateBlinkAnalytics,
  summarizeFunnel,
  buildAnalyticsSummary,
};