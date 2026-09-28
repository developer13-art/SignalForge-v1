'use strict';

const { SHARED_ERROR_CODES } = require('./shared.constants');

/**
 * SignalForge - DEX Gateway Interface
 *
 * Defines the contract every DEX and perpetual gateway must implement.
 * This interface is documentation-only: JavaScript does not enforce
 * method presence, but the gateway registry relies on this contract
 * when it wires gateways into the execution router.
 *
 * The contract is intentionally minimal so that new gateways can be
 * added without touching the router.
 */

class UnsupportedOperationError extends Error {
  constructor(operation, gateway) {
    super(`Operation ${operation} is not supported by gateway ${gateway}`);
    this.name = 'UnsupportedOperationError';
    this.code = SHARED_ERROR_CODES.UNSUPPORTED_OPERATION;
    this.operation = operation;
    this.gateway = gateway;
    this.isSharedDexError = true;
  }
}

const REQUIRED_METHODS = Object.freeze([
  'quote',
  'buildSwap',
  'submit',
  'confirm',
  'health',
]);

const OPTIONAL_METHODS = Object.freeze([
  'reconcile',
  'cancel',
  'modify',
  'positions',
  'close',
  'resolveToken',
  'resolveSymbol',
  'describeFees',
]);

const OPTIONAL_PERP_METHODS = Object.freeze([
  'order',
  'setLeverage',
  'setMargin',
  'markets',
  'marketMargin',
]);

function implementsMethod(gateway, method) {
  return Boolean(gateway && typeof gateway[method] === 'function');
}

function validateGateway(gateway, { name } = {}) {
  const errors = [];

  if (!gateway) {
    return {
      valid: false,
      errors: ['gateway is required'],
    };
  }

  for (const method of REQUIRED_METHODS) {
    if (!implementsMethod(gateway, method)) {
      errors.push(`Gateway ${name || 'unknown'} is missing required method: ${method}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    requiredMethods: REQUIRED_METHODS,
    optionalMethods: OPTIONAL_METHODS,
    optionalPerpMethods: OPTIONAL_PERP_METHODS,
  };
}

function assertMethod(gateway, method, { name } = {}) {
  if (!implementsMethod(gateway, method)) {
    throw new UnsupportedOperationError(method, name || 'unknown');
  }
  return true;
}

function describeGateway(gateway, { name } = {}) {
  if (!gateway) {
    return null;
  }

  const capabilities = {
    required: {},
    optional: {},
    perp: {},
  };

  for (const method of REQUIRED_METHODS) {
    capabilities.required[method] = implementsMethod(gateway, method);
  }
  for (const method of OPTIONAL_METHODS) {
    capabilities.optional[method] = implementsMethod(gateway, method);
  }
  for (const method of OPTIONAL_PERP_METHODS) {
    capabilities.perp[method] = implementsMethod(gateway, method);
  }

  return {
    name: name || 'unknown',
    capabilities,
    supportsSwap: implementsMethod(gateway, 'buildSwap'),
    supportsPerp: implementsMethod(gateway, 'order'),
    supportsCancel: implementsMethod(gateway, 'cancel'),
    supportsModify: implementsMethod(gateway, 'modify'),
    supportsPositions: implementsMethod(gateway, 'positions'),
  };
}

function isSharedDexError(error) {
  return Boolean(error && error.isSharedDexError === true);
}

module.exports = {
  UnsupportedOperationError,
  REQUIRED_METHODS,
  OPTIONAL_METHODS,
  OPTIONAL_PERP_METHODS,
  implementsMethod,
  validateGateway,
  assertMethod,
  describeGateway,
  isSharedDexError,
};