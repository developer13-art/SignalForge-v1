/**
 * Trades Module Errors
 *
 * @module signalforge/server/modules/trades/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class TradeNotFoundError extends NotFoundError {
  constructor(message = 'Trade not found', details = {}) {
    super(message, { code: 'TRADE_NOT_FOUND', details });
    this.name = 'TradeNotFoundError';
  }
}

export class TradeNotOwnedError extends AuthorizationError {
  constructor(message = 'Trade does not belong to this user') {
    super(message, { code: 'TRADE_NOT_OWNED' });
    this.name = 'TradeNotOwnedError';
  }
}

export class TradeAlreadyClosedError extends ConflictError {
  constructor(message = 'Trade is already closed', details = {}) {
    super(message, { code: 'TRADE_ALREADY_CLOSED', details });
    this.name = 'TradeAlreadyClosedError';
  }
}

export class TradeNotActiveError extends ConflictError {
  constructor(message = 'Trade is not active', details = {}) {
    super(message, { code: 'TRADE_NOT_ACTIVE', details });
    this.name = 'TradeNotActiveError';
  }
}

export class TradeModificationError extends ValidationError {
  constructor(message = 'Trade modification is invalid', details = {}) {
    super(message, { code: 'TRADE_MODIFICATION_INVALID', details });
    this.name = 'TradeModificationError';
  }
}

export class ManualInterventionError extends Error {
  constructor(message = 'Manual intervention failed', details = {}) {
    super(message);
    this.name = 'ManualInterventionError';
    this.code = 'MANUAL_INTERVENTION_FAILED';
    this.details = details;
  }
}

export class TradeExportError extends Error {
  constructor(message = 'Trade export failed', details = {}) {
    super(message);
    this.name = 'TradeExportError';
    this.code = 'TRADE_EXPORT_FAILED';
    this.details = details;
  }
}

export class InvalidTradeQueryError extends ValidationError {
  constructor(message = 'Trade query is invalid', details = {}) {
    super(message, { code: 'INVALID_TRADE_QUERY', details });
    this.name = 'InvalidTradeQueryError';
  }
}