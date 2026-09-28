'use strict';

const cryptoPairMapper = require('./crypto-pair-mapper.service');
const cryptoRegistry = require('./crypto-symbol-registry');

const {
  CRYPTO_DIRECTIONS,
  CRYPTO_ORDER_TYPES,
  CRYPTO_SYMBOL_CLASSES,
} = require('./crypto.constants');

const {
  InvalidDirectionError,
  InvalidOrderTypeError,
  InvalidPriceError,
  InvalidAmountError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto Normalizer Service
 *
 * Normalizes a raw crypto signal into a canonical structure that the
 * rest of the platform consumes. This service is deterministic: the
 * same inputs always produce the same output.
 */

function normalizeDirection(direction) {
  if (!direction) {
    return CRYPTO_DIRECTIONS.BUY;
  }
  const normalized = String(direction).trim().toUpperCase();
  if (['BUY', 'LONG'].includes(normalized)) {
    return CRYPTO_DIRECTIONS.BUY;
  }
  if (['SELL', 'SHORT'].includes(normalized)) {
    return CRYPTO_DIRECTIONS.SELL;
  }
  throw new InvalidDirectionError(`Unsupported direction: ${direction}`, { direction });
}

function normalizeOrderType(orderType) {
  if (!orderType) {
    return CRYPTO_ORDER_TYPES.MARKET;
  }
  const normalized = String(orderType).trim().toLowerCase();
  if (Object.values(CRYPTO_ORDER_TYPES).includes(normalized)) {
    return normalized;
  }
  if (normalized === 'market_order' || normalized === 'market-execution') {
    return CRYPTO_ORDER_TYPES.MARKET;
  }
  if (normalized === 'limit_order' || normalized === 'limit-execution') {
    return CRYPTO_ORDER_TYPES.LIMIT;
  }
  throw new InvalidOrderTypeError(`Unsupported order type: ${orderType}`, { orderType });
}

function normalizePositiveNumber(value, { field, allowZero = false } = {}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new InvalidPriceError(`${field} must be a finite number`, { [field]: value });
  }
  if (!allowZero && numeric <= 0) {
    throw new InvalidPriceError(`${field} must be greater than zero`, { [field]: value });
  }
  if (numeric < 0) {
    throw new InvalidPriceError(`${field} must not be negative`, { [field]: value });
  }
  return numeric;
}

function normalizeTakeProfits(takeProfits) {
  if (!takeProfits) {
    return [];
  }
  if (Array.isArray(takeProfits)) {
    return takeProfits
      .map((value) => {
        try {
          return normalizePositiveNumber(value, { field: 'takeProfit' });
        } catch (_error) {
          return null;
        }
      })
      .filter((value) => value !== null);
  }
  const single = normalizePositiveNumber(takeProfits, { field: 'takeProfit' });
  return single ? [single] : [];
}

async function normalizeCryptoSignal({
  symbol,
  direction,
  orderType,
  entryType,
  entryPrice,
  stopLoss,
  takeProfits,
  amount,
  timeframe,
  confidence,
  language,
  rawText,
} = {}) {
  if (!symbol) {
    throw new InvalidPriceError('symbol is required');
  }

  const mapped = await cryptoPairMapper.mapPair({ symbol });

  const normalizedDirection = normalizeDirection(direction);
  const normalizedOrderType = normalizeOrderType(orderType || entryType);

  const normalizedEntryPrice = normalizePositiveNumber(entryPrice, {
    field: 'entryPrice',
  });
  const normalizedStopLoss = normalizePositiveNumber(stopLoss, { field: 'stopLoss' });
  const normalizedTakeProfits = normalizeTakeProfits(takeProfits);

  let normalizedAmount = null;
  if (amount !== undefined && amount !== null && amount !== '') {
    try {
      normalizedAmount = normalizePositiveNumber(amount, { field: 'amount' });
    } catch (_error) {
      throw new InvalidAmountError(`Invalid amount: ${amount}`, { amount });
    }
  }

  const riskRewardRatio = computeRiskRewardRatio({
    direction: normalizedDirection,
    entryPrice: normalizedEntryPrice,
    stopLoss: normalizedStopLoss,
    takeProfits: normalizedTakeProfits,
  });

  return {
    canonicalSymbol: mapped.canonicalSymbol,
    baseAsset: mapped.baseAsset,
    quoteAsset: mapped.quoteAsset,
    symbolClass: mapped.symbolClass,
    isPerp: mapped.isPerp,
    isSwap: mapped.isSwap,
    isStablePair: mapped.isStablePair,
    direction: normalizedDirection,
    orderType: normalizedOrderType,
    entryType: normalizedOrderType,
    entryPrice: normalizedEntryPrice,
    stopLoss: normalizedStopLoss,
    takeProfits: normalizedTakeProfits,
    takeProfit: normalizedTakeProfits[0] || null,
    amount: normalizedAmount,
    timeframe: timeframe || null,
    confidence: normalizeConfidence(confidence),
    language: language || null,
    riskRewardRatio,
    rawText: rawText ? String(rawText).slice(0, 4000) : null,
    symbolId: mapped.symbolId,
  };
}

function computeRiskRewardRatio({ direction, entryPrice, stopLoss, takeProfits } = {}) {
  if (!entryPrice || !stopLoss || !Array.isArray(takeProfits) || takeProfits.length === 0) {
    return null;
  }

  const firstTakeProfit = takeProfits[0];
  const isBuy = direction === CRYPTO_DIRECTIONS.BUY;
  const risk = isBuy ? entryPrice - stopLoss : stopLoss - entryPrice;
  const reward = isBuy ? firstTakeProfit - entryPrice : entryPrice - firstTakeProfit;

  if (risk <= 0 || reward <= 0) {
    return null;
  }

  return Math.round((reward / risk) * 100) / 100;
}

function normalizeConfidence(confidence) {
  if (confidence === undefined || confidence === null || confidence === '') {
    return null;
  }
  const numeric = Number(confidence);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  if (numeric > 1) {
    return Math.min(1, numeric / 100);
  }
  return Math.max(0, Math.min(1, numeric));
}

function isStablePair({ baseAsset, quoteAsset } = {}) {
  return cryptoRegistry.isStableQuote(baseAsset) && cryptoRegistry.isStableQuote(quoteAsset);
}

function classifySymbol(symbol) {
  const parts = cryptoPairMapper.resolveParts(symbol);
  const symbolClass = cryptoPairMapper.classifySymbolClass({
    isPerp: parts.isPerp,
    isSwap: parts.isSwap,
  });
  return {
    ...parts,
    symbolClass,
    isKnownBase: cryptoRegistry.isBaseAsset(parts.base),
    isKnownQuote: cryptoRegistry.isQuoteAsset(parts.quote),
  };
}

function describeNormalizedSignal(signal) {
  if (!signal) {
    return null;
  }
  return {
    symbol: signal.canonicalSymbol,
    direction: signal.direction,
    orderType: signal.orderType,
    entryPrice: signal.entryPrice,
    stopLoss: signal.stopLoss,
    takeProfits: signal.takeProfits,
    riskRewardRatio: signal.riskRewardRatio,
    confidence: signal.confidence,
  };
}

module.exports = {
  normalizeDirection,
  normalizeOrderType,
  normalizePositiveNumber,
  normalizeTakeProfits,
  normalizeCryptoSignal,
  computeRiskRewardRatio,
  normalizeConfidence,
  isStablePair,
  classifySymbol,
  describeNormalizedSignal,
  SYMBOL_CLASSES: CRYPTO_SYMBOL_CLASSES,
};