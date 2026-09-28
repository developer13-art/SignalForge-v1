/**
 * Execution Module Errors
 *
 * @module signalforge/server/modules/execution/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class ExecutionRequestNotFoundError extends NotFoundError {
  constructor(message = 'Execution request not found', details = {}) {
    super(message, { code: 'EXECUTION_REQUEST_NOT_FOUND', details });
    this.name = 'ExecutionRequestNotFoundError';
  }
}
class ExecutionRequestInvalidError extends ValidationError {
  constructor(message = 'Execution request is invalid', details = {}) {
    super(message, { code: 'EXECUTION_REQUEST_INVALID', details });
    this.name = 'ExecutionRequestInvalidError';
  }
}
class ExecutionRequestAlreadyExistsError extends ConflictError {
  constructor(message = 'Execution request already exists') {
    super(message, { code: 'EXECUTION_REQUEST_ALREADY_EXISTS' });
    this.name = 'ExecutionRequestAlreadyExistsError';
  }
}
class ExecutionFailedError extends Error {
  constructor(message = 'Execution failed', details = {}) {
    super(message);
    this.name = 'ExecutionFailedError';
    this.code = 'EXECUTION_FAILED';
    this.details = details;
  }
}
class GatewayNotConfiguredError extends Error {
  constructor(message = 'Execution gateway is not configured', details = {}) {
    super(message);
    this.name = 'GatewayNotConfiguredError';
    this.code = 'GATEWAY_NOT_CONFIGURED';
    this.details = details;
  }
}
class GatewayError extends Error {
  constructor(message = 'Gateway error', details = {}) {
    super(message);
    this.name = 'GatewayError';
    this.code = 'GATEWAY_ERROR';
    this.errorType = details.errorType || 'UNKNOWN';
    this.details = details;
  }
}
class GatewayTimeoutError extends GatewayError {
  constructor(message = 'Gateway request timed out', details = {}) {
    super(message, { ...details, errorType: 'TIMEOUT' });
    this.name = 'GatewayTimeoutError';
  }
}
class GatewayRateLimitedError extends GatewayError {
  constructor(message = 'Gateway rate limit exceeded', details = {}) {
    super(message, { ...details, errorType: 'RATE_LIMITED' });
    this.name = 'GatewayRateLimitedError';
  }
}
class BrokerRejectedError extends GatewayError {
  constructor(message = 'Broker rejected the request', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'BrokerRejectedError';
  }
}
class InsufficientMarginError extends GatewayError {
  constructor(message = 'Insufficient margin', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'InsufficientMarginError';
  }
}
class InvalidSymbolError extends GatewayError {
  constructor(message = 'Symbol is not tradable', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'InvalidSymbolError';
  }
}
class ExecutionRetriesExhaustedError extends Error {
  constructor(message = 'Retries exhausted for execution request', details = {}) {
    super(message);
    this.name = 'ExecutionRetriesExhaustedError';
    this.code = 'EXECUTION_RETRIES_EXHAUSTED';
    this.details = details;
  }
}
class UnsupportedOperationError extends ValidationError {
  constructor(message = 'Unsupported operation type', details = {}) {
    super(message, { code: 'UNSUPPORTED_OPERATION', details });
    this.name = 'UnsupportedOperationError';
  }
}
module.exports.ExecutionRequestNotFoundError = ExecutionRequestNotFoundError;
module.exports.ExecutionRequestInvalidError = ExecutionRequestInvalidError;
module.exports.ExecutionRequestAlreadyExistsError = ExecutionRequestAlreadyExistsError;
module.exports.ExecutionFailedError = ExecutionFailedError;
module.exports.GatewayNotConfiguredError = GatewayNotConfiguredError;
module.exports.GatewayError = GatewayError;
module.exports.GatewayTimeoutError = GatewayTimeoutError;
module.exports.GatewayRateLimitedError = GatewayRateLimitedError;
module.exports.BrokerRejectedError = BrokerRejectedError;
module.exports.InsufficientMarginError = InsufficientMarginError;
module.exports.InvalidSymbolError = InvalidSymbolError;
module.exports.ExecutionRetriesExhaustedError = ExecutionRetriesExhaustedError;
module.exports.UnsupportedOperationError = UnsupportedOperationError;
