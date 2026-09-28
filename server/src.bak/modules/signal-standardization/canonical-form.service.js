/**
 * Canonical Form Service
 *
 * Produces a canonical JSON-friendly form of a standardized signal,
 * enforcing consistent field order, type coercion, and numeric
 * precision. Used for storage, fingerprinting, and downstream
 * comparisons.
 *
 * @module signalforge/server/modules/signal-standardization/canonical-form
 */

import { STANDARD_SIGNAL_SCHEMA_VERSION } from './standardization.constants.js';
import { CanonicalFormError } from './standardization.errors.js';

function toNumberOrNull(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number(value.toFixed(8));
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? Number(parsed.toFixed(8)) : null;
  }
  return null;
}

function toStringOrNull(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return String(value);
}

function toArrayOfNumbers(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const result = [];
  for (const item of value) {
    const num = toNumberOrNull(item);
    if (num !== null) {
      result.push(num);
    }
  }
  return result;
}

export class CanonicalFormService {
  build(signal) {
    if (!signal || typeof signal !== 'object') {
      throw new CanonicalFormError('Signal must be an object');
    }

    const canonical = {
      schemaVersion: STANDARD_SIGNAL_SCHEMA_VERSION,

      signalId: toStringOrNull(signal.signalId),
      providerId: toStringOrNull(signal.providerId),
      sourceType: toStringOrNull(signal.sourceType),
      sourceId: toStringOrNull(signal.sourceId),
      rawMessageId: toStringOrNull(signal.rawMessageId),
      channelId: toStringOrNull(signal.channelId),

      symbol: toStringOrNull(signal.symbol),
      normalizedSymbol: toStringOrNull(signal.normalizedSymbol),
      direction: toStringOrNull(signal.direction),
      entryType: toStringOrNull(signal.entryType) || 'MARKET',

      entryPrice: toNumberOrNull(signal.entryPrice),
      stopLoss: toNumberOrNull(signal.stopLoss),
      takeProfits: toArrayOfNumbers(signal.takeProfits),

      riskPercent: toNumberOrNull(signal.riskPercent),
      lotSize: toNumberOrNull(signal.lotSize),
      timeframe: toStringOrNull(signal.timeframe),

      classification: toStringOrNull(signal.classification),
      confidence:
        typeof signal.confidence === 'number' && Number.isFinite(signal.confidence)
          ? Number(signal.confidence.toFixed(4))
          : null,

      parserType: toStringOrNull(signal.parserType),
      parserVersion: toStringOrNull(signal.parserVersion),
      aiModel: toStringOrNull(signal.aiModel),
      dnaVersion: toStringOrNull(signal.dnaVersion),
      language: toStringOrNull(signal.language),

      originalText: toStringOrNull(signal.originalText),
      context: signal.context || null,

      timestamp: toStringOrNull(signal.timestamp),
      expiresAt: toStringOrNull(signal.expiresAt),
      fingerprint: toStringOrNull(signal.fingerprint),
      metadata: signal.metadata || null,
    };

    return canonical;
  }

  serialize(signal) {
    const canonical = this.build(signal);
    return JSON.stringify(canonical, Object.keys(canonical).sort());
  }
}

export default CanonicalFormService;