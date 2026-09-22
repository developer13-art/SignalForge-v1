/**
 * Trade Object Schema
 *
 * Defines the structure of a trade object after personalization and
 * before execution. This is the canonical representation used by the
 * Execution Service, Trade State Engine, and analytics.
 *
 * @module @signalforge/shared/schemas/trade-object
 */

import { ORDER_DIRECTION_VALUES } from '../constants/order-directions.js';
import { ENTRY_TYPE_VALUES } from '../constants/order-types.js';
import { TRADE_STATE_VALUES } from '../constants/trade-states.js';
import { BROKER_PLATFORM_VALUES } from '../constants/broker-platforms.js';
import { ACCOUNT_TYPE_VALUES } from '../constants/account-types.js';

export const TRADE_OBJECT_SCHEMA = Object.freeze({
  type: 'object',
  required: [
    'tradeId',
    'userId',
    'brokerAccountId',
    'signalId',
    'symbol',
    'direction',
    'volume',
    'status',
  ],
  properties: {
    tradeId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    brokerAccountId: { type: 'string', format: 'uuid' },
    signalId: { type: 'string', format: 'uuid', nullable: true },
    providerId: { type: 'string', format: 'uuid', nullable: true },
    parentTradeId: { type: 'string', format: 'uuid', nullable: true },
    symbol: { type: 'string', minLength: 1, maxLength: 32 },
    direction: { type: 'string', enum: ORDER_DIRECTION_VALUES },
    entryType: { type: 'string', enum: ENTRY_TYPE_VALUES },
    requestedPrice: { type: 'number', nullable: true },
    entryPrice: { type: 'number', nullable: true },
    exitPrice: { type: 'number', nullable: true },
    volume: { type: 'number', minimum: 0 },
    remainingVolume: { type: 'number', minimum: 0, nullable: true },
    stopLoss: { type: 'number', nullable: true },
    takeProfit: { type: 'number', nullable: true },
    takeProfits: { type: 'array', items: { type: 'number' }, default: [] },
    magicNumber: { type: 'number', nullable: true },
    brokerOrderId: { type: 'string', nullable: true },
    brokerPositionId: { type: 'string', nullable: true },
    brokerTicket: { type: 'string', nullable: true },
    platform: { type: 'string', enum: BROKER_PLATFORM_VALUES },
    accountType: { type: 'string', enum: ACCOUNT_TYPE_VALUES },
    status: { type: 'string', enum: TRADE_STATE_VALUES },
    realizedProfit: { type: 'number', nullable: true },
    unrealizedProfit: { type: 'number', nullable: true },
    commission: { type: 'number', nullable: true },
    swap: { type: 'number', nullable: true },
    openedAt: { type: 'string', format: 'date-time', nullable: true },
    closedAt: { type: 'string', format: 'date-time', nullable: true },
    openedBy: { type: 'string', nullable: true },
    closedBy: { type: 'string', nullable: true },
    rejectionReason: { type: 'string', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildTradeObject(input) {
  return {
    tradeId: input.tradeId,
    userId: input.userId,
    brokerAccountId: input.brokerAccountId,
    signalId: input.signalId || null,
    providerId: input.providerId || null,
    parentTradeId: input.parentTradeId || null,
    symbol: input.symbol,
    direction: input.direction,
    entryType: input.entryType || 'MARKET',
    requestedPrice: input.requestedPrice ?? null,
    entryPrice: input.entryPrice ?? null,
    exitPrice: input.exitPrice ?? null,
    volume: input.volume,
    remainingVolume: input.remainingVolume ?? input.volume,
    stopLoss: input.stopLoss ?? null,
    takeProfit: input.takeProfit ?? null,
    takeProfits: input.takeProfits || [],
    magicNumber: input.magicNumber ?? null,
    brokerOrderId: input.brokerOrderId || null,
    brokerPositionId: input.brokerPositionId || null,
    brokerTicket: input.brokerTicket || null,
    platform: input.platform,
    accountType: input.accountType,
    status: input.status,
    realizedProfit: input.realizedProfit ?? null,
    unrealizedProfit: input.unrealizedProfit ?? null,
    commission: input.commission ?? null,
    swap: input.swap ?? null,
    openedAt: input.openedAt || null,
    closedAt: input.closedAt || null,
    openedBy: input.openedBy || null,
    closedBy: input.closedBy || null,
    rejectionReason: input.rejectionReason || null,
    metadata: input.metadata || null,
  };
}

export function validateTradeObject(trade) {
  const errors = [];

  if (!trade || typeof trade !== 'object') {
    return { valid: false, errors: ['Trade must be an object'] };
  }

  for (const field of TRADE_OBJECT_SCHEMA.required) {
    if (trade[field] === undefined || trade[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (trade.direction && !ORDER_DIRECTION_VALUES.includes(trade.direction)) {
    errors.push(`Invalid direction: ${trade.direction}`);
  }

  if (trade.status && !TRADE_STATE_VALUES.includes(trade.status)) {
    errors.push(`Invalid status: ${trade.status}`);
  }

  if (typeof trade.volume === 'number' && trade.volume <= 0) {
    errors.push('Volume must be greater than 0');
  }

  return { valid: errors.length === 0, errors };
}

export const TRADE_OBJECT_FIELDS = Object.freeze(
  Object.keys(TRADE_OBJECT_SCHEMA.properties),
);