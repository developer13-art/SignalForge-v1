'use strict';

const { PROOF_ERROR_CODES } = require('./proof.constants');

/**
 * SignalForge - Proof of Alpha Error Types
 *
 * Dedicated error hierarchy so that every failure inside the Proof of
 * Alpha subsystem carries a machine-readable code and, when relevant,
 * an HTTP status suitable for API responses.
 */

class ProofError extends Error {
  constructor(message, code = PROOF_ERROR_CODES.INTERNAL_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'ProofError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isProofError = true;
    Error.captureStackTrace(this, ProofError);
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

class InvalidMemoError extends ProofError {
  constructor(message = 'The memo payload is invalid', details = null) {
    super(message, PROOF_ERROR_CODES.INVALID_MEMO, 400, details);
    this.name = 'InvalidMemoError';
  }
}

class MemoTooLargeError extends ProofError {
  constructor(message = 'The memo payload exceeds the maximum allowed size', details = null) {
    super(message, PROOF_ERROR_CODES.MEMO_TOO_LARGE, 400, details);
    this.name = 'MemoTooLargeError';
  }
}

class SignerUnavailableError extends ProofError {
  constructor(message = 'The Proof of Alpha signer is unavailable', details = null) {
    super(message, PROOF_ERROR_CODES.SIGNER_UNAVAILABLE, 503, details);
    this.name = 'SignerUnavailableError';
  }
}

class RpcUnavailableError extends ProofError {
  constructor(message = 'The Solana RPC endpoint is unavailable', details = null) {
    super(message, PROOF_ERROR_CODES.RPC_UNAVAILABLE, 503, details);
    this.name = 'RpcUnavailableError';
  }
}

class SubmissionFailedError extends ProofError {
  constructor(message = 'Failed to submit the proof memo', details = null) {
    super(message, PROOF_ERROR_CODES.SUBMISSION_FAILED, 500, details);
    this.name = 'SubmissionFailedError';
  }
}

class ConfirmationFailedError extends ProofError {
  constructor(message = 'The proof memo failed to confirm', details = null) {
    super(message, PROOF_ERROR_CODES.CONFIRMATION_FAILED, 400, details);
    this.name = 'ConfirmationFailedError';
  }
}

class ProofNotFoundError extends ProofError {
  constructor(message = 'The proof was not found', details = null) {
    super(message, PROOF_ERROR_CODES.PROOF_NOT_FOUND, 404, details);
    this.name = 'ProofNotFoundError';
  }
}

class VerificationFailedError extends ProofError {
  constructor(message = 'Proof verification failed', details = null) {
    super(message, PROOF_ERROR_CODES.VERIFICATION_FAILED, 400, details);
    this.name = 'VerificationFailedError';
  }
}

class InvalidProviderError extends ProofError {
  constructor(message = 'The provider is invalid or unknown', details = null) {
    super(message, PROOF_ERROR_CODES.INVALID_PROVIDER, 400, details);
    this.name = 'InvalidProviderError';
  }
}

class InvalidTradeError extends ProofError {
  constructor(message = 'The trade is invalid or unknown', details = null) {
    super(message, PROOF_ERROR_CODES.INVALID_TRADE, 400, details);
    this.name = 'InvalidTradeError';
  }
}

class RateLimitedError extends ProofError {
  constructor(message = 'Too many requests', details = null) {
    super(message, PROOF_ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitedError';
  }
}

class ServiceUnavailableError extends ProofError {
  constructor(message = 'The Proof of Alpha service is temporarily unavailable', details = null) {
    super(message, PROOF_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

function isProofError(error) {
  return Boolean(error && error.isProofError === true);
}

function toProofResponse(error) {
  if (isProofError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    };
  }
  return {
    statusCode: 500,
    body: {
      message: 'An unexpected error occurred while processing the proof request',
      error: { code: PROOF_ERROR_CODES.INTERNAL_ERROR },
    },
  };
}

module.exports = {
  ProofError,
  InvalidMemoError,
  MemoTooLargeError,
  SignerUnavailableError,
  RpcUnavailableError,
  SubmissionFailedError,
  ConfirmationFailedError,
  ProofNotFoundError,
  VerificationFailedError,
  InvalidProviderError,
  InvalidTradeError,
  RateLimitedError,
  ServiceUnavailableError,
  isProofError,
  toProofResponse,
};