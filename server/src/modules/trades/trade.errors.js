/**
 * Trades Module Errors
 *
 * @module signalforge/server/modules/trades/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class TradeNotFoundError extends NotFoundError {
  constructor(message = 'Trade not found', details = {}) {
    super(message, { code: 'TRADE_NOT_FOUND', details });
    this.name = 'TradeNotFoundError';
  }
}
class TradeNotOwnedError extends AuthorizationError {
  constructor(message = 'Trade does not belong to this user') {
    super(message, { code: 'TRADE_NOT_OWNED' });
    this.name = 'TradeNotOwnedError';
  }
}
class TradeAlreadyClosedError extends ConflictError {
  constructor(message = 'Trade is already closed', details = {}) {
    super(message, { code: 'TRADE_ALREADY_CLOSED', details });
    this.name = 'TradeAlreadyClosedError';
  }
}
class TradeNotActiveError extends ConflictError {
  constructor(message = 'Trade is not active', details = {}) {
    super(message, { code: 'TRADE_NOT_ACTIVE', details });
    this.name = 'TradeNotActiveError';
  }
}
class TradeModificationError extends ValidationError {
  constructor(message = 'Trade modification is invalid', details = {}) {
    super(message, { code: 'TRADE_MODIFICATION_INVALID', details });
    this.name = 'TradeModificationError';
  }
}
class ManualInterventionError extends Error {
  constructor(message = 'Manual intervention failed', details = {}) {
    super(message);
    this.name = 'ManualInterventionError';
    this.code = 'MANUAL_INTERVENTION_FAILED';
    this.details = details;
  }
}
class TradeExportError extends Error {
  constructor(message = 'Trade export failed', details = {}) {
    super(message);
    this.name = 'TradeExportError';
    this.code = 'TRADE_EXPORT_FAILED';
    this.details = details;
  }
}
class InvalidTradeQueryError extends ValidationError {
  constructor(message = 'Trade query is invalid', details = {}) {
    super(message, { code: 'INVALID_TRADE_QUERY', details });
    this.name = 'InvalidTradeQueryError';
  }
}
module.exports.TradeNotFoundError = TradeNotFoundError;
module.exports.TradeNotOwnedError = TradeNotOwnedError;
module.exports.TradeAlreadyClosedError = TradeAlreadyClosedError;
module.exports.TradeNotActiveError = TradeNotActiveError;
module.exports.TradeModificationError = TradeModificationError;
module.exports.ManualInterventionError = ManualInterventionError;
module.exports.TradeExportError = TradeExportError;
module.exports.InvalidTradeQueryError = InvalidTradeQueryError;
