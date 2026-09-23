/**
 * Schema Mapper Service
 *
 * Maps a parsed signal from various internal shapes to the canonical
 * standardized signal object. Handles field aliasing, type coercion,
 * and default application.
 *
 * @module signalforge/server/modules/signal-standardization/schema-mapper
 */

import {
  STANDARD_SIGNAL_REQUIRED_FIELDS,
  STANDARD_SIGNAL_SCHEMA_VERSION,
} from './standardization.constants.js';
import { StandardizationInvalidInputError } from './standardization.errors.js';

const FIELD_ALIASES = Object.freeze({
  symbol: ['symbol', 'Symbol', 'ticker', 'pair'],
  normalizedSymbol: ['normalizedSymbol', 'normalized_symbol'],
  direction: ['direction', 'side', 'action', 'bias'],
  entryType: ['entryType', 'entry_type', 'orderType', 'order_type'],
  entryPrice: ['entryPrice', 'entry_price', 'entry', 'price'],
  stopLoss: ['stopLoss', 'stop_loss', 'sl', 'stop'],
  takeProfits: ['takeProfits', 'take_profits', 'takeProfit', 'tp', 'targets'],
  riskPercent: ['riskPercent', 'risk_percent', 'risk'],
  lotSize: ['lotSize', 'lot_size', 'volume', 'size'],
  timeframe: ['timeframe', 'time_frame', 'tf'],
  classification: ['classification', 'class'],
  confidence: ['confidence', 'confidence_score'],
});

function pick(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      return obj[key];
    }
  }
  return undefined;
}

export class SchemaMapperService {
  map(input, envelope = {}) {
    if (!input || typeof input !== 'object') {
      throw new StandardizationInvalidInputError('Signal input must be an object');
    }

    const mapped = {
      signalId: input.signalId || envelope.signalId || null,
      providerId: input.providerId || envelope.providerId || null,
      sourceType: input.sourceType || envelope.sourceType || null,
      sourceId: input.sourceId || envelope.sourceId || null,
      rawMessageId: input.rawMessageId || envelope.rawMessageId || null,
      channelId: input.channelId || envelope.channelId || null,
      symbol: pick(input, FIELD_ALIASES.symbol),
      normalizedSymbol: pick(input, FIELD_ALIASES.normalizedSymbol) || null,
      direction: pick(input, FIELD_ALIASES.direction),
      entryType: pick(input, FIELD_ALIASES.entryType) || 'MARKET',
      entryPrice: pick(input, FIELD_ALIASES.entryPrice) ?? null,
      stopLoss: pick(input, FIELD_ALIASES.stopLoss) ?? null,
      takeProfits: pick(input, FIELD_ALIASES.takeProfits) || [],
      riskPercent: pick(input, FIELD_ALIASES.riskPercent) ?? null,
      lotSize: pick(input, FIELD_ALIASES.lotSize) ?? null,
      timeframe: pick(input, FIELD_ALIASES.timeframe) || null,
      classification: pick(input, FIELD_ALIASES.classification),
      confidence: pick(input, FIELD_ALIASES.confidence),
      parserType: input.parserType || null,
      parserVersion: input.parserVersion || null,
      aiModel: input.aiModel || null,
      dnaVersion: input.dnaVersion || null,
      language: input.language || null,
      originalText: input.originalText || envelope.originalText || null,
      context: input.context || envelope.context || null,
      timestamp: input.timestamp || envelope.timestamp || new Date().toISOString(),
      expiresAt: input.expiresAt || null,
      fingerprint: input.fingerprint || null,
      metadata: input.metadata || null,
      schemaVersion: STANDARD_SIGNAL_SCHEMA_VERSION,
    };

    if (!Array.isArray(mapped.takeProfits)) {
      mapped.takeProfits = mapped.takeProfits ? [mapped.takeProfits] : [];
    }

    this.assertRequiredFields(mapped);

    return mapped;
  }

  assertRequiredFields(mapped) {
    const missing = [];
    for (const field of STANDARD_SIGNAL_REQUIRED_FIELDS) {
      if (mapped[field] === undefined || mapped[field] === null) {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      throw new StandardizationInvalidInputError(
        `Missing required fields: ${missing.join(', ')}`,
        { missing },
      );
    }
  }
}

export default SchemaMapperService;