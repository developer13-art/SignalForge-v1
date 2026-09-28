'use strict';

/**
 * SignalForge - Crypto Position Schema
 */

const CRYPTO_POSITION_STATUSES = Object.freeze({
  OPEN: 'open',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  PENDING: 'pending',
});

const CRYPTO_POSITION_SIDES = Object.freeze({
  LONG: 'LONG',
  SHORT: 'SHORT',
});

const CRYPTO_POSITION_SCHEMA = Object.freeze({
  type: 'object',
  required: ['id', 'userId', 'symbol', 'side', 'size'],
  properties: {
    id: { type: 'string' },
    userId: { type: 'string' },
    accountId: { type: ['string', 'null'] },
    gateway: { type: ['string', 'null'] },
    symbol: { type: 'string' },
    side: { type: 'string', enum: Object.values(CRYPTO_POSITION_SIDES) },
    size: { type: 'number', minimum: 0 },
    entryPrice: { type: ['number', 'null'], minimum: 0 },
    markPrice: { type: ['number', 'null'], minimum: 0 },
    liquidationPrice: { type: ['number', 'null'], minimum: 0 },
    leverage: { type: ['number', 'null'], minimum: 1 },
    marginUsed: { type: ['number', 'null'], minimum: 0 },
    unrealizedPnl: { type: ['number', 'null'] },
    realizedPnl: { type: ['number', 'null'] },
    status: { type: 'string', enum: Object.values(CRYPTO_POSITION_STATUSES) },
    openedAt: { type: ['string', 'null'], format: 'date-time' },
    closedAt: { type: ['string', 'null'], format: 'date-time' },
    metadata: { type: 'object' },
  },
  additionalProperties: false,
});

function validateCryptoPosition(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['position must be an object'] };
  }

  if (!payload.id) {
    errors.push('id is required');
  }
  if (!payload.userId) {
    errors.push('userId is required');
  }
  if (!payload.symbol) {
    errors.push('symbol is required');
  }
  if (!payload.side || !Object.values(CRYPTO_POSITION_SIDES).includes(payload.side)) {
    errors.push('side must be LONG or SHORT');
  }
  if (payload.size === undefined || Number(payload.size) < 0) {
    errors.push('size must be a non-negative number');
  }

  if (payload.status && !Object.values(CRYPTO_POSITION_STATUSES).includes(payload.status)) {
    errors.push('status must be a supported value');
  }

  return { valid: errors.length === 0, errors };
}

function buildCryptoPosition(payload) {
  return {
    id: payload.id,
    userId: payload.userId,
    accountId: payload.accountId || null,
    gateway: payload.gateway || null,
    symbol: payload.symbol,
    side: payload.side,
    size: Number(payload.size),
    entryPrice: payload.entryPrice !== undefined ? Number(payload.entryPrice) : null,
    markPrice: payload.markPrice !== undefined ? Number(payload.markPrice) : null,
    liquidationPrice:
      payload.liquidationPrice !== undefined ? Number(payload.liquidationPrice) : null,
    leverage: payload.leverage !== undefined ? Number(payload.leverage) : null,
    marginUsed: payload.marginUsed !== undefined ? Number(payload.marginUsed) : null,
    unrealizedPnl: payload.unrealizedPnl !== undefined ? Number(payload.unrealizedPnl) : null,
    realizedPnl: payload.realizedPnl !== undefined ? Number(payload.realizedPnl) : null,
    status: payload.status || CRYPTO_POSITION_STATUSES.OPEN,
    openedAt: payload.openedAt || null,
    closedAt: payload.closedAt || null,
    metadata: payload.metadata || {},
  };
}

function describePositionSummary(position) {
  if (!position) {
    return null;
  }
  return {
    id: position.id,
    symbol: position.symbol,
    side: position.side,
    size: position.size,
    entryPrice: position.entryPrice,
    markPrice: position.markPrice,
    leverage: position.leverage,
    unrealizedPnl: position.unrealizedPnl,
    realizedPnl: position.realizedPnl,
    status: position.status,
  };
}

function computePositionPnl({ side, entryPrice, markPrice, size } = {}) {
  if (!entryPrice || !markPrice || !size) {
    return null;
  }
  const entry = Number(entryPrice);
  const mark = Number(markPrice);
  const quantity = Number(size);

  const isLong = side === CRYPTO_POSITION_SIDES.LONG;
  const delta = isLong ? mark - entry : entry - mark;

  const pnl = delta * quantity;
  const pnlPercent = entry > 0 ? (delta / entry) * 100 : 0;

  return {
    pnl,
    pnlPercent,
    notional: mark * quantity,
  };
}

module.exports = {
  CRYPTO_POSITION_STATUSES,
  CRYPTO_POSITION_SIDES,
  CRYPTO_POSITION_SCHEMA,
  validateCryptoPosition,
  buildCryptoPosition,
  describePositionSummary,
  computePositionPnl,
};