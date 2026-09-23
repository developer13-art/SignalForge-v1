/**
 * State Transitions
 *
 * @module signalforge/server/modules/trade-state/lifecycle/state-transitions
 */

import {
  TRADE_STATES,
  VALID_TRADE_TRANSITIONS,
  isValidTradeState,
  isValidTransition,
  isTerminalState,
} from '../trade-state.constants.js';
import {
  InvalidTradeStateError,
  InvalidTradeTransitionError,
  TradeTerminalStateError,
} from '../trade-state.errors.js';

export class StateTransitions {
  validateTransition(fromState, toState) {
    if (!isValidTradeState(fromState)) {
      throw new InvalidTradeStateError(`Unknown state: ${fromState}`, { state: fromState });
    }
    if (!isValidTradeState(toState)) {
      throw new InvalidTradeStateError(`Unknown state: ${toState}`, { state: toState });
    }
    if (isTerminalState(fromState)) {
      throw new TradeTerminalStateError(
        `Trade is in terminal state ${fromState} and cannot transition`,
        { fromState, toState },
      );
    }
    if (!isValidTransition(fromState, toState)) {
      throw new InvalidTradeTransitionError(
        `Invalid transition from ${fromState} to ${toState}`,
        { fromState, toState },
      );
    }
    return true;
  }

  getAllowedTransitions(fromState) {
    if (!isValidTradeState(fromState)) {
      return [];
    }
    return [...(VALID_TRADE_TRANSITIONS[fromState] || [])];
  }

  isTerminal(state) {
    return isTerminalState(state);
  }

  isActive(state) {
    return [
      TRADE_STATES.OPEN,
      TRADE_STATES.BREAK_EVEN,
      TRADE_STATES.TRAILING_STOP,
      TRADE_STATES.PARTIAL_CLOSE,
      TRADE_STATES.PENDING_ORDER,
    ].includes(state);
  }
}

export default StateTransitions;