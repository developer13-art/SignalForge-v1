/**
 * Execution Request Schema
 *
 * Defines the structure of an execution request sent from the Execution
 * Service to the broker gateway (MetaApi or future adapters).
 *
 * @module @signalforge/shared/schemas/execution-request
 */const { ORDER_DIRECTION_VALUES } = require('../constants/order-directions.cjs');const { ENTRY_TYPE_VALUES } = require('../constants/order-types.cjs');const { BROKER_PLATFORM_VALUES } = require('../constants/broker-platforms.cjs');
const EXECUTION_REQUEST_SCHEMA = Object.freeze({
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
});function buildExecutionRequest(input) {
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
}function validateExecutionRequest(request) {
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
}const EXECUTION_REQUEST_FIELDS = Object.freeze(
  Object.keys(EXECUTION_REQUEST_SCHEMA.properties),
);

module.exports.buildExecutionRequest = buildExecutionRequest;
module.exports.validateExecutionRequest = validateExecutionRequest;
module.exports.EXECUTION_REQUEST_SCHEMA = EXECUTION_REQUEST_SCHEMA;
module.exports.EXECUTION_REQUEST_FIELDS = EXECUTION_REQUEST_FIELDS;
