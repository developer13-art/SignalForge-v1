/**
 * TradingView Validator
 *
 * Provides validation for TradingView webhook payloads, secrets, and
 * replay protection tokens. TradingView alerts are delivered as JSON
 * bodies signed by a per-integration secret.
 *
 * @module server/modules/signal-sources/tradingview/tradingview.validator
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { normalizeSymbol } = require('@signalforge/shared/validators/symbol.validator');
const { normalizeDirection } = require('@signalforge/shared/constants/order-directions');
const { parsePrice } = require('@signalforge/shared/validators/price.validator');

const MAX_PAYLOAD_BYTES = 64 * 1024;
const MAX_SECRET_LENGTH = 256;
const MAX_ALERT_NAME_LENGTH = 256;
const MAX_NOTES_LENGTH = 2048;
function validateSecret(secret, expectedSecret) {
  if (!secret || typeof secret !== 'string') {
    throw new AppError('TradingView webhook secret is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 401);
  }

  if (typeof secret !== 'string' || secret.length > MAX_SECRET_LENGTH) {
    throw new AppError('TradingView webhook secret is invalid', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 401);
  }

  if (expectedSecret && secret !== expectedSecret) {
    throw new AppError('TradingView webhook secret does not match', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 401);
  }

  return secret;
}
function validatePayloadSize(rawBody) {
  if (!rawBody) {
    throw new AppError('TradingView payload is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const size = Buffer.isBuffer(rawBody)
    ? rawBody.length
    : Buffer.byteLength(String(rawBody), 'utf8');

  if (size > MAX_PAYLOAD_BYTES) {
    throw new AppError(`TradingView payload exceeds ${MAX_PAYLOAD_BYTES} bytes`, ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 413);
  }

  return size;
}
function validateAlertName(alertName) {
  if (!alertName || typeof alertName !== 'string') {
    throw new AppError('TradingView alert name is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const trimmed = alertName.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_ALERT_NAME_LENGTH) {
    throw new AppError('TradingView alert name is invalid', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  return trimmed;
}
function validateSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    throw new AppError('TradingView symbol is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const normalized = normalizeSymbol(symbol);

  if (!normalized) {
    throw new AppError(`TradingView symbol "${symbol}" could not be normalized`, ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  return normalized;
}
function validateDirection(direction) {
  if (!direction || typeof direction !== 'string') {
    throw new AppError('TradingView direction is required', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const normalized = normalizeDirection(direction);

  if (!normalized) {
    throw new AppError(`TradingView direction "${direction}" is invalid`, ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  return normalized;
}
function validateOptionalPrice(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = parsePrice(value);

  if (parsed === null) {
    throw new AppError(`TradingView ${fieldName} is invalid`, ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  return parsed;
}
function validateOptionalNotes(notes) {
  if (notes === undefined || notes === null) {
    return null;
  }

  if (typeof notes !== 'string') {
    throw new AppError('TradingView notes must be a string', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  if (notes.length > MAX_NOTES_LENGTH) {
    throw new AppError(`TradingView notes exceed ${MAX_NOTES_LENGTH} characters`, ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  return notes;
}
function validateWebhookPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('TradingView payload must be an object', ERROR_CODES.TRADINGVIEW_WEBHOOK_INVALID, 400);
  }

  const symbol = validateSymbol(payload.symbol);
  const direction = validateDirection(payload.direction || payload.action || payload.side);
  const alertName = validateAlertName(payload.alert_name || payload.alertName || 'TradingView Alert');

  const entry = validateOptionalPrice(payload.entry ?? payload.price, 'entry');
  const stopLoss = validateOptionalPrice(payload.stop_loss ?? payload.sl ?? payload.stopLoss, 'stop_loss');
  const takeProfit = validateOptionalPrice(payload.take_profit ?? payload.tp ?? payload.takeProfit, 'take_profit');

  let takeProfits = [];
  if (Array.isArray(payload.take_profits)) {
    takeProfits = payload.take_profits
      .map((tp) => validateOptionalPrice(tp, 'take_profits'))
      .filter((tp) => tp !== null);
  } else if (takeProfit !== null) {
    takeProfits = [takeProfit];
  }

  const notes = validateOptionalNotes(payload.notes);

  return {
    alertName,
    symbol,
    direction,
    entryType: payload.entry_type || payload.entryType || 'MARKET',
    entry,
    stopLoss,
    takeProfits,
    timeframe: payload.timeframe || payload.interval || null,
    notes,
    timestamp: payload.timestamp || payload.time || null,
    alertId: payload.alert_id || payload.alertId || null,
  };
}
function validateReplayProtection({ alertId, timestamp, windowSeconds = 300 }) {
  if (!alertId) {
    return { valid: true };
  }

  if (!timestamp) {
    return { valid: true };
  }

  const alertTime = Number(timestamp);

  if (!Number.isFinite(alertTime)) {
    return { valid: true };
  }

  const alertMs = alertTime > 1e12 ? alertTime : alertTime * 1000;
  const now = Date.now();
  const ageSeconds = Math.abs(now - alertMs) / 1000;

  if (ageSeconds > windowSeconds) {
    throw new AppError('TradingView webhook has expired', ERROR_CODES.TRADINGVIEW_WEBHOOK_EXPIRED, 400);
  }

  return { valid: true, ageSeconds };
}
const TRADINGVIEW_VALIDATION_CONSTRAINTS = Object.freeze({
  maxPayloadBytes: MAX_PAYLOAD_BYTES,
  maxSecretLength: MAX_SECRET_LENGTH,
  maxAlertNameLength: MAX_ALERT_NAME_LENGTH,
  maxNotesLength: MAX_NOTES_LENGTH,
  defaultReplayWindowSeconds: 300,
});
module.exports.TRADINGVIEW_VALIDATION_CONSTRAINTS = TRADINGVIEW_VALIDATION_CONSTRAINTS;
module.exports.validateSecret = validateSecret;
module.exports.validatePayloadSize = validatePayloadSize;
module.exports.validateAlertName = validateAlertName;
module.exports.validateSymbol = validateSymbol;
module.exports.validateDirection = validateDirection;
module.exports.validateOptionalPrice = validateOptionalPrice;
module.exports.validateOptionalNotes = validateOptionalNotes;
module.exports.validateWebhookPayload = validateWebhookPayload;
module.exports.validateReplayProtection = validateReplayProtection;
