/**
 * Trades Validators
 *
 * @module signalforge/server/modules/trades/validator
 */

import { isValidSymbol } from '@signalforge/shared/validators/symbol.validator';
import { isValidDirection } from '@signalforge/shared/constants/order-directions';
import { isValidVolume } from '@signalforge/shared/validators/lot-size.validator';
import { isValidPrice } from '@signalforge/shared/validators/price.validator';
import { TRADE_STATUS_VALUES } from './trade.constants.js';

export function validateManualOpenPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.brokerAccountId || typeof body.brokerAccountId !== 'string') {
    errors.push('brokerAccountId is required');
  }

  if (!isValidSymbol(body.symbol)) {
    errors.push('symbol is invalid');
  }

  if (!isValidDirection(body.direction)) {
    errors.push('direction is invalid');
  }

  if (!isValidVolume(body.volume)) {
    errors.push('volume is invalid');
  }

  if (body.entryPrice !== undefined && body.entryPrice !== null && !isValidPrice(body.entryPrice)) {
    errors.push('entryPrice is invalid');
  }

  if (body.stopLoss !== undefined && body.stopLoss !== null && !isValidPrice(body.stopLoss)) {
    errors.push('stopLoss is invalid');
  }

  if (body.takeProfit !== undefined && body.takeProfit !== null && !isValidPrice(body.takeProfit)) {
    errors.push('takeProfit is invalid');
  }

  return { valid: errors.length === 0, errors };
}

export function validateManualClosePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.exitPrice !== undefined && body.exitPrice !== null && !isValidPrice(body.exitPrice)) {
    errors.push('exitPrice is invalid');
  }

  if (body.percentage !== undefined) {
    if (typeof body.percentage !== 'number' || body.percentage <= 0 || body.percentage > 100) {
      errors.push('percentage must be between 0 and 100');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateManualModifyPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.stopLoss !== undefined && body.stopLoss !== null && !isValidPrice(body.stopLoss)) {
    errors.push('stopLoss is invalid');
  }

  if (body.takeProfit !== undefined && body.takeProfit !== null && !isValidPrice(body.takeProfit)) {
    errors.push('takeProfit is invalid');
  }

  if (body.stopLoss === undefined && body.takeProfit === undefined) {
    errors.push('At least one of stopLoss or takeProfit must be provided');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTradeListQuery(query) {
  const errors = [];

  if (query.status !== undefined) {
    const statuses = Array.isArray(query.status) ? query.status : [query.status];
    for (const status of statuses) {
      if (!TRADE_STATUS_VALUES.includes(status)) {
        errors.push(`Invalid status: ${status}`);
      }
    }
  }

  if (query.limit !== undefined) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      errors.push('limit must be between 1 and 200');
    }
  }

  if (query.offset !== undefined) {
    const offset = Number(query.offset);
    if (!Number.isInteger(offset) || offset < 0) {
      errors.push('offset must be a non-negative integer');
    }
  }

  return { valid: errors.length === 0, errors };
}