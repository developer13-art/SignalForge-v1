/**
 * Trade Matching Errors
 *
 * @module signalforge/server/modules/trade-matching/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class MatchNotFoundError extends NotFoundError {
  constructor(message = 'No matching trade found', details = {}) {
    super(message, { code: 'MATCH_NOT_FOUND', details });
    this.name = 'MatchNotFoundError';
  }
}

export class AmbiguousMatchError extends ConflictError {
  constructor(message = 'Multiple candidate trades matched', details = {}) {
    super(message, { code: 'MATCH_AMBIGUOUS', details });
    this.name = 'AmbiguousMatchError';
  }
}

export class ManagementInstructionInvalidError extends ValidationError {
  constructor(message = 'Management instruction is invalid', details = {}) {
    super(message, { code: 'MANAGEMENT_INSTRUCTION_INVALID', details });
    this.name = 'ManagementInstructionInvalidError';
  }
}

export class ManagementInstructionFailedError extends Error {
  constructor(message = 'Management instruction failed', details = {}) {
    super(message);
    this.name = 'ManagementInstructionFailedError';
    this.code = 'MANAGEMENT_INSTRUCTION_FAILED';
    this.details = details;
  }
}

export class TradeMatchingError extends Error {
  constructor(message = 'Trade matching failed', details = {}) {
    super(message);
    this.name = 'TradeMatchingError';
    this.code = 'TRADE_MATCHING_ERROR';
    this.details = details;
  }
}