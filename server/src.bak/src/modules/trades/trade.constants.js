/**
 * Trades Module Constants
 *
 * @module signalforge/server/modules/trades/constants
 */
const TRADE_EVENTS = Object.freeze({
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
const TRADE_STATUSES = Object.freeze({
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
const TRADE_STATUS_VALUES = Object.freeze(Object.values(TRADE_STATUSES));
const OPEN_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.OPEN,
  TRADE_STATUSES.BREAK_EVEN,
  TRADE_STATUSES.TRAILING_STOP,
  TRADE_STATUSES.PARTIAL_CLOSE,
  TRADE_STATUSES.PENDING_ORDER,
]);
const CLOSED_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.CLOSED,
  TRADE_STATUSES.ARCHIVED,
]);
const ACTIVE_TRADE_STATUSES = Object.freeze([
  TRADE_STATUSES.OPEN,
  TRADE_STATUSES.BREAK_EVEN,
  TRADE_STATUSES.TRAILING_STOP,
  TRADE_STATUSES.PARTIAL_CLOSE,
  TRADE_STATUSES.PENDING_ORDER,
  TRADE_STATUSES.EXECUTED,
]);
const TRADE_ACTORS = Object.freeze({
  SYSTEM: 'SYSTEM',
  USER: 'USER',
  PROVIDER: 'PROVIDER',
  AUTO_RULE: 'AUTO_RULE',
  BROKER: 'BROKER',
  ADMIN: 'ADMIN',
  RISK_ENGINE: 'RISK_ENGINE',
  COPY_ENGINE: 'COPY_ENGINE',
});
const TRADE_ACTOR_VALUES = Object.freeze(Object.values(TRADE_ACTORS));
const TRADE_DIRECTIONS = Object.freeze({
  BUY: 'BUY',
  SELL: 'SELL',
});
const TRADE_DIRECTION_VALUES = Object.freeze(Object.values(TRADE_DIRECTIONS));
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;
const MAX_TRADES_PER_QUERY = 1000;
const DEFAULT_HISTORY_DAYS = 90;
const MAX_HISTORY_DAYS = 365;
const EXPORT_FORMATS = Object.freeze({
  CSV: 'CSV',
  JSON: 'JSON',
});
const EXPORT_FORMAT_VALUES = Object.freeze(Object.values(EXPORT_FORMATS));
function isValidTradeStatus(status) {
  return TRADE_STATUS_VALUES.includes(status);
}
function isValidTradeActor(actor) {
  return TRADE_ACTOR_VALUES.includes(actor);
}
function isValidDirection(direction) {
  return TRADE_DIRECTION_VALUES.includes(direction);
}
function isOpenStatus(status) {
  return OPEN_TRADE_STATUSES.includes(status);
}
function isClosedStatus(status) {
  return CLOSED_TRADE_STATUSES.includes(status);
}
function isActiveStatus(status) {
  return ACTIVE_TRADE_STATUSES.includes(status);
}
module.exports.TRADE_EVENTS = TRADE_EVENTS;
module.exports.TRADE_STATUSES = TRADE_STATUSES;
module.exports.TRADE_STATUS_VALUES = TRADE_STATUS_VALUES;
module.exports.OPEN_TRADE_STATUSES = OPEN_TRADE_STATUSES;
module.exports.CLOSED_TRADE_STATUSES = CLOSED_TRADE_STATUSES;
module.exports.ACTIVE_TRADE_STATUSES = ACTIVE_TRADE_STATUSES;
module.exports.TRADE_ACTORS = TRADE_ACTORS;
module.exports.TRADE_ACTOR_VALUES = TRADE_ACTOR_VALUES;
module.exports.TRADE_DIRECTIONS = TRADE_DIRECTIONS;
module.exports.TRADE_DIRECTION_VALUES = TRADE_DIRECTION_VALUES;
module.exports.DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE;
module.exports.MAX_PAGE_SIZE = MAX_PAGE_SIZE;
module.exports.MAX_TRADES_PER_QUERY = MAX_TRADES_PER_QUERY;
module.exports.DEFAULT_HISTORY_DAYS = DEFAULT_HISTORY_DAYS;
module.exports.MAX_HISTORY_DAYS = MAX_HISTORY_DAYS;
module.exports.EXPORT_FORMATS = EXPORT_FORMATS;
module.exports.EXPORT_FORMAT_VALUES = EXPORT_FORMAT_VALUES;
module.exports.isValidTradeStatus = isValidTradeStatus;
module.exports.isValidTradeActor = isValidTradeActor;
module.exports.isValidDirection = isValidDirection;
module.exports.isOpenStatus = isOpenStatus;
module.exports.isClosedStatus = isClosedStatus;
module.exports.isActiveStatus = isActiveStatus;
