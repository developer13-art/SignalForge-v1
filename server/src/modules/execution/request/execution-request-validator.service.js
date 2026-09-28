/**
 * Execution Request Validator Service
 *
 * @module signalforge/server/modules/execution/request/validator
 */
const { isValidDirection } = require('@signalforge/shared/constants/order-directions');
const { isValidSymbol } = require('@signalforge/shared/validators/symbol.validator');
const { isValidPrice } = require('@signalforge/shared/validators/price.validator');
const { isValidVolume } = require('@signalforge/shared/validators/lot-size.validator');
const { ValidationError } = require('../../../lib/errors/validation-error.js');
class ExecutionRequestValidatorService {
  validate(request) {
    const errors = [];

    if (!request || typeof request !== 'object') {
      return { valid: false, errors: ['Request must be an object'] };
    }

    if (!request.tradeId) {
      errors.push('tradeId is required');
    }

    if (!request.userId) {
      errors.push('userId is required');
    }

    if (!request.brokerAccountId) {
      errors.push('brokerAccountId is required');
    }

    if (!isValidSymbol(request.symbol)) {
      errors.push('symbol is invalid');
    }

    if (!isValidDirection(request.direction)) {
      errors.push('direction is invalid');
    }

    if (!isValidVolume(request.volume)) {
      errors.push('volume is invalid');
    }

    const entryType = request.entryType || 'MARKET';
    if (entryType !== 'MARKET') {
      if (request.price === undefined || request.price === null) {
        errors.push('price is required for non-market orders');
      } else if (!isValidPrice(request.price)) {
        errors.push('price is invalid');
      }
    }

    if (request.stopLoss !== undefined && request.stopLoss !== null) {
      if (!isValidPrice(request.stopLoss)) {
        errors.push('stopLoss is invalid');
      }
    }

    if (request.takeProfit !== undefined && request.takeProfit !== null) {
      if (!isValidPrice(request.takeProfit)) {
        errors.push('takeProfit is invalid');
      }
    }

    if (request.direction === 'BUY' && request.stopLoss) {
      const entry = request.price ?? request.entryPrice ?? 0;
      if (Number(request.stopLoss) >= Number(entry) && entry > 0) {
        errors.push('For BUY orders, stopLoss must be below entry price');
      }
    }

    if (request.direction === 'SELL' && request.stopLoss) {
      const entry = request.price ?? request.entryPrice ?? 0;
      if (Number(request.stopLoss) <= Number(entry) && entry > 0) {
        errors.push('For SELL orders, stopLoss must be above entry price');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  assertValid(request) {
    const result = this.validate(request);
    if (!result.valid) {
      throw new ValidationError('Execution request validation failed', {
        code: 'EXECUTION_REQUEST_VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
    return result;
  }
}
module.exports = ExecutionRequestValidatorService;
module.exports.ExecutionRequestValidatorService = ExecutionRequestValidatorService;
