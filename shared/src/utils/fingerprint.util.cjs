/**
 * Fingerprint Utilities
 *
 * Provides helpers for generating stable fingerprints of signals,
 * messages, and trades for duplicate detection and deduplication.
 *
 * @module @signalforge/shared/utils/fingerprint
 */const crypto = require('node:crypto');
const { canonicalize } = require('./hash.util.cjs');const { normalizeSymbol } = require('../validators/symbol.validator.cjs');const { normalizeDirection } = require('../constants/order-directions.cjs');
const FINGERPRINT_ALGORITHM = 'sha256';
const FINGERPRINT_LENGTH = 64;function buildSignalFingerprint(signal) {
  if (!signal || typeof signal !== 'object') {
    throw new Error('Signal must be an object');
  }

  const components = {
    symbol: signal.symbol ? normalizeSymbol(signal.symbol) : null,
    direction: signal.direction ? normalizeDirection(signal.direction) : null,
    entryType: signal.entryType || null,
    entryPrice: signal.entryPrice ?? null,
    stopLoss: signal.stopLoss ?? null,
    takeProfits: Array.isArray(signal.takeProfits)
      ? signal.takeProfits.slice().sort((a, b) => a - b)
      : [],
  };

  return hashFingerprint(components);
}function buildMessageFingerprint(message) {
  if (!message || typeof message !== 'object') {
    throw new Error('Message must be an object');
  }

  const components = {
    sourceType: message.sourceType ? String(message.sourceType).toLowerCase() : null,
    sourceId: message.sourceId || null,
    externalMessageId: message.externalMessageId || null,
    timestamp: message.timestamp || null,
  };

  return hashFingerprint(components);
}function buildTradeFingerprint(trade) {
  if (!trade || typeof trade !== 'object') {
    throw new Error('Trade must be an object');
  }

  const components = {
    userId: trade.userId || null,
    brokerAccountId: trade.brokerAccountId || null,
    symbol: trade.symbol ? normalizeSymbol(trade.symbol) : null,
    direction: trade.direction ? normalizeDirection(trade.direction) : null,
    volume: trade.volume ?? null,
    openedAt: trade.openedAt || null,
  };

  return hashFingerprint(components);
}function buildContentFingerprint(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return crypto
    .createHash(FINGERPRINT_ALGORITHM)
    .update(normalized)
    .digest('hex');
}function hashFingerprint(input) {
  const canonical = canonicalize(input);
  return crypto
    .createHash(FINGERPRINT_ALGORITHM)
    .update(canonical)
    .digest('hex');
}function buildPrefixFingerprint(input, prefixLength = 16) {
  const full = hashFingerprint(input);
  return full.substring(0, prefixLength);
}function fingerprintEquals(fingerprintA, fingerprintB) {
  if (
    typeof fingerprintA !== 'string' ||
    typeof fingerprintB !== 'string'
  ) {
    return false;
  }
  if (fingerprintA.length !== fingerprintB.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(fingerprintA, 'hex'),
    Buffer.from(fingerprintB, 'hex'),
  );
}function isValidFingerprint(fingerprint) {
  if (typeof fingerprint !== 'string') {
    return false;
  }
  if (fingerprint.length !== FINGERPRINT_LENGTH) {
    return false;
  }
  return /^[a-f0-9]+$/.test(fingerprint);
}function buildDuplicateKey(fingerprint, windowSeconds) {
  if (typeof fingerprint !== 'string') {
    throw new Error('Fingerprint must be a string');
  }
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSeconds);
  return `${fingerprint}:${window}`;
}function buildProviderSignalFingerprint(providerId, signal) {
  if (!providerId) {
    throw new Error('Provider id is required');
  }
  const signalFingerprint = buildSignalFingerprint(signal);
  return hashFingerprint({ providerId, signalFingerprint });
}function buildContractFingerprint(contract) {
  if (!contract || typeof contract !== 'object') {
    throw new Error('Contract must be an object');
  }
  return hashFingerprint(contract);
}const FINGERPRINT_CONSTRAINTS = Object.freeze({
  algorithm: FINGERPRINT_ALGORITHM,
  length: FINGERPRINT_LENGTH,
  prefixLength: 16,
});

module.exports.buildSignalFingerprint = buildSignalFingerprint;
module.exports.buildMessageFingerprint = buildMessageFingerprint;
module.exports.buildTradeFingerprint = buildTradeFingerprint;
module.exports.buildContentFingerprint = buildContentFingerprint;
module.exports.hashFingerprint = hashFingerprint;
module.exports.buildPrefixFingerprint = buildPrefixFingerprint;
module.exports.fingerprintEquals = fingerprintEquals;
module.exports.isValidFingerprint = isValidFingerprint;
module.exports.buildDuplicateKey = buildDuplicateKey;
module.exports.buildProviderSignalFingerprint = buildProviderSignalFingerprint;
module.exports.buildContractFingerprint = buildContractFingerprint;
module.exports.crypto = crypto;
module.exports.FINGERPRINT_ALGORITHM = FINGERPRINT_ALGORITHM;
module.exports.FINGERPRINT_LENGTH = FINGERPRINT_LENGTH;
module.exports.FINGERPRINT_CONSTRAINTS = FINGERPRINT_CONSTRAINTS;
