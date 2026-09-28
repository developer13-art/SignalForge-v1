/**
 * Auth Module Errors
 *
 * @module signalforge/server/modules/auth/errors
 */

import { AuthenticationError } from '../../lib/errors/authentication-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Invalid email or password') {
    super(message, { code: 'INVALID_CREDENTIALS' });
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountLockedError extends AuthenticationError {
  constructor(message = 'Account is temporarily locked due to too many failed login attempts', details = {}) {
    super(message, { code: 'ACCOUNT_LOCKED', details });
    this.name = 'AccountLockedError';
  }
}

export class AccountNotActiveError extends AuthorizationError {
  constructor(message = 'Account is not active', details = {}) {
    super(message, { code: 'ACCOUNT_NOT_ACTIVE', details });
    this.name = 'AccountNotActiveError';
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Email is already registered') {
    super(message, { code: 'EMAIL_ALREADY_REGISTERED' });
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class UsernameAlreadyTakenError extends ConflictError {
  constructor(message = 'Username is already taken') {
    super(message, { code: 'USERNAME_ALREADY_TAKEN' });
    this.name = 'UsernameAlreadyTakenError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message = 'Token is invalid or expired', details = {}) {
    super(message, { code: 'TOKEN_INVALID', details });
    this.name = 'InvalidTokenError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token has expired') {
    super(message, { code: 'TOKEN_EXPIRED' });
    this.name = 'TokenExpiredError';
  }
}

export class TwoFactorRequiredError extends AuthenticationError {
  constructor(message = 'Two-factor authentication required', details = {}) {
    super(message, { code: 'TWO_FACTOR_REQUIRED', details });
    this.name = 'TwoFactorRequiredError';
  }
}

export class InvalidTwoFactorCodeError extends AuthenticationError {
  constructor(message = 'Two-factor code is invalid') {
    super(message, { code: 'TWO_FACTOR_CODE_INVALID' });
    this.name = 'InvalidTwoFactorCodeError';
  }
}

export class TwoFactorAlreadyEnabledError extends ConflictError {
  constructor(message = 'Two-factor authentication is already enabled') {
    super(message, { code: 'TWO_FACTOR_ALREADY_ENABLED' });
    this.name = 'TwoFactorAlreadyEnabledError';
  }
}

export class TwoFactorNotEnabledError extends ConflictError {
  constructor(message = 'Two-factor authentication is not enabled') {
    super(message, { code: 'TWO_FACTOR_NOT_ENABLED' });
    this.name = 'TwoFactorNotEnabledError';
  }
}

export class InvalidOtpError extends ValidationError {
  constructor(message = 'OTP is invalid') {
    super(message, { code: 'OTP_INVALID' });
    this.name = 'InvalidOtpError';
  }
}

export class OtpExpiredError extends ValidationError {
  constructor(message = 'OTP has expired') {
    super(message, { code: 'OTP_EXPIRED' });
    this.name = 'OtpExpiredError';
  }
}

export class OtpAttemptsExceededError extends ValidationError {
  constructor(message = 'Too many incorrect OTP attempts') {
    super(message, { code: 'OTP_ATTEMPTS_EXCEEDED' });
    this.name = 'OtpAttemptsExceededError';
  }
}

export class EmailNotVerifiedError extends AuthenticationError {
  constructor(message = 'Email verification required') {
    super(message, { code: 'EMAIL_NOT_VERIFIED' });
    this.name = 'EmailNotVerifiedError';
  }
}

export class PhoneNotVerifiedError extends AuthenticationError {
  constructor(message = 'Phone verification required') {
    super(message, { code: 'PHONE_NOT_VERIFIED' });
    this.name = 'PhoneNotVerifiedError';
  }
}

export class SessionNotFoundError extends AuthenticationError {
  constructor(message = 'Session not found') {
    super(message, { code: 'SESSION_NOT_FOUND' });
    this.name = 'SessionNotFoundError';
  }
}

export class SessionRevokedError extends AuthenticationError {
  constructor(message = 'Session has been revoked') {
    super(message, { code: 'SESSION_REVOKED' });
    this.name = 'SessionRevokedError';
  }
}