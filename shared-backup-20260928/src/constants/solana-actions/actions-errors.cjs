'use strict';

/**
 * SignalForge - Solana Actions Error Code Constants
 *
 * Shared between client and server so that UI messaging can map an
 * error code from the backend into a human-friendly string without
 * duplicating conditionals across the codebase.
 */

const ACTIONS_ERROR_CODES = Object.freeze({
  INVALID_ACTION: 'INVALID_ACTION',
  INVALID_REQUEST: 'INVALID_REQUEST',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  UNSUPPORTED_METHOD: 'UNSUPPORTED_METHOD',
  UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
  UNSUPPORTED_TOKEN: 'UNSUPPORTED_TOKEN',
  UNSUPPORTED_CONTENT_ENCODING: 'UNSUPPORTED_CONTENT_ENCODING',
  INVALID_WALLET: 'INVALID_WALLET',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_PLAN: 'INVALID_PLAN',
  INVALID_REFERRAL: 'INVALID_REFERRAL',
  DUPLICATE_REQUEST: 'DUPLICATE_REQUEST',
  REPLAY_ATTACK: 'REPLAY_ATTACK',
  TRANSACTION_BUILD_FAILED: 'TRANSACTION_BUILD_FAILED',
  CONFIRMATION_FAILED: 'CONFIRMATION_FAILED',
  CONFIRMATION_TIMEOUT: 'CONFIRMATION_TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ACTION_FAILED: 'ACTION_FAILED',
});

const ACTIONS_ERROR_MESSAGES = Object.freeze({
  [ACTIONS_ERROR_CODES.INVALID_ACTION]: 'The requested action is not supported.',
  [ACTIONS_ERROR_CODES.INVALID_REQUEST]: 'The request payload is invalid.',
  [ACTIONS_ERROR_CODES.INVALID_PARAMETER]: 'One or more parameters are invalid.',
  [ACTIONS_ERROR_CODES.UNSUPPORTED_METHOD]: 'The HTTP method is not supported for this action.',
  [ACTIONS_ERROR_CODES.UNSUPPORTED_CHAIN]: 'The requested chain is not supported.',
  [ACTIONS_ERROR_CODES.UNSUPPORTED_TOKEN]: 'The requested token is not supported.',
  [ACTIONS_ERROR_CODES.UNSUPPORTED_CONTENT_ENCODING]: 'The Content-Encoding is not supported.',
  [ACTIONS_ERROR_CODES.INVALID_WALLET]: 'The provided wallet address is invalid.',
  [ACTIONS_ERROR_CODES.INVALID_AMOUNT]: 'The requested amount is invalid.',
  [ACTIONS_ERROR_CODES.INVALID_PLAN]: 'The requested subscription plan is invalid.',
  [ACTIONS_ERROR_CODES.INVALID_REFERRAL]: 'The provided referral code is invalid.',
  [ACTIONS_ERROR_CODES.DUPLICATE_REQUEST]: 'This request has already been processed.',
  [ACTIONS_ERROR_CODES.REPLAY_ATTACK]: 'The request appears to be a replay.',
  [ACTIONS_ERROR_CODES.TRANSACTION_BUILD_FAILED]: 'Failed to build the transaction.',
  [ACTIONS_ERROR_CODES.CONFIRMATION_FAILED]: 'The transaction failed to confirm.',
  [ACTIONS_ERROR_CODES.CONFIRMATION_TIMEOUT]: 'The transaction confirmation timed out.',
  [ACTIONS_ERROR_CODES.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',
  [ACTIONS_ERROR_CODES.RATE_LIMITED]: 'Too many requests. Please try again shortly.',
  [ACTIONS_ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ACTIONS_ERROR_CODES.INTERNAL_ERROR]: 'An unexpected error occurred.',
  [ACTIONS_ERROR_CODES.UNAUTHENTICATED]: 'Authentication is required.',
  [ACTIONS_ERROR_CODES.ACTION_FAILED]: 'The action could not be completed.',
});

function resolveErrorMessage(code) {
  if (!code) {
    return ACTIONS_ERROR_MESSAGES[ACTIONS_ERROR_CODES.INTERNAL_ERROR];
  }
  return ACTIONS_ERROR_MESSAGES[code] || ACTIONS_ERROR_MESSAGES[ACTIONS_ERROR_CODES.INTERNAL_ERROR];
}

module.exports = Object.freeze({
  ACTIONS_ERROR_CODES,
  ACTIONS_ERROR_MESSAGES,
  resolveErrorMessage,
});