/**
 * Trade State Module Errors
 *
 * @module signalforge/server/modules/trade-state/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class TradeNotFoundError extends NotFoundError {
  constructor(message = 'Trade not found', details = {}) {
    super(message, { code: 'TRADE_NOT_FOUND', details });
    this.name = 'TradeNotFoundError';
  }
}

export class TradeEventNotFoundError extends NotFoundError {
  constructor(message = 'Trade event not found', details = {}) {
    super(message, { code: 'TRADE_EVENT_NOT_FOUND', details });
    this.name = 'TradeEventNotFoundError';
  }
}

export class InvalidTradeTransitionError extends ValidationError {
  constructor(message = 'Invalid trade state transition', details = {}) {
    super(message, { code: 'INVALID_TRADE_TRANSITION', details });
    this.name = 'InvalidTradeTransitionError';
  }
}

export class InvalidTradeStateError extends ValidationError {
  constructor(message = 'Invalid trade state', details = {}) {
    super(message, { code: 'INVALID_TRADE_STATE', details });
    this.name = 'InvalidTradeStateError';
  }
}

export class InvalidTradeEventError extends ValidationError {
  constructor(message = 'Invalid trade event type', details = {}) {
    super(message, { code: 'INVALID_TRADE_EVENT', details });
    this.name = 'InvalidTradeEventError';
  }
}

export class InvalidTradeActorError extends ValidationError {
  constructor(message = 'Invalid trade actor', details = {}) {
    super(message, { code: 'INVALID_TRADE_ACTOR', details });
    this.name = 'InvalidTradeActorError';
  }
}

export class TradeTerminalStateError extends ConflictError {
  constructor(message = 'Trade is in a terminal state and cannot be modified', details = {}) {
    super(message, { code: 'TRADE_TERMINAL_STATE', details });
    this.name = 'TradeTerminalStateError';
  }
}

export class TransitionRejectedError extends ConflictError {
  constructor(message = 'Trade state transition was rejected', details = {}) {
    super(message, { code: 'TRANSITION_REJECTED', details });
    this.name = 'TransitionRejectedError';
  }
}