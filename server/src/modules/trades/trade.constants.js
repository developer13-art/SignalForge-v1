/**
 * Trades Module Constants
 *
 * @module signalforge/server/modules/trades/constants
 */

export const TRADE_EVENTS = Object.freeze({
  TRADE_CREATED: 'trades.trade.created',
  TRADE_UPDATED: 'trades.trade.updated',
  TRADE_CLOSED: 'trades.trade.closed',
  TRADE_ARCHIVED: 'trades.trade.archived',
  MANUAL_OPEN: 'trades.manual.open',
  MANUAL_CLOSE: 'trades.manual.close',
  MANUAL_MODIFY: 'trades.manual.modify',
  MANUAL_INTERVENTION: 'trades.manual.intervention',
  TIMELINE_RECORDED: 'trades.timeline.recorded',
});

export const TRADE_STATUSES = Object.freeze({
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
});

export const TRADE_STATUS_VALUES = Object.freeze(Object.values(TRADE_STATUSES));

export const OPEN_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.OPEN,
  TRADE_STATUSES.BREAK_EVEN,
  TRADE_STATUSES.TRAILING_STOP,
  TRADE_STATUSES.PARTIAL_CLOSE,
  TRADE_STATUSES.PENDING_ORDER,
]);

export const CLOSED_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.CLOSED,
  TRADE_STATUSES.ARCHIVED,
]);

export const ACTIVE_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.OPEN,
  TRADE_STATUSES.BREAK_EVEN,
  TRADE_STATUSES.TRAILING_STOP,
  TRADE_STATUSES.PARTIAL_CLOSE,
  TRADE_STATUSES.PENDING_ORDER,
  TRADE_STATUSES.EXECUTED,
]);

export const TRADE_ACTORS = Object.freeze({
  SYSTEM: 'SYSTEM',
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  AUTO_RULE: 'AUTO_RULE',
  BROKER: 'BROKER',
  ADMIN: 'ADMIN',
  RISK_ENGINE: 'RISK_ENGINE',
  COPY_ENGINE: 'COPY_ENGINE',
});

export const TRADE_ACTOR_VALUES = Object.freeze(Object.values(TRADE_ACTORS));

export const TRADE_DIRECTIONS = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
});

export const TRADE_DIRECTION_VALUES = Object.freeze(Object.values(TRADE_DIRECTIONS));

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 200;
export const MAX_TRADES_PER_QUERY = 1000;

export const DEFAULT_HISTORY_DAYS = 90;
export const MAX_HISTORY_DAYS = 365;

export const EXPORT_FORMATS = Object.freeze({
  CSV: 'CSV',
  JSON: 'JSON',
});

export const EXPORT_FORMAT_VALUES = Object.freeze(Object.values(EXPORT_FORMATS));

export function isValidTradeStatus(status) {
  return TRADE_STATUS_VALUES.includes(status);
}

export function isValidTradeActor(actor) {
  return TRADE_ACTOR_VALUES.includes(actor);
}

export function isValidDirection(direction) {
  return TRADE_DIRECTION_VALUES.includes(direction);
}

export function isOpenStatus(status) {
  return OPEN_TRADE_STATUSES.includes(status);
}

export function isClosedStatus(status) {
  return CLOSED_TRADE_STATUSES.includes(status);
}

export function isActiveStatus(status) {
  return ACTIVE_TRADE_STATUSES.includes(status);
}