/**
 * Execution Module Constants
 *
 * @module signalforge/server/modules/execution/constants
 */

export const EXECUTION_EVENTS = Object.freeze({
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

export const EXECUTION_STATUSES = Object.freeze({
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

export const EXECUTION_STATUS_VALUES = Object.freeze(
  Object.values(EXECUTION_STATUSES),
);

export const GATEWAY_TYPES = Object.freeze({
  METAAPI: 'METAAPI',
  MT5_BRIDGE: 'MT5_BRIDGE',
  CTRADER: 'CTRADER',
  DXTRADE: 'DXTRADE',
  INTERACTIVE_BROKERS: 'INTERACTIVE_BROKERS',
  OANDA: 'OANDA',
});

export const GATEWAY_TYPE_VALUES = Object.freeze(Object.values(GATEWAY_TYPES));

export const OPERATION_TYPES = Object.freeze({
  OPEN_POSITION: 'OPEN_POSITION',
  CLOSE_POSITION: 'CLOSE_POSITION',
  MODIFY_POSITION: 'MODIFY_POSITION',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  PENDING_ORDER: 'PENDING_ORDER',
  CANCEL_PENDING: 'CANCEL_PENDING',
  SYNC_POSITIONS: 'SYNC_POSITIONS',
});

export const OPERATION_TYPE_VALUES = Object.freeze(Object.values(OPERATION_TYPES));

export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_RETRY_DELAY_MS = 2000;
export const DEFAULT_MAX_RETRY_DELAY_MS = 15000;
export const DEFAULT_EXECUTION_TIMEOUT_MS = 30000;
export const DEFAULT_LATENCY_ALERT_MS = 2000;
export const DEFAULT_DEAD_LETTER_RETENTION_DAYS = 30;

export const GATEWAY_ERROR_TYPES = Object.freeze({
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  BROKER_REJECTED: 'BROKER_REJECTED',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN',
});

export const RETRYABLE_GATEWAY_ERRORS = Object.freeze([
  GATEWAY_ERROR_TYPES.TIMEOUT,
  GATEWAY_ERROR_TYPES.RATE_LIMITED,
  GATEWAY_ERROR_TYPES.NETWORK,
]);

export function isExecutableStatus(status) {
  return EXECUTION_STATUS_VALUES.includes(status);
}

export function isValidGatewayType(type) {
  return GATEWAY_TYPE_VALUES.includes(type);
}

export function isValidOperationType(type) {
  return OPERATION_TYPE_VALUES.includes(type);
}

export function isRetryableGatewayError(errorType) {
  return RETRYABLE_GATEWAY_ERRORS.includes(errorType);
}