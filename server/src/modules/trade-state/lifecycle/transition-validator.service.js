/**
 * Transition Validator Service
 *
 * @module signalforge/server/modules/trade-state/lifecycle/transition-validator
 */

import { StateTransitions } from './state-transitions.js';
import {
  TRADE_STATES,
  isTerminalState,
} from '../trade-state.constants.js';
import { TradeTerminalStateError } from '../trade-state.errors.js';

const EVENT_TO_STATE = Object.freeze({
  SIGNAL_RECEIVED: TRADE_STATES.SIGNAL_RECEIVED,
  PARSED: TRADE_STATES.PARSED,
  VALIDATED: TRADE_STATES.VALIDATED,
  RISK_APPROVED: TRADE_STATES.RISK_APPROVED,
  RISK_REJECTED: TRADE_STATES.RISK_REJECTED,
  EXECUTION_REQUESTED: TRADE_STATES.EXECUTION_REQUESTED,
  EXECUTION_REJECTED: TRADE_STATES.EXECUTION_REJECTED,
  EXECUTION_FAILED: TRADE_STATES.EXECUTION_REJECTED,
  EXECUTED: TRADE_STATES.EXECUTED,
  POSITION_OPENED: TRADE_STATES.OPEN,
  BREAK_EVEN: TRADE_STATES.BREAK_EVEN,
  TRAILING_STOP: TRADE_STATES.TRAILING_STOP,
  PARTIAL_CLOSE: TRADE_STATES.PARTIAL_CLOSE,
  PENDING_ORDER_PLACED: TRADE_STATES.PENDING_ORDER,
  PENDING_ORDER_CANCELLED: TRADE_STATES.PENDING_CANCELLED,
  CLOSED: TRADE_STATES.CLOSED,
  MANUAL_CLOSE: TRADE_STATES.CLOSED,
  AUTO_CLOSE: TRADE_STATES.CLOSED,
  PROVIDER_CLOSE: TRADE_STATES.CLOSED,
  RISK_CLOSE: TRADE_STATES.CLOSED,
  STOP_LOSS: TRADE_STATES.CLOSED,
  TAKE_PROFIT: TRADE_STATES.CLOSED,
  ARCHIVED: TRADE_STATES.ARCHIVED,
});

export class TransitionValidatorService {
  constructor(stateTransitions = null) {
    this.transitions = stateTransitions || new StateTransitions();
  }

  deriveStateFromEvent(eventType) {
    return EVENT_TO_STATE[eventType] || null;
  }

  validateEventTransition(fromState, eventType) {
    const targetState = this.deriveStateFromEvent(eventType);
    if (!targetState) {
      return { valid: true, terminal: false, targetState: null };
    }

    if (fromState && fromState !== targetState) {
      this.transitions.validateTransition(fromState, targetState);
    }

    return {
      valid: true,
      terminal: isTerminalState(targetState),
      targetState,
    };
  }

  assertNotTerminal(state) {
    if (isTerminalState(state)) {
      throw new TradeTerminalStateError(
        `Cannot modify a trade in terminal state ${state}`,
        { state },
      );
    }
  }
}

export default TransitionValidatorService;