'use strict';

/**
 * SignalForge - Instrument Class Schema
 */

const INSTRUMENT_CLASSES = Object.freeze({
  FOREX: 'forex',
  METALS: 'metals',
  INDICES: 'indices',
  COMMODITIES: 'commodities',
  CRYPTO_SPOT: 'crypto_spot',
  CRYPTO_PERP: 'crypto_perp',
  CRYPTO_LP: 'crypto_lp',
  STABLECOIN: 'stablecoin',
  UNKNOWN: 'unknown',
});

const INSTRUMENT_CLASS_LABELS = Object.freeze({
  forex: 'Forex',
  metals: 'Metals',
  indices: 'Indices',
  commodities: 'Commodities',
  crypto_spot: 'Crypto Spot',
  crypto_perp: 'Crypto Perpetual',
  crypto_lp: 'Crypto LP',
  stablecoin: 'Stablecoin',
  unknown: 'Unknown',
});

const INSTRUMENT_CLASS_SCHEMA = Object.freeze({
  type: 'object',
  required: ['symbol', 'instrumentClass'],
  properties: {
    symbol: { type: 'string', minLength: 1, maxLength: 32 },
    instrumentClass: {
      type: 'string',
      enum: Object.values(INSTRUMENT_CLASSES),
    },
    base: { type: ['string', 'null'] },
    quote: { type: ['string', 'null'] },
    isPerp: { type: 'boolean' },
    isCrypto: { type: 'boolean' },
    description: { type: 'string' },
  },
  additionalProperties: false,
});

function validateInstrumentClass(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload must be an object'] };
  }

  if (!payload.symbol) {
    errors.push('symbol is required');
  }

  if (!payload.instrumentClass || !Object.values(INSTRUMENT_CLASSES).includes(payload.instrumentClass)) {
    errors.push('instrumentClass must be a supported value');
  }

  return { valid: errors.length === 0, errors };
}

function describeInstrumentClass(instrumentClass) {
  const label = INSTRUMENT_CLASS_LABELS[instrumentClass] || 'Unknown';
  const isCrypto = [
    INSTRUMENT_CLASSES.CRYPTO_SPOT,
    INSTRUMENT_CLASSES.CRYPTO_PERP,
    INSTRUMENT_CLASSES.CRYPTO_LP,
    INSTRUMENT_CLASSES.STABLECOIN,
  ].includes(instrumentClass);

  const isTraditional = [
    INSTRUMENT_CLASSES.FOREX,
    INSTRUMENT_CLASSES.METALS,
    INSTRUMENT_CLASSES.INDICES,
    INSTRUMENT_CLASSES.COMMODITIES,
  ].includes(instrumentClass);

  return {
    instrumentClass,
    label,
    isCrypto,
    isTraditional,
    isPerp: instrumentClass === INSTRUMENT_CLASSES.CRYPTO_PERP,
  };
}

function buildInstrumentClassRecord({ symbol, instrumentClass, base, quote, isPerp }) {
  return {
    symbol,
    instrumentClass,
    base: base || null,
    quote: quote || null,
    isPerp: isPerp === true,
    isCrypto: describeInstrumentClass(instrumentClass).isCrypto,
    description: INSTRUMENT_CLASS_LABELS[instrumentClass] || 'Unknown',
  };
}

module.exports = {
  INSTRUMENT_CLASSES,
  INSTRUMENT_CLASS_LABELS,
  INSTRUMENT_CLASS_SCHEMA,
  validateInstrumentClass,
  describeInstrumentClass,
  buildInstrumentClassRecord,
};