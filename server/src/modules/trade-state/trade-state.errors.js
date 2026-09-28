/**
 * Trade State Module Errors
 *
 * @module signalforge/server/modules/trade-state/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class TradeNotFoundError extends NotFoundError {
  constructor(message = 'Trade not found', details = {}) {
    super(message, { code: 'TRADE_NOT_FOUND', details });
    this.name = 'TradeNotFoundError';
  }
}
class TradeEventNotFoundError extends NotFoundError {
  constructor(message = 'Trade event not found', details = {}) {
    super(message, { code: 'TRADE_EVENT_NOT_FOUND', details });
    this.name = 'TradeEventNotFoundError';
  }
}
class InvalidTradeTransitionError extends ValidationError {
  constructor(message = 'Invalid trade state transition', details = {}) {
    super(message, { code: 'INVALID_TRADE_TRANSITION', details });
    this.name = 'InvalidTradeTransitionError';
  }
}
class InvalidTradeStateError extends ValidationError {
  constructor(message = 'Invalid trade state', details = {}) {
    super(message, { code: 'INVALID_TRADE_STATE', details });
    this.name = 'InvalidTradeStateError';
  }
}
class InvalidTradeEventError extends ValidationError {
  constructor(message = 'Invalid trade event type', details = {}) {
    super(message, { code: 'INVALID_TRADE_EVENT', details });
    this.name = 'InvalidTradeEventError';
  }
}
class InvalidTradeActorError extends ValidationError {
  constructor(message = 'Invalid trade actor', details = {}) {
    super(message, { code: 'INVALID_TRADE_ACTOR', details });
    this.name = 'InvalidTradeActorError';
  }
}
class TradeTerminalStateError extends ConflictError {
  constructor(message = 'Trade is in a terminal state and cannot be modified', details = {}) {
    super(message, { code: 'TRADE_TERMINAL_STATE', details });
    this.name = 'TradeTerminalStateError';
  }
}
class TransitionRejectedError extends ConflictError {
  constructor(message = 'Trade state transition was rejected', details = {}) {
    super(message, { code: 'TRANSITION_REJECTED', details });
    this.name = 'TransitionRejectedError';
  }
}
module.exports.TradeNotFoundError = TradeNotFoundError;
module.exports.TradeEventNotFoundError = TradeEventNotFoundError;
module.exports.InvalidTradeTransitionError = InvalidTradeTransitionError;
module.exports.InvalidTradeStateError = InvalidTradeStateError;
module.exports.InvalidTradeEventError = InvalidTradeEventError;
module.exports.InvalidTradeActorError = InvalidTradeActorError;
module.exports.TradeTerminalStateError = TradeTerminalStateError;
module.exports.TransitionRejectedError = TransitionRejectedError;
