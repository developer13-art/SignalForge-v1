/**
 * Execution Request Schema
 *
 * Defines the structure of an execution request sent from the Execution
 * Service to the broker gateway (MetaApi or future adapters).
 *
 * @module @signalforge/shared/schemas/execution-request
 */

import { ORDER_DIRECTION_VALUES } from '../constants/order-directions.js';
import { ENTRY_TYPE_VALUES } from '../constants/order-types.js';
import { BROKER_PLATFORM_VALUES } from '../constants/broker-platforms.js';

export const EXECUTION_REQUEST_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'executionRequestId',
    'tradeId',
    'userId',
    'brokerAccountId',
    'symbol',
    'direction',
    'volume',
    'entryType',
    'requestedAt',
  ],
  properties: {
    executionRequestId: { type: 'string', format: 'uuid' },
    tradeId: { type: 'string', format: 'uuid' },
    signalId: { type: 'string', format: 'uuid', nullable: true },
    userId: { type: 'string', format: 'uuid' },
    brokerAccountId: { type: 'string', format: 'uuid' },
    metaApiAccountId: { type: 'string', nullable: true },
    platform: { type: 'string', enum: BROKER_PLATFORM_VALUES, nullable: true },
    symbol: { type: 'string', minLength: 1, maxLength: 32 },
    direction: { type: 'string', enum: ORDER_DIRECTION_VALUES },
    entryType: { type: 'string', enum: ENTRY_TYPE_VALUES },
    volume: { type: 'number', minimum: 0 },
    price: { type: 'number', nullable: true },
    stopLoss: { type: 'number', nullable: true },
    takeProfit: { type: 'number', nullable: true },
    comment: { type: 'string', nullable: true, maxLength: 255 },
    magicNumber: { type: 'number', nullable: true },
    slippage: { type: 'number', nullable: true },
    requestedAt: { type: 'string', format: 'date-time' },
    attempt: { type: 'number', minimum: 1, default: 1 },
    maxAttempts: { type: 'number', minimum: 1, default: 3 },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildExecutionRequest(input) {
  return {
    executionRequestId: input.executionRequestId,
    tradeId: input.tradeId,
    signalId: input.signalId || null,
    userId: input.userId,
    brokerAccountId: input.brokerAccountId,
    metaApiAccountId: input.metaApiAccountId || null,
    platform: input.platform || null,
    symbol: input.symbol,
    direction: input.direction,
    entryType: input.entryType,
    volume: input.volume,
    price: input.price ?? null,
    stopLoss: input.stopLoss ?? null,
    takeProfit: input.takeProfit ?? null,
    comment: input.comment || null,
    magicNumber: input.magicNumber ?? null,
    slippage: input.slippage ?? null,
    requestedAt: input.requestedAt || new Date().toISOString(),
    attempt: input.attempt ?? 1,
    maxAttempts: input.maxAttempts ?? 3,
    metadata: input.metadata || null,
  };
}

export function validateExecutionRequest(request) {
  const errors = [];

  if (!request || typeof request !== 'object') {
    return { valid: false, errors: ['Execution request must be an object'] };
  }

  for (const field of EXECUTION_REQUEST_SCHEMA.required) {
    if (request[field] === undefined || request[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (request.direction && !ORDER_DIRECTION_VALUES.includes(request.direction)) {
    errors.push(`Invalid direction: ${request.direction}`);
  }

  if (request.entryType && !ENTRY_TYPE_VALUES.includes(request.entryType)) {
    errors.push(`Invalid entryType: ${request.entryType}`);
  }

  if (typeof request.volume === 'number' && request.volume <= 0) {
    errors.push('Volume must be greater than 0');
  }

  if (request.entryType !== 'MARKET' && (request.price === undefined || request.price === null)) {
    errors.push('Price is required for non-market orders');
  }

  return { valid: errors.length === 0, errors };
}

export const EXECUTION_REQUEST_FIELDS = Object.freeze(
  Object.keys(EXECUTION_REQUEST_SCHEMA.properties),
);