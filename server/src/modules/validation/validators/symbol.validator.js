/**
 * Symbol Check
 *
 * @module signalforge/server/modules/validation/validators/symbol
 */
const { isValidSymbol, normalizeSymbol } = require('@signalforge/shared/validators/symbol.validator');
const { VALIDATION_RESULTS, VALIDATION_CHECK_NAMES } = require('../validation.constants.js');
class SymbolCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.SYMBOL;
  }

  async run(signal, context = {}) {
    const symbol = signal?.symbol || signal?.normalizedSymbol;
    if (!symbol) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Symbol is missing',
      };
    }

    const normalized = normalizeSymbol(symbol);
    if (!normalized || !isValidSymbol(normalized)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Symbol ${symbol} is invalid`,
      };
    }

    const allowedSymbols = context.allowedSymbols;
    if (Array.isArray(allowedSymbols) && allowedSymbols.length > 0) {
      if (!allowedSymbols.includes(normalized)) {
        return {
          name: this.name,
          result: VALIDATION_RESULTS.FAILED,
          reason: `Symbol ${normalized} is not in the allowed list`,
        };
      }
    }

    const blockedSymbols = context.blockedSymbols;
    if (Array.isArray(blockedSymbols) && blockedSymbols.includes(normalized)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Symbol ${normalized} is blocked`,
      };
    }

    return {
      name: this.name,
      result: VALIDATION_RESULTS.PASSED,
      details: { normalizedSymbol: normalized },
    };
  }
}
module.exports = SymbolCheck;
module.exports.SymbolCheck = SymbolCheck;
