'use strict';

/**
 * SignalForge - DEX Order Schema
 */

const DEX_ORDER_TYPES = Object.freeze({
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
  TRAILING_STOP: 'trailing_stop',
});

const DEX_ORDER_SIDES = Object.freeze({
  BUY: 'buy',
  SELL: 'sell',
});

const DEX_ORDER_STATUSES = Object.freeze({
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  PARTIAL: 'partial',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  EXPIRED: 'expired',
});

const DEX_ORDER_SCHEMA = Object.freeze({
  type: 'object',
  required: ['symbol', 'side', 'orderType', 'size'],
  properties: {
    id: { type: 'string' },
    userId: { type: ['string', 'null'] },
    accountId: { type: ['string', 'null'] },
    gateway: { type: 'string' },
    symbol: { type: 'string' },
    side: { type: 'string', enum: Object.values(DEX_ORDER_SIDES) },
    orderType: { type: 'string', enum: Object.values(DEX_ORDER_TYPES) },
    tif: { type: ['string', 'null'] },
    size: { type: 'number', minimum: 0 },
    price: { type: ['number', 'null'], minimum: 0 },
    triggerPrice: { type: ['number', 'null'], minimum: 0 },
    reduceOnly: { type: 'boolean' },
    leverage: { type: ['number', 'null'], minimum: 1 },
    status: { type: 'string', enum: Object.values(DEX_ORDER_STATUSES) },
    signature: { type: ['string', 'null'] },
    submittedAt: { type: ['string', 'null'], format: 'date-time' },
    confirmedAt: { type: ['string', 'null'], format: 'date-time' },
    errorMessage: { type: ['string', 'null'] },
  },
  additionalProperties: false,
});

function validateDexOrder(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['order must be an object'] };
  }

  if (!payload.symbol) {
    errors.push('symbol is required');
  }
  if (!payload.side || !Object.values(DEX_ORDER_SIDES).includes(payload.side)) {
    errors.push('side must be buy or sell');
  }
  if (!payload.orderType || !Object.values(DEX_ORDER_TYPES).includes(payload.orderType)) {
    errors.push('orderType must be a supported type');
  }
  if (payload.size === undefined || Number(payload.size) <= 0) {
    errors.push('size must be greater than zero');
  }

  if (payload.status && !Object.values(DEX_ORDER_STATUSES).includes(payload.status)) {
    errors.push('status must be a supported value');
  }

  return { valid: errors.length === 0, errors };
}

function buildDexOrder(payload) {
  return {
    id: payload.id || null,
    userId: payload.userId || null,
    accountId: payload.accountId || null,
    gateway: payload.gateway || null,
    symbol: payload.symbol,
    side: payload.side,
    orderType: payload.orderType,
    tif: payload.tif || null,
    size: Number(payload.size),
    price: payload.price !== undefined ? Number(payload.price) : null,
    triggerPrice: payload.triggerPrice !== undefined ? Number(payload.triggerPrice) : null,
    reduceOnly: payload.reduceOnly === true,
    leverage: payload.leverage !== undefined ? Number(payload.leverage) : null,
    status: payload.status || DEX_ORDER_STATUSES.PENDING,
    signature: payload.signature || null,
    submittedAt: payload.submittedAt || null,
    confirmedAt: payload.confirmedAt || null,
    errorMessage: payload.errorMessage || null,
  };
}

function isTerminalStatus(status) {
  return ['filled', 'cancelled', 'failed', 'expired'].includes(status);
}

module.exports = {
  DEX_ORDER_TYPES,
  DEX_ORDER_SIDES,
  DEX_ORDER_STATUSES,
  DEX_ORDER_SCHEMA,
  validateDexOrder,
  buildDexOrder,
  isTerminalStatus,
};