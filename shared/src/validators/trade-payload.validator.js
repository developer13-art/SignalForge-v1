/**
 * Trade Payload Validator
 *
 * Provides validation for trade payloads submitted by users for
 * manual trade operations or by the Execution Service before
 * dispatch.
 *
 * @module @signalforge/shared/validators/trade-payload
 */

import { ORDER_DIRECTION_VALUES, normalizeDirection } from '../constants/order-directions.js';
import { ORDER_TYPE_VALUES, ENTRY_TYPE_VALUES } from '../constants/order-types.js';
import { normalizeSymbol, isValidSymbol } from './symbol.validator.js';
import { parsePrice, isValidPrice, calculatePipDistance } from './price.validator.js';
import { parseVolume, validateVolume } from './lot-size.validator.js';

export function validateTradePayload(payload, options = {}) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Trade payload must be an object'] };
  }

  if (!payload.symbol) {
    errors.push('Symbol is required');
  } else if (!isValidSymbol(payload.symbol)) {
    errors.push('Symbol is invalid');
  }

  if (!payload.direction) {
    errors.push('Direction is required');
  } else if (!normalizeDirection(payload.direction)) {
    errors.push(`Direction "${payload.direction}" is invalid`);
  }

  if (payload.orderType !== undefined && payload.orderType !== null) {
    if (!ORDER_TYPE_VALUES.includes(payload.orderType)) {
      errors.push(`orderType "${payload.orderType}" is invalid`);
    }
  }

  if (payload.entryType !== undefined && payload.entryType !== null) {
    if (!ENTRY_TYPE_VALUES.includes(payload.entryType)) {
      errors.push(`entryType "${payload.entryType}" is invalid`);
    }
  }

  const volumeValidation = validateVolume(payload.volume, {
    minVolume: options.minVolume,
    maxVolume: options.maxVolume,
    step: options.step,
  });

  if (!volumeValidation.valid) {
    errors.push(...volumeValidation.errors);
  }

  if (payload.price !== undefined && payload.price !== null) {
    if (!isValidPrice(payload.price)) {
      errors.push('price is invalid');
    }
  }

  if (payload.stopLoss !== undefined && payload.stopLoss !== null) {
    if (!isValidPrice(payload.stopLoss)) {
      errors.push('stopLoss is invalid');
    }
  }

  if (payload.takeProfit !== undefined && payload.takeProfit !== null) {
    if (!isValidPrice(payload.takeProfit)) {
      errors.push('takeProfit is invalid');
    }
  }

  const entryType = payload.entryType || payload.orderType || 'MARKET';
  if (entryType !== 'MARKET') {
    if (payload.price === undefined || payload.price === null) {
      errors.push('price is required for non-market orders');
    }
  }

  if (
    payload.stopLoss !== undefined &&
    payload.stopLoss !== null &&
    payload.price !== undefined &&
    payload.price !== null
  ) {
    const direction = normalizeDirection(payload.direction);
    const stopLoss = parsePrice(payload.stopLoss);
    const price = parsePrice(payload.price);

    if (stopLoss !== null && price !== null) {
      if (direction === 'BUY' && stopLoss >= price) {
        errors.push('For BUY orders, stopLoss must be below entry price');
      }
      if (direction === 'SELL' && stopLoss <= price) {
        errors.push('For SELL orders, stopLoss must be above entry price');
      }
    }
  }

  if (
    payload.takeProfit !== undefined &&
    payload.takeProfit !== null &&
    payload.price !== undefined &&
    payload.price !== null
  ) {
    const direction = normalizeDirection(payload.direction);
    const takeProfit = parsePrice(payload.takeProfit);
    const price = parsePrice(payload.price);

    if (takeProfit !== null && price !== null) {
      if (direction === 'BUY' && takeProfit <= price) {
        errors.push('For BUY orders, takeProfit must be above entry price');
      }
      if (direction === 'SELL' && takeProfit >= price) {
        errors.push('For SELL orders, takeProfit must be below entry price');
      }
    }
  }

  if (options.requireStopLoss) {
    if (payload.stopLoss === undefined || payload.stopLoss === null) {
      errors.push('stopLoss is required');
    }
  }

  if (options.requireTakeProfit) {
    if (payload.takeProfit === undefined || payload.takeProfit === null) {
      errors.push('takeProfit is required');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeTradePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return {
    symbol: payload.symbol ? normalizeSymbol(payload.symbol) : null,
    direction: payload.direction ? normalizeDirection(payload.direction) : null,
    orderType: payload.orderType || 'MARKET',
    entryType: payload.entryType || payload.orderType || 'MARKET',
    volume: payload.volume !== undefined ? parseVolume(payload.volume) : null,
    price: payload.price !== undefined ? parsePrice(payload.price) : null,
    stopLoss: payload.stopLoss !== undefined ? parsePrice(payload.stopLoss) : null,
    takeProfit: payload.takeProfit !== undefined ? parsePrice(payload.takeProfit) : null,
    comment: payload.comment || null,
    magicNumber: payload.magicNumber || null,
    slippage: payload.slippage || null,
    timestamp: payload.timestamp || new Date().toISOString(),
  };
}

export function validateRiskRewardRatio(payload, options = {}) {
  const errors = [];
  const minRatio = options.minRatio ?? 0;

  if (
    !payload ||
    payload.stopLoss === undefined ||
    payload.takeProfit === undefined ||
    payload.price === undefined
  ) {
    return { valid: true, errors, ratio: null };
  }

  const symbol = normalizeSymbol(payload.symbol);
  const stopLoss = parsePrice(payload.stopLoss);
  const takeProfit = parsePrice(payload.takeProfit);
  const price = parsePrice(payload.price);

  if (stopLoss === null || takeProfit === null || price === null) {
    return { valid: false, errors: ['Could not parse prices'], ratio: null };
  }

  const stopDistance = calculatePipDistance(symbol, price, stopLoss);
  const targetDistance = calculatePipDistance(symbol, price, takeProfit);

  if (stopDistance === null || targetDistance === null || stopDistance === 0) {
    return { valid: false, errors: ['Could not calculate distances'], ratio: null };
  }

  const ratio = targetDistance / stopDistance;

  if (ratio < minRatio) {
    errors.push(`Risk-reward ratio ${ratio.toFixed(2)} is below minimum ${minRatio}`);
  }

  return { valid: errors.length === 0, errors, ratio };
}

export const TRADE_PAYLOAD_CONSTRAINTS = Object.freeze({
  directions: ORDER_DIRECTION_VALUES,
  orderTypes: ORDER_TYPE_VALUES,
  entryTypes: ENTRY_TYPE_VALUES,
});