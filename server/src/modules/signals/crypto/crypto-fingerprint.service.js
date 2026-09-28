'use strict';

const crypto = require('crypto');

const {
  CRYPTO_FINGERPRINT_ALGORITHM,
  CRYPTO_FINGERPRINT_VERSION,
  CRYPTO_FINGERPRINT_FIELDS,
} = require('./crypto.constants');

const {
  FingerprintFailedError,
} = require('./crypto.errors');

/**
 * SignalForge - Crypto Fingerprint Service
 *
 * Computes a stable, canonical fingerprint for a normalized crypto
 * signal. The fingerprint is used for duplicate detection across
 * near-equivalent phrasings (e.g., BTC/USDT vs BTCUSDT) and as an
 * idempotency anchor for downstream processing.
 */

function serializeValue(value) {
  if (value === undefined || value === null) {
    return 'null';
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(12);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => serializeValue(entry)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${key}:${serializeValue(value[key])}`).join(',')}}`;
  }
  return String(value);
}

function buildCanonicalPayload(signal) {
  if (!signal) {
    throw new FingerprintFailedError('Signal is required to compute a fingerprint');
  }

  const payload = {
    version: CRYPTO_FINGERPRINT_VERSION,
  };

  for (const field of CRYPTO_FINGERPRINT_FIELDS) {
    const value = signal[field];
    if (value !== undefined) {
      payload[field] = value;
    }
  }

  if (!payload.canonicalSymbol) {
    throw new FingerprintFailedError('canonicalSymbol is required for fingerprinting');
  }
  if (!payload.direction) {
    throw new FingerprintFailedError('direction is required for fingerprinting');
  }

  return payload;
}

function computeFingerprint(signal) {
  const payload = buildCanonicalPayload(signal);
  const serialized = serializeValue(payload);
  return crypto
    .createHash(CRYPTO_FINGERPRINT_ALGORITHM)
    .update(serialized, 'utf8')
    .digest('hex');
}

function computeFingerprintShort(signal, length = 16) {
  const full = computeFingerprint(signal);
  return full.slice(0, length);
}

function compareFingerprints(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function buildDeduplicationKey(signal) {
  if (!signal) {
    return null;
  }
  return `${CRYPTO_FINGERPRINT_ALGORITHM}:${CRYPTO_FINGERPRINT_VERSION}:${computeFingerprintShort(signal, 24)}`;
}

function describeFingerprint(signal) {
  const payload = buildCanonicalPayload(signal);
  const fingerprint = computeFingerprint(signal);
  return {
    fingerprint,
    short: fingerprint.slice(0, 16),
    payload,
    algorithm: CRYPTO_FINGERPRINT_ALGORITHM,
    version: CRYPTO_FINGERPRINT_VERSION,
  };
}

function deduplicateSignals(signals) {
  if (!Array.isArray(signals)) {
    return [];
  }
  const seen = new Set();
  const result = [];
  for (const signal of signals) {
    try {
      const fingerprint = computeFingerprint(signal);
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        result.push({ signal, fingerprint });
      }
    } catch (_error) {
      // Skip signals that cannot be fingerprinted.
    }
  }
  return result;
}

module.exports = {
  serializeValue,
  buildCanonicalPayload,
  computeFingerprint,
  computeFingerprintShort,
  compareFingerprints,
  buildDeduplicationKey,
  describeFingerprint,
  deduplicateSignals,
};