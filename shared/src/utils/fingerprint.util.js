/**
 * Fingerprint Utilities
 *
 * Provides helpers for generating stable fingerprints of signals,
 * messages, and trades for duplicate detection and deduplication.
 *
 * @module @signalforge/shared/utils/fingerprint
 */

import crypto from 'node:crypto';
import { canonicalize } from './hash.util.js';
import { normalizeSymbol } from '../validators/symbol.validator.js';
import { normalizeDirection } from '../constants/order-directions.js';

const FINGERPRINT_ALGORITHM = 'sha256';
const FINGERPRINT_LENGTH = 64;

export function buildSignalFingerprint(signal) {
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
}

export function buildMessageFingerprint(message) {
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
}

export function buildTradeFingerprint(trade) {
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
}

export function buildContentFingerprint(text) {
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
}

export function hashFingerprint(input) {
  const canonical = canonicalize(input);
  return crypto
    .createHash(FINGERPRINT_ALGORITHM)
    .update(canonical)
    .digest('hex');
}

export function buildPrefixFingerprint(input, prefixLength = 16) {
  const full = hashFingerprint(input);
  return full.substring(0, prefixLength);
}

export function fingerprintEquals(fingerprintA, fingerprintB) {
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
}

export function isValidFingerprint(fingerprint) {
  if (typeof fingerprint !== 'string') {
    return false;
  }
  if (fingerprint.length !== FINGERPRINT_LENGTH) {
    return false;
  }
  return /^[a-f0-9]+$/.test(fingerprint);
}

export function buildDuplicateKey(fingerprint, windowSeconds) {
  if (typeof fingerprint !== 'string') {
    throw new Error('Fingerprint must be a string');
  }
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSeconds);
  return `${fingerprint}:${window}`;
}

export function buildProviderSignalFingerprint(providerId, signal) {
  if (!providerId) {
    throw new Error('Provider id is required');
  }
  const signalFingerprint = buildSignalFingerprint(signal);
  return hashFingerprint({ providerId, signalFingerprint });
}

export function buildContractFingerprint(contract) {
  if (!contract || typeof contract !== 'object') {
    throw new Error('Contract must be an object');
  }
  return hashFingerprint(contract);
}

export const FINGERPRINT_CONSTRAINTS = Object.freeze({
  algorithm: FINGERPRINT_ALGORITHM,
  length: FINGERPRINT_LENGTH,
  prefixLength: 16,
});