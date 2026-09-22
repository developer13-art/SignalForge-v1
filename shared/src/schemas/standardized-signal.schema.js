/**
 * Standardized Signal Schema
 *
 * Defines the canonical structure that every parsed signal must conform
 * to before entering the trading pipeline. All source adapters and AI
 * parsers normalize their output to this shape.
 *
 * @module @signalforge/shared/schemas/standardized-signal
 */

import { ORDER_DIRECTIONS, ORDER_DIRECTION_VALUES } from '../constants/order-directions.js';
import { ENTRY_TYPES, ENTRY_TYPE_VALUES } from '../constants/order-types.js';

export const STANDARDIZED_SIGNAL_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'signalId',
    'providerId',
    'sourceType',
    'sourceId',
    'rawMessageId',
    'symbol',
    'direction',
    'entryType',
    'confidence',
    'classification',
    'timestamp',
  ],
  properties: {
    signalId: { type: 'string', format: 'uuid' },
    providerId: { type: 'string', format: 'uuid' },
    sourceType: {
      type: 'string',
      enum: ['TELEGRAM', 'DISCORD', 'WHATSAPP', 'TRADINGVIEW', 'EMAIL', 'REST_API'],
    },
    sourceId: { type: 'string' },
    rawMessageId: { type: 'string' },
    channelId: { type: 'string', nullable: true },
    symbol: { type: 'string', minLength: 1, maxLength: 32 },
    normalizedSymbol: { type: 'string', minLength: 1, maxLength: 32, nullable: true },
    direction: { type: 'string', enum: ORDER_DIRECTION_VALUES },
    entryType: { type: 'string', enum: ENTRY_TYPE_VALUES },
    entryPrice: { type: 'number', nullable: true },
    stopLoss: { type: 'number', nullable: true },
    takeProfits: {
      type: 'array',
      items: { type: 'number' },
      maxItems: 5,
      default: [],
    },
    riskPercent: { type: 'number', nullable: true, minimum: 0, maximum: 100 },
    lotSize: { type: 'number', nullable: true, minimum: 0 },
    timeframe: { type: 'string', nullable: true, maxLength: 16 },
    classification: {
      type: 'string',
      enum: [
        'NEW_TRADE',
        'TRADE_MANAGEMENT',
        'MARKET_ANALYSIS',
        'NEWS',
        'EDUCATION',
        'ADVERTISEMENT',
        'CONVERSATION',
        'UNKNOWN',
      ],
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    parserType: {
      type: 'string',
      enum: ['FAST_PATH', 'LEARNING_PATH', 'MANUAL'],
      default: 'LEARNING_PATH',
    },
    parserVersion: { type: 'string', nullable: true },
    aiModel: { type: 'string', nullable: true },
    dnaVersion: { type: 'string', nullable: true },
    language: { type: 'string', nullable: true, maxLength: 8 },
    originalText: { type: 'string', nullable: true },
    context: { type: 'object', nullable: true },
    timestamp: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    fingerprint: { type: 'string', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

/**
 * Validate a standardized signal object against the schema.
 *
 * @param {object} signal
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStandardizedSignal(signal) {
  const errors = [];

  if (!signal || typeof signal !== 'object') {
    return { valid: false, errors: ['Signal must be an object'] };
  }

  const required = STANDARDIZED_SIGNAL_SCHEMA.required;
  for (const field of required) {
    if (signal[field] === undefined || signal[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (signal.direction && !ORDER_DIRECTION_VALUES.includes(signal.direction)) {
    errors.push(`Invalid direction: ${signal.direction}`);
  }

  if (signal.entryType && !ENTRY_TYPE_VALUES.includes(signal.entryType)) {
    errors.push(`Invalid entryType: ${signal.entryType}`);
  }

  if (typeof signal.confidence === 'number') {
    if (signal.confidence < 0 || signal.confidence > 1) {
      errors.push(`Confidence must be between 0 and 1, received: ${signal.confidence}`);
    }
  }

  if (signal.takeProfits !== undefined && !Array.isArray(signal.takeProfits)) {
    errors.push('takeProfits must be an array');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Build a standardized signal from raw input, applying defaults.
 *
 * @param {object} input
 * @returns {object}
 */
export function buildStandardizedSignal(input) {
  return {
    signalId: input.signalId,
    providerId: input.providerId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    rawMessageId: input.rawMessageId,
    channelId: input.channelId || null,
    symbol: input.symbol,
    normalizedSymbol: input.normalizedSymbol || input.symbol,
    direction: input.direction,
    entryType: input.entryType || ENTRY_TYPES.MARKET,
    entryPrice: input.entryPrice ?? null,
    stopLoss: input.stopLoss ?? null,
    takeProfits: input.takeProfits || [],
    riskPercent: input.riskPercent ?? null,
    lotSize: input.lotSize ?? null,
    timeframe: input.timeframe || null,
    classification: input.classification,
    confidence: input.confidence,
    parserType: input.parserType || 'LEARNING_PATH',
    parserVersion: input.parserVersion || null,
    aiModel: input.aiModel || null,
    dnaVersion: input.dnaVersion || null,
    language: input.language || null,
    originalText: input.originalText || null,
    context: input.context || null,
    timestamp: input.timestamp || new Date().toISOString(),
    expiresAt: input.expiresAt || null,
    fingerprint: input.fingerprint || null,
    metadata: input.metadata || null,
  };
}

export const STANDARDIZED_SIGNAL_FIELDS = Object.freeze(
  Object.keys(STANDARDIZED_SIGNAL_SCHEMA.properties),
);