/**
 * Trade Matching Errors
 *
 * @module signalforge/server/modules/trade-matching/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
class MatchNotFoundError extends NotFoundError {
  constructor(message = 'No matching trade found', details = {}) {
    super(message, { code: 'MATCH_NOT_FOUND', details });
    this.name = 'MatchNotFoundError';
  }
}
class AmbiguousMatchError extends ConflictError {
  constructor(message = 'Multiple candidate trades matched', details = {}) {
    super(message, { code: 'MATCH_AMBIGUOUS', details });
    this.name = 'AmbiguousMatchError';
  }
}
class ManagementInstructionInvalidError extends ValidationError {
  constructor(message = 'Management instruction is invalid', details = {}) {
    super(message, { code: 'MANAGEMENT_INSTRUCTION_INVALID', details });
    this.name = 'ManagementInstructionInvalidError';
  }
}
class ManagementInstructionFailedError extends Error {
  constructor(message = 'Management instruction failed', details = {}) {
    super(message);
    this.name = 'ManagementInstructionFailedError';
    this.code = 'MANAGEMENT_INSTRUCTION_FAILED';
    this.details = details;
  }
}
class TradeMatchingError extends Error {
  constructor(message = 'Trade matching failed', details = {}) {
    super(message);
    this.name = 'TradeMatchingError';
    this.code = 'TRADE_MATCHING_ERROR';
    this.details = details;
  }
}
module.exports.MatchNotFoundError = MatchNotFoundError;
module.exports.AmbiguousMatchError = AmbiguousMatchError;
module.exports.ManagementInstructionInvalidError = ManagementInstructionInvalidError;
module.exports.ManagementInstructionFailedError = ManagementInstructionFailedError;
module.exports.TradeMatchingError = TradeMatchingError;
