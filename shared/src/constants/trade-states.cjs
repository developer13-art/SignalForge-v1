/**
 * Trade States
 *
 * Defines the lifecycle states of a trade in the SignalForge platform.
 * Every state transition is recorded in the trade_events table with an
 * attributed actor (system, user, provider, automation, or broker).
 *
 * @module @signalforge/shared/constants/trade-states
 */const TRADE_STATES = Object.freeze({
  SIGNAL_RECEIVED: 'SIGNAL_RECEIVED',
  PARSED: 'PARSED',
  VALIDATED: 'VALIDATED',
  RISK_APPROVED: 'RISK_APPROVED',
  RISK_REJECTED: 'RISK_REJECTED',
  EXECUTION_REQUESTED: 'EXECUTION_REQUESTED',
  EXECUTION_REJECTED: 'EXECUTION_REJECTED',
  EXECUTED: 'EXECUTED',
  OPEN: 'OPEN',
  BREAK_EVEN: 'BREAK_EVEN',
  TRAILING_STOP: 'TRAILING_STOP',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  PENDING_ORDER: 'PENDING_ORDER',
  PENDING_CANCELLED: 'PENDING_CANCELLED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
  FAILED: 'FAILED',
});const TRADE_STATE_VALUES = Object.freeze(Object.values(TRADE_STATES));const TRADE_STATE_LABELS = Object.freeze({
  [TRADE_STATES.SIGNAL_RECEIVED]: 'Signal Received',
  [TRADE_STATES.PARSED]: 'Parsed',
  [TRADE_STATES.VALIDATED]: 'Validated',
  [TRADE_STATES.RISK_APPROVED]: 'Risk Approved',
  [TRADE_STATES.RISK_REJECTED]: 'Risk Rejected',
  [TRADE_STATES.EXECUTION_REQUESTED]: 'Execution Requested',
  [TRADE_STATES.EXECUTION_REJECTED]: 'Execution Rejected',
  [TRADE_STATES.EXECUTED]: 'Executed',
  [TRADE_STATES.OPEN]: 'Open',
  [TRADE_STATES.BREAK_EVEN]: 'Break Even',
  [TRADE_STATES.TRAILING_STOP]: 'Trailing Stop',
  [TRADE_STATES.PARTIAL_CLOSE]: 'Partial Close',
  [TRADE_STATES.PENDING_ORDER]: 'Pending Order',
  [TRADE_STATES.PENDING_CANCELLED]: 'Pending Order Cancelled',
  [TRADE_STATES.CLOSED]: 'Closed',
  [TRADE_STATES.ARCHIVED]: 'Archived',
  [TRADE_STATES.FAILED]: 'Failed',
});const ACTIVE_TRADE_STATES = Object.freeze([
  TRADE_STATES.OPEN,
  TRADE_STATES.BREAK_EVEN,
  TRADE_STATES.TRAILING_STOP,
  TRADE_STATES.PARTIAL_CLOSE,
  TRADE_STATES.PENDING_ORDER,
]);const TERMINAL_TRADE_STATES = Object.freeze([
  TRADE_STATES.CLOSED,
  TRADE_STATES.ARCHIVED,
  TRADE_STATES.RISK_REJECTED,
  TRADE_STATES.EXECUTION_REJECTED,
  TRADE_STATES.FAILED,
  TRADE_STATES.PENDING_CANCELLED,
]);const VALID_TRADE_TRANSITIONS = Object.freeze({
  [TRADE_STATES.SIGNAL_RECEIVED]: [
    TRADE_STATES.PARSED,
    TRADE_STATES.FAILED,
  ],
  [TRADE_STATES.PARSED]: [
    TRADE_STATES.VALIDATED,
    TRADE_STATES.FAILED,
  ],
  [TRADE_STATES.VALIDATED]: [
    TRADE_STATES.RISK_APPROVED,
    TRADE_STATES.RISK_REJECTED,
  ],
  [TRADE_STATES.RISK_APPROVED]: [
    TRADE_STATES.EXECUTION_REQUESTED,
  ],
  [TRADE_STATES.RISK_REJECTED]: [
    TRADE_STATES.ARCHIVED,
  ],
  [TRADE_STATES.EXECUTION_REQUESTED]: [
    TRADE_STATES.EXECUTED,
    TRADE_STATES.EXECUTION_REJECTED,
    TRADE_STATES.FAILED,
  ],
  [TRADE_STATES.EXECUTION_REJECTED]: [
    TRADE_STATES.ARCHIVED,
  ],
  [TRADE_STATES.EXECUTED]: [
    TRADE_STATES.OPEN,
    TRADE_STATES.PENDING_ORDER,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.OPEN]: [
    TRADE_STATES.BREAK_EVEN,
    TRADE_STATES.TRAILING_STOP,
    TRADE_STATES.PARTIAL_CLOSE,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.BREAK_EVEN]: [
    TRADE_STATES.TRAILING_STOP,
    TRADE_STATES.PARTIAL_CLOSE,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.TRAILING_STOP]: [
    TRADE_STATES.PARTIAL_CLOSE,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.PARTIAL_CLOSE]: [
    TRADE_STATES.TRAILING_STOP,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.PENDING_ORDER]: [
    TRADE_STATES.EXECUTED,
    TRADE_STATES.PENDING_CANCELLED,
    TRADE_STATES.CLOSED,
  ],
  [TRADE_STATES.PENDING_CANCELLED]: [
    TRADE_STATES.ARCHIVED,
  ],
  [TRADE_STATES.CLOSED]: [
    TRADE_STATES.ARCHIVED,
  ],
  [TRADE_STATES.ARCHIVED]: [],
  [TRADE_STATES.FAILED]: [
    TRADE_STATES.ARCHIVED,
  ],
});function isValidTradeState(state) {
  return TRADE_STATE_VALUES.includes(state);
}function isActiveTradeState(state) {
  return ACTIVE_TRADE_STATES.includes(state);
}function isTerminalTradeState(state) {
  return TERMINAL_TRADE_STATES.includes(state);
}function isValidTransition(fromState, toState) {
  const allowed = VALID_TRADE_TRANSITIONS[fromState];
  if (!allowed) {
    return false;
  }
  return allowed.includes(toState);
}

module.exports.isValidTradeState = isValidTradeState;
module.exports.isActiveTradeState = isActiveTradeState;
module.exports.isTerminalTradeState = isTerminalTradeState;
module.exports.isValidTransition = isValidTransition;
module.exports.TRADE_STATES = TRADE_STATES;
module.exports.TRADE_STATE_VALUES = TRADE_STATE_VALUES;
module.exports.TRADE_STATE_LABELS = TRADE_STATE_LABELS;
module.exports.ACTIVE_TRADE_STATES = ACTIVE_TRADE_STATES;
module.exports.TERMINAL_TRADE_STATES = TERMINAL_TRADE_STATES;
module.exports.VALID_TRADE_TRANSITIONS = VALID_TRADE_TRANSITIONS;
