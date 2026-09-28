'use strict';

/**
 * SignalForge - Execution Router Error Types
 */

const ROUTE_ERROR_CODES = Object.freeze({
  NO_GATEWAY_AVAILABLE: 'NO_GATEWAY_AVAILABLE',
  UNSUPPORTED_SYMBOL: 'UNSUPPORTED_SYMBOL',
  UNSUPPORTED_ORDER_TYPE: 'UNSUPPORTED_ORDER_TYPE',
  UNSUPPORTED_ACCOUNT: 'UNSUPPORTED_ACCOUNT',
  INVALID_POLICY: 'INVALID_POLICY',
  KYC_REQUIRED: 'KYC_REQUIRED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ROUTE_RESOLUTION_FAILED: 'ROUTE_RESOLUTION_FAILED',
  SIMULATION_FAILED: 'SIMULATION_FAILED',
  GATEWAY_UNAVAILABLE: 'GATEWAY_UNAVAILABLE',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

class ExecutionRouterError extends Error {
  constructor(message, code = ROUTE_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'ExecutionRouterError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isExecutionRouterError = true;
    Error.captureStackTrace(this, ExecutionRouterError);
  }

  toResponse() {
    return {
      message: this.message,
      error: {
        code: this.code,
        details: this.details || undefined,
      },
    };
  }
}

class NoGatewayAvailableError extends ExecutionRouterError {
  constructor(message = 'No execution gateway is available for this request', details = null) {
    super(message, ROUTE_ERROR_CODES.NO_GATEWAY_AVAILABLE, 503, details);
    this.name = 'NoGatewayAvailableError';
  }
}

class UnsupportedSymbolError extends ExecutionRouterError {
  constructor(message = 'The symbol is not supported by any enabled gateway', details = null) {
    super(message, ROUTE_ERROR_CODES.UNSUPPORTED_SYMBOL, 400, details);
    this.name = 'UnsupportedSymbolError';
  }
}

class UnsupportedOrderTypeError extends ExecutionRouterError {
  constructor(message = 'The order type is not supported by the resolved gateway', details = null) {
    super(message, ROUTE_ERROR_CODES.UNSUPPORTED_ORDER_TYPE, 400, details);
    this.name = 'UnsupportedOrderTypeError';
  }
}

class UnsupportedAccountError extends ExecutionRouterError {
  constructor(message = 'The account cannot execute on the resolved gateway', details = null) {
    super(message, ROUTE_ERROR_CODES.UNSUPPORTED_ACCOUNT, 400, details);
    this.name = 'UnsupportedAccountError';
  }
}

class InvalidPolicyError extends ExecutionRouterError {
  constructor(message = 'The routing policy is invalid', details = null) {
    super(message, ROUTE_ERROR_CODES.INVALID_POLICY, 400, details);
    this.name = 'InvalidPolicyError';
  }
}

class KycRequiredError extends ExecutionRouterError {
  constructor(message = 'KYC verification is required for this routing path', details = null) {
    super(message, ROUTE_ERROR_CODES.KYC_REQUIRED, 403, details);
    this.name = 'KycRequiredError';
  }
}

class InsufficientBalanceError extends ExecutionRouterError {
  constructor(message = 'The account does not have sufficient balance', details = null) {
    super(message, ROUTE_ERROR_CODES.INSUFFICIENT_BALANCE, 400, details);
    this.name = 'InsufficientBalanceError';
  }
}

class RouteResolutionFailedError extends ExecutionRouterError {
  constructor(message = 'Failed to resolve an execution route', details = null) {
    super(message, ROUTE_ERROR_CODES.ROUTE_RESOLUTION_FAILED, 500, details);
    this.name = 'RouteResolutionFailedError';
  }
}

class SimulationFailedError extends ExecutionRouterError {
  constructor(message = 'Route simulation failed', details = null) {
    super(message, ROUTE_ERROR_CODES.SIMULATION_FAILED, 500, details);
    this.name = 'SimulationFailedError';
  }
}

class GatewayUnavailableError extends ExecutionRouterError {
  constructor(message = 'The resolved gateway is currently unavailable', details = null) {
    super(message, ROUTE_ERROR_CODES.GATEWAY_UNAVAILABLE, 503, details);
    this.name = 'GatewayUnavailableError';
  }
}

class ServiceUnavailableError extends ExecutionRouterError {
  constructor(message = 'The execution router is temporarily unavailable', details = null) {
    super(message, ROUTE_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

function isExecutionRouterError(error) {
  return Boolean(error && error.isExecutionRouterError === true);
}

function toExecutionRouterResponse(error) {
  if (isExecutionRouterError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred while resolving an execution route',
      error: { code: ROUTE_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  ROUTE_ERROR_CODES,
  ExecutionRouterError,
  NoGatewayAvailableError,
  UnsupportedSymbolError,
  UnsupportedOrderTypeError,
  UnsupportedAccountError,
  InvalidPolicyError,
  KycRequiredError,
  InsufficientBalanceError,
  RouteResolutionFailedError,
  SimulationFailedError,
  GatewayUnavailableError,
  ServiceUnavailableError,
  isExecutionRouterError,
  toExecutionRouterResponse,
};