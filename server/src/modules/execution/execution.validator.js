/**
 * Execution Validators
 *
 * @module signalforge/server/modules/execution/validator
 */

import { isValidSymbol } from '@signalforge/shared/validators/symbol.validator';
import { isValidDirection } from '@signalforge/shared/constants/order-directions';
import { isValidVolume } from '@signalforge/shared/validators/lot-size.validator';
import { isValidPrice } from '@signalforge/shared/validators/price.validator';

export function validateOpenPositionPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.tradeId) {
    errors.push('tradeId is required');
  }
  if (!body.brokerAccountId) {
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
  if (body.entryType && !['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'].includes(body.entryType)) {
    errors.push('entryType is invalid');
  }
  if (body.price !== undefined && body.price !== null && !isValidPrice(body.price)) {
    errors.push('price is invalid');
  }
  if (body.stopLoss !== undefined && body.stopLoss !== null && !isValidPrice(body.stopLoss)) {
    errors.push('stopLoss is invalid');
  }
  if (body.takeProfit !== undefined && body.takeProfit !== null && !isValidPrice(body.takeProfit)) {
    errors.push('takeProfit is invalid');
  }
  if (body.entryType && body.entryType !== 'MARKET' && (body.price === undefined || body.price === null)) {
    errors.push('price is required for non-market orders');
  }

  return { valid: errors.length === 0, errors };
}

export function validateModifyPositionPayload(body) {
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

export function validatePartialClosePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (typeof body.percentage !== 'number' || body.percentage <= 0 || body.percentage >= 100) {
    errors.push('percentage must be between 0 and 100');
  }

  return { valid: errors.length === 0, errors };
}