/**
 * Signal Payload Validator
 *
 * Provides validation for raw signal payloads received from REST API
 * sources, TradingView webhooks, and direct provider integrations.
 *
 * @module @signalforge/shared/validators/signal-payload
 */const { ORDER_DIRECTION_VALUES, normalizeDirection } = require('../constants/order-directions.js');const { ENTRY_TYPE_VALUES } = require('../constants/order-types.js');const { normalizeSymbol, isValidSymbol } = require('./symbol.validator.js');const { parsePrice, isValidPrice } = require('./price.validator.js');const { parseVolume } = require('./lot-size.validator.js');
const MAX_SIGNAL_PAYLOAD_SIZE = 100 * 1024;
const MAX_NOTES_LENGTH = 2048;function validateSignalPayload(payload, options = {}) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Signal payload must be an object'] };
  }

  const serialized = JSON.stringify(payload);
  if (serialized.length > MAX_SIGNAL_PAYLOAD_SIZE) {
    errors.push(`Signal payload must not exceed ${MAX_SIGNAL_PAYLOAD_SIZE} bytes`);
  }

  if (!payload.symbol) {
    errors.push('Symbol is required');
  } else {
    const symbolValidation = isValidSymbol(payload.symbol);
    if (!symbolValidation) {
      errors.push('Symbol is invalid');
    }
  }

  if (!payload.direction) {
    errors.push('Direction is required');
  } else {
    const normalizedDirection = normalizeDirection(payload.direction);
    if (!normalizedDirection) {
      errors.push(`Direction "${payload.direction}" is invalid`);
    }
  }

  if (payload.entryType !== undefined && payload.entryType !== null) {
    if (!ENTRY_TYPE_VALUES.includes(payload.entryType)) {
      errors.push(`entryType "${payload.entryType}" is invalid`);
    }
  }

  if (payload.entryType !== 'MARKET' && payload.entryType !== undefined) {
    if (payload.entryPrice === undefined || payload.entryPrice === null) {
      errors.push('entryPrice is required for non-market orders');
    }
  }

  if (payload.entryPrice !== undefined && payload.entryPrice !== null) {
    if (!isValidPrice(payload.entryPrice)) {
      errors.push('entryPrice is invalid');
    }
  }

  if (payload.stopLoss !== undefined && payload.stopLoss !== null) {
    if (!isValidPrice(payload.stopLoss)) {
      errors.push('stopLoss is invalid');
    }
  }

  if (payload.takeProfits !== undefined && payload.takeProfits !== null) {
    if (!Array.isArray(payload.takeProfits)) {
      errors.push('takeProfits must be an array');
    } else {
      for (let i = 0; i < payload.takeProfits.length; i++) {
        if (!isValidPrice(payload.takeProfits[i])) {
          errors.push(`takeProfits[${i}] is invalid`);
        }
      }
    }
  }

  if (payload.riskPercent !== undefined && payload.riskPercent !== null) {
    if (
      typeof payload.riskPercent !== 'number' ||
      payload.riskPercent < 0 ||
      payload.riskPercent > 100
    ) {
      errors.push('riskPercent must be between 0 and 100');
    }
  }

  if (payload.lotSize !== undefined && payload.lotSize !== null) {
    const parsed = parseVolume(payload.lotSize);
    if (parsed === null || parsed <= 0) {
      errors.push('lotSize is invalid');
    }
  }

  if (payload.notes !== undefined && payload.notes !== null) {
    if (typeof payload.notes !== 'string') {
      errors.push('notes must be a string');
    } else if (payload.notes.length > MAX_NOTES_LENGTH) {
      errors.push(`notes must not exceed ${MAX_NOTES_LENGTH} characters`);
    }
  }

  if (options.requireStopLoss && (payload.stopLoss === undefined || payload.stopLoss === null)) {
    errors.push('stopLoss is required');
  }

  if (
    options.requireTakeProfit &&
    (payload.takeProfits === undefined ||
      payload.takeProfits === null ||
      payload.takeProfits.length === 0)
  ) {
    errors.push('At least one take profit is required');
  }

  return { valid: errors.length === 0, errors };
}function normalizeSignalPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const normalized = {
    symbol: payload.symbol ? normalizeSymbol(payload.symbol) : null,
    direction: payload.direction ? normalizeDirection(payload.direction) : null,
    entryType: payload.entryType || 'MARKET',
    entryPrice: payload.entryPrice !== undefined ? parsePrice(payload.entryPrice) : null,
    stopLoss: payload.stopLoss !== undefined ? parsePrice(payload.stopLoss) : null,
    takeProfits: Array.isArray(payload.takeProfits)
      ? payload.takeProfits.map((tp) => parsePrice(tp)).filter((tp) => tp !== null)
      : [],
    riskPercent:
      typeof payload.riskPercent === 'number' ? payload.riskPercent : null,
    lotSize: payload.lotSize !== undefined ? parseVolume(payload.lotSize) : null,
    timeframe: payload.timeframe || null,
    notes: payload.notes || null,
    source: payload.source || null,
    sourceId: payload.sourceId || null,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  return normalized;
}function validateSignalWebhookPayload(payload, secret) {
  const errors = [];

  const baseValidation = validateSignalPayload(payload);
  if (!baseValidation.valid) {
    return baseValidation;
  }

  if (!secret || typeof secret !== 'string') {
    errors.push('Webhook secret is required for verification');
  }

  if (payload.secret !== undefined && payload.secret !== secret) {
    errors.push('Webhook secret does not match');
  }

  return { valid: errors.length === 0, errors };
}const SIGNAL_PAYLOAD_CONSTRAINTS = Object.freeze({
  maxSize: MAX_SIGNAL_PAYLOAD_SIZE,
  maxNotesLength: MAX_NOTES_LENGTH,
  directions: ORDER_DIRECTION_VALUES,
  entryTypes: ENTRY_TYPE_VALUES,
});

module.exports.validateSignalPayload = validateSignalPayload;
module.exports.normalizeSignalPayload = normalizeSignalPayload;
module.exports.validateSignalWebhookPayload = validateSignalWebhookPayload;
module.exports.MAX_SIGNAL_PAYLOAD_SIZE = MAX_SIGNAL_PAYLOAD_SIZE;
module.exports.MAX_NOTES_LENGTH = MAX_NOTES_LENGTH;
module.exports.SIGNAL_PAYLOAD_CONSTRAINTS = SIGNAL_PAYLOAD_CONSTRAINTS;
