/**
 * Execution Module Constants
 *
 * @module signalforge/server/modules/execution/constants
 */
const EXECUTION_EVENTS = Object.freeze({
  REQUEST_CREATED: 'execution.request.created',
  REQUEST_ACCEPTED: 'execution.request.accepted',
  REQUEST_REJECTED: 'execution.request.rejected',
  REQUEST_RETRIED: 'execution.request.retried',
  REQUEST_FAILED: 'execution.request.failed',
  REQUEST_DEAD_LETTERED: 'execution.request.dead_lettered',
  ORDER_PLACED: 'execution.order.placed',
  ORDER_ACCEPTED: 'execution.order.accepted',
  ORDER_REJECTED: 'execution.order.rejected',
  POSITION_OPENED: 'execution.position.opened',
  POSITION_MODIFIED: 'execution.position.modified',
  POSITION_CLOSED: 'execution.position.closed',
  PARTIAL_CLOSE_EXECUTED: 'execution.partial_close.executed',
  PENDING_ORDER_PLACED: 'execution.pending_order.placed',
  PENDING_ORDER_CANCELLED: 'execution.pending_order.cancelled',
  GATEWAY_ERROR: 'execution.gateway.error',
  GATEWAY_TIMEOUT: 'execution.gateway.timeout',
  GATEWAY_RATE_LIMITED: 'execution.gateway.rate_limited',
  SYNC_COMPLETED: 'execution.sync.completed',
  LATENCY_ALERT: 'execution.latency.alert',
});
const EXECUTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  DEAD_LETTER: 'DEAD_LETTER',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});
const EXECUTION_STATUS_VALUES = Object.freeze(
  Object.values(EXECUTION_STATUSES),
);
const GATEWAY_TYPES = Object.freeze({
  METAAPI: 'METAAPI',
  MT5_BRIDGE: 'MT5_BRIDGE',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});
const GATEWAY_TYPE_VALUES = Object.freeze(Object.values(GATEWAY_TYPES));
const OPERATION_TYPES = Object.freeze({
  OPEN_POSITION: 'OPEN_POSITION',
  CLOSE_POSITION: 'CLOSE_POSITION',
  MODIFY_POSITION: 'MODIFY_POSITION',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  PENDING_ORDER: 'PENDING_ORDER',
  CANCEL_PENDING: 'CANCEL_PENDING',
  SYNC_POSITIONS: 'SYNC_POSITIONS',
});
const OPERATION_TYPE_VALUES = Object.freeze(Object.values(OPERATION_TYPES));
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;
const DEFAULT_MAX_RETRY_DELAY_MS = 15000;
const DEFAULT_EXECUTION_TIMEOUT_MS = 30000;
const DEFAULT_LATENCY_ALERT_MS = 2000;
const DEFAULT_DEAD_LETTER_RETENTION_DAYS = 30;
const GATEWAY_ERROR_TYPES = Object.freeze({
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  BROKER_REJECTED: 'BROKER_REJECTED',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN',
});
const RETRYABLE_GATEWAY_ERRORS = Object.freeze([
  GATEWAY_ERROR_TYPES.TIMEOUT,
  GATEWAY_ERROR_TYPES.RATE_LIMITED,
  GATEWAY_ERROR_TYPES.NETWORK,
]);
function isExecutableStatus(status) {
  return EXECUTION_STATUS_VALUES.includes(status);
}
function isValidGatewayType(type) {
  return GATEWAY_TYPE_VALUES.includes(type);
}
function isValidOperationType(type) {
  return OPERATION_TYPE_VALUES.includes(type);
}
function isRetryableGatewayError(errorType) {
  return RETRYABLE_GATEWAY_ERRORS.includes(errorType);
}
module.exports.EXECUTION_EVENTS = EXECUTION_EVENTS;
module.exports.EXECUTION_STATUSES = EXECUTION_STATUSES;
module.exports.EXECUTION_STATUS_VALUES = EXECUTION_STATUS_VALUES;
module.exports.GATEWAY_TYPES = GATEWAY_TYPES;
module.exports.GATEWAY_TYPE_VALUES = GATEWAY_TYPE_VALUES;
module.exports.OPERATION_TYPES = OPERATION_TYPES;
module.exports.OPERATION_TYPE_VALUES = OPERATION_TYPE_VALUES;
module.exports.DEFAULT_MAX_ATTEMPTS = DEFAULT_MAX_ATTEMPTS;
module.exports.DEFAULT_RETRY_DELAY_MS = DEFAULT_RETRY_DELAY_MS;
module.exports.DEFAULT_MAX_RETRY_DELAY_MS = DEFAULT_MAX_RETRY_DELAY_MS;
module.exports.DEFAULT_EXECUTION_TIMEOUT_MS = DEFAULT_EXECUTION_TIMEOUT_MS;
module.exports.DEFAULT_LATENCY_ALERT_MS = DEFAULT_LATENCY_ALERT_MS;
module.exports.DEFAULT_DEAD_LETTER_RETENTION_DAYS = DEFAULT_DEAD_LETTER_RETENTION_DAYS;
module.exports.GATEWAY_ERROR_TYPES = GATEWAY_ERROR_TYPES;
module.exports.RETRYABLE_GATEWAY_ERRORS = RETRYABLE_GATEWAY_ERRORS;
module.exports.isExecutableStatus = isExecutableStatus;
module.exports.isValidGatewayType = isValidGatewayType;
module.exports.isValidOperationType = isValidOperationType;
module.exports.isRetryableGatewayError = isRetryableGatewayError;
