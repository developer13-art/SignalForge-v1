'use strict';

const { ACTIONS_ERROR_CODES } = require('./actions.constants');

/**
 * SignalForge - Solana Actions Error Types
 *
 * A dedicated error hierarchy so that every failure raised inside the
 * Solana Actions subsystem carries an explicit, machine-readable code
 * that maps to the Solana Actions specification error envelope.
 */

class ActionsError extends Error {
  constructor(message, code = ACTIONS_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'ActionsError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isActionsError = true;
    Error.captureStackTrace(this, ActionsError);
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

class InvalidActionError extends ActionsError {
  constructor(message = 'The requested action is not supported', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_ACTION, 400, details);
    this.name = 'InvalidActionError';
  }
}

class InvalidRequestError extends ActionsError {
  constructor(message = 'The request payload is invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_REQUEST, 400, details);
    this.name = 'InvalidRequestError';
  }
}

class InvalidParameterError extends ActionsError {
  constructor(message = 'One or more parameters are invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_PARAMETER, 400, details);
    this.name = 'InvalidParameterError';
  }
}

class UnsupportedMethodError extends ActionsError {
  constructor(message = 'The HTTP method is not supported for this action', details = null) {
    super(message, ACTIONS_ERROR_CODES.UNSUPPORTED_METHOD, 405, details);
    this.name = 'UnsupportedMethodError';
  }
}

class UnsupportedChainError extends ActionsError {
  constructor(message = 'The requested chain is not supported', details = null) {
    super(message, ACTIONS_ERROR_CODES.UNSUPPORTED_CHAIN, 400, details);
    this.name = 'UnsupportedChainError';
  }
}

class UnsupportedTokenError extends ActionsError {
  constructor(message = 'The requested token is not supported', details = null) {
    super(message, ACTIONS_ERROR_CODES.UNSUPPORTED_TOKEN, 400, details);
    this.name = 'UnsupportedTokenError';
  }
}

class InvalidWalletError extends ActionsError {
  constructor(message = 'The provided wallet address is invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_WALLET, 400, details);
    this.name = 'InvalidWalletError';
  }
}

class InvalidAmountError extends ActionsError {
  constructor(message = 'The requested amount is invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_AMOUNT, 400, details);
    this.name = 'InvalidAmountError';
  }
}

class InvalidPlanError extends ActionsError {
  constructor(message = 'The requested subscription plan is invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_PLAN, 400, details);
    this.name = 'InvalidPlanError';
  }
}

class InvalidReferralError extends ActionsError {
  constructor(message = 'The provided referral code is invalid', details = null) {
    super(message, ACTIONS_ERROR_CODES.INVALID_REFERRAL, 400, details);
    this.name = 'InvalidReferralError';
  }
}

class DuplicateRequestError extends ActionsError {
  constructor(message = 'This request has already been processed', details = null) {
    super(message, ACTIONS_ERROR_CODES.DUPLICATE_REQUEST, 409, details);
    this.name = 'DuplicateRequestError';
  }
}

class ReplayAttackError extends ActionsError {
  constructor(message = 'The request appears to be a replay', details = null) {
    super(message, ACTIONS_ERROR_CODES.REPLAY_ATTACK, 400, details);
    this.name = 'ReplayAttackError';
  }
}

class TransactionBuildError extends ActionsError {
  constructor(message = 'Failed to build the transaction', details = null) {
    super(message, ACTIONS_ERROR_CODES.TRANSACTION_BUILD_FAILED, 500, details);
    this.name = 'TransactionBuildError';
  }
}

class ConfirmationFailedError extends ActionsError {
  constructor(message = 'The transaction failed to confirm', details = null) {
    super(message, ACTIONS_ERROR_CODES.CONFIRMATION_FAILED, 400, details);
    this.name = 'ConfirmationFailedError';
  }
}

class ConfirmationTimeoutError extends ActionsError {
  constructor(message = 'The transaction confirmation timed out', details = null) {
    super(message, ACTIONS_ERROR_CODES.CONFIRMATION_TIMEOUT, 408, details);
    this.name = 'ConfirmationTimeoutError';
  }
}

class ServiceUnavailableError extends ActionsError {
  constructor(message = 'The Solana Actions service is temporarily unavailable', details = null) {
    super(message, ACTIONS_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

class RateLimitedError extends ActionsError {
  constructor(message = 'Too many requests', details = null) {
    super(message, ACTIONS_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class NotFoundError extends ActionsError {
  constructor(message = 'The requested resource was not found', details = null) {
    super(message, ACTIONS_ERROR_CODES.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

function isActionsError(error) {
  return Boolean(error && error.isActionsError === true);
}

function toActionsResponse(error) {
  if (isActionsError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }

  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred while processing the action',
      error: {
        code: ACTIONS_ERROR_CODES.INTERNAL_ERROR,
      },
    },
  };
}

module.exports = {
  ActionsError,
  InvalidActionError,
  InvalidRequestError,
  InvalidParameterError,
  UnsupportedMethodError,
  UnsupportedChainError,
  UnsupportedTokenError,
  InvalidWalletError,
  InvalidAmountError,
  InvalidPlanError,
  InvalidReferralError,
  DuplicateRequestError,
  ReplayAttackError,
  TransactionBuildError,
  ConfirmationFailedError,
  ConfirmationTimeoutError,
  ServiceUnavailableError,
  RateLimitedError,
  NotFoundError,
  isActionsError,
  toActionsResponse,
};