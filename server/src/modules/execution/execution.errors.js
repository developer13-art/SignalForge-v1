/**
 * Execution Module Errors
 *
 * @module signalforge/server/modules/execution/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class ExecutionRequestNotFoundError extends NotFoundError {
  constructor(message = 'Execution request not found', details = {}) {
    super(message, { code: 'EXECUTION_REQUEST_NOT_FOUND', details });
    this.name = 'ExecutionRequestNotFoundError';
  }
}

export class ExecutionRequestInvalidError extends ValidationError {
  constructor(message = 'Execution request is invalid', details = {}) {
    super(message, { code: 'EXECUTION_REQUEST_INVALID', details });
    this.name = 'ExecutionRequestInvalidError';
  }
}

export class ExecutionRequestAlreadyExistsError extends ConflictError {
  constructor(message = 'Execution request already exists') {
    super(message, { code: 'EXECUTION_REQUEST_ALREADY_EXISTS' });
    this.name = 'ExecutionRequestAlreadyExistsError';
  }
}

export class ExecutionFailedError extends Error {
  constructor(message = 'Execution failed', details = {}) {
    super(message);
    this.name = 'ExecutionFailedError';
    this.code = 'EXECUTION_FAILED';
    this.details = details;
  }
}

export class GatewayNotConfiguredError extends Error {
  constructor(message = 'Execution gateway is not configured', details = {}) {
    super(message);
    this.name = 'GatewayNotConfiguredError';
    this.code = 'GATEWAY_NOT_CONFIGURED';
    this.details = details;
  }
}

export class GatewayError extends Error {
  constructor(message = 'Gateway error', details = {}) {
    super(message);
    this.name = 'GatewayError';
    this.code = 'GATEWAY_ERROR';
    this.errorType = details.errorType || 'UNKNOWN';
    this.details = details;
  }
}

export class GatewayTimeoutError extends GatewayError {
  constructor(message = 'Gateway request timed out', details = {}) {
    super(message, { ...details, errorType: 'TIMEOUT' });
    this.name = 'GatewayTimeoutError';
  }
}

export class GatewayRateLimitedError extends GatewayError {
  constructor(message = 'Gateway rate limit exceeded', details = {}) {
    super(message, { ...details, errorType: 'RATE_LIMITED' });
    this.name = 'GatewayRateLimitedError';
  }
}

export class BrokerRejectedError extends GatewayError {
  constructor(message = 'Broker rejected the request', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'BrokerRejectedError';
  }
}

export class InsufficientMarginError extends GatewayError {
  constructor(message = 'Insufficient margin', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'InsufficientMarginError';
  }
}

export class InvalidSymbolError extends GatewayError {
  constructor(message = 'Symbol is not tradable', details = {}) {
    super(message, { ...details, errorType: 'BROKER_REJECTED' });
    this.name = 'InvalidSymbolError';
  }
}

export class ExecutionRetriesExhaustedError extends Error {
  constructor(message = 'Retries exhausted for execution request', details = {}) {
    super(message);
    this.name = 'ExecutionRetriesExhaustedError';
    this.code = 'EXECUTION_RETRIES_EXHAUSTED';
    this.details = details;
  }
}

export class UnsupportedOperationError extends ValidationError {
  constructor(message = 'Unsupported operation type', details = {}) {
    super(message, { code: 'UNSUPPORTED_OPERATION', details });
    this.name = 'UnsupportedOperationError';
  }
}