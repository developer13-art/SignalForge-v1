/**
 * Auth Module Errors
 *
 * @module signalforge/server/modules/auth/errors
 */
const { AuthenticationError } = require('../../lib/errors/authentication-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Invalid email or password') {
    super(message, { code: 'INVALID_CREDENTIALS' });
    this.name = 'InvalidCredentialsError';
  }
}
class AccountLockedError extends AuthenticationError {
  constructor(message = 'Account is temporarily locked due to too many failed login attempts', details = {}) {
    super(message, { code: 'ACCOUNT_LOCKED', details });
    this.name = 'AccountLockedError';
  }
}
class AccountNotActiveError extends AuthorizationError {
  constructor(message = 'Account is not active', details = {}) {
    super(message, { code: 'ACCOUNT_NOT_ACTIVE', details });
    this.name = 'AccountNotActiveError';
  }
}
class EmailAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Email is already registered') {
    super(message, { code: 'EMAIL_ALREADY_REGISTERED' });
    this.name = 'EmailAlreadyRegisteredError';
  }
}
class UsernameAlreadyTakenError extends ConflictError {
  constructor(message = 'Username is already taken') {
    super(message, { code: 'USERNAME_ALREADY_TAKEN' });
    this.name = 'UsernameAlreadyTakenError';
  }
}
class InvalidTokenError extends AuthenticationError {
  constructor(message = 'Token is invalid or expired', details = {}) {
    super(message, { code: 'TOKEN_INVALID', details });
    this.name = 'InvalidTokenError';
  }
}
class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token has expired') {
    super(message, { code: 'TOKEN_EXPIRED' });
    this.name = 'TokenExpiredError';
  }
}
class TwoFactorRequiredError extends AuthenticationError {
  constructor(message = 'Two-factor authentication required', details = {}) {
    super(message, { code: 'TWO_FACTOR_REQUIRED', details });
    this.name = 'TwoFactorRequiredError';
  }
}
class InvalidTwoFactorCodeError extends AuthenticationError {
  constructor(message = 'Two-factor code is invalid') {
    super(message, { code: 'TWO_FACTOR_CODE_INVALID' });
    this.name = 'InvalidTwoFactorCodeError';
  }
}
class TwoFactorAlreadyEnabledError extends ConflictError {
  constructor(message = 'Two-factor authentication is already enabled') {
    super(message, { code: 'TWO_FACTOR_ALREADY_ENABLED' });
    this.name = 'TwoFactorAlreadyEnabledError';
  }
}
class TwoFactorNotEnabledError extends ConflictError {
  constructor(message = 'Two-factor authentication is not enabled') {
    super(message, { code: 'TWO_FACTOR_NOT_ENABLED' });
    this.name = 'TwoFactorNotEnabledError';
  }
}
class InvalidOtpError extends ValidationError {
  constructor(message = 'OTP is invalid') {
    super(message, { code: 'OTP_INVALID' });
    this.name = 'InvalidOtpError';
  }
}
class OtpExpiredError extends ValidationError {
  constructor(message = 'OTP has expired') {
    super(message, { code: 'OTP_EXPIRED' });
    this.name = 'OtpExpiredError';
  }
}
class OtpAttemptsExceededError extends ValidationError {
  constructor(message = 'Too many incorrect OTP attempts') {
    super(message, { code: 'OTP_ATTEMPTS_EXCEEDED' });
    this.name = 'OtpAttemptsExceededError';
  }
}
class EmailNotVerifiedError extends AuthenticationError {
  constructor(message = 'Email verification required') {
    super(message, { code: 'EMAIL_NOT_VERIFIED' });
    this.name = 'EmailNotVerifiedError';
  }
}
class PhoneNotVerifiedError extends AuthenticationError {
  constructor(message = 'Phone verification required') {
    super(message, { code: 'PHONE_NOT_VERIFIED' });
    this.name = 'PhoneNotVerifiedError';
  }
}
class SessionNotFoundError extends AuthenticationError {
  constructor(message = 'Session not found') {
    super(message, { code: 'SESSION_NOT_FOUND' });
    this.name = 'SessionNotFoundError';
  }
}
class SessionRevokedError extends AuthenticationError {
  constructor(message = 'Session has been revoked') {
    super(message, { code: 'SESSION_REVOKED' });
    this.name = 'SessionRevokedError';
  }
}
module.exports.InvalidCredentialsError = InvalidCredentialsError;
module.exports.AccountLockedError = AccountLockedError;
module.exports.AccountNotActiveError = AccountNotActiveError;
module.exports.EmailAlreadyRegisteredError = EmailAlreadyRegisteredError;
module.exports.UsernameAlreadyTakenError = UsernameAlreadyTakenError;
module.exports.InvalidTokenError = InvalidTokenError;
module.exports.TokenExpiredError = TokenExpiredError;
module.exports.TwoFactorRequiredError = TwoFactorRequiredError;
module.exports.InvalidTwoFactorCodeError = InvalidTwoFactorCodeError;
module.exports.TwoFactorAlreadyEnabledError = TwoFactorAlreadyEnabledError;
module.exports.TwoFactorNotEnabledError = TwoFactorNotEnabledError;
module.exports.InvalidOtpError = InvalidOtpError;
module.exports.OtpExpiredError = OtpExpiredError;
module.exports.OtpAttemptsExceededError = OtpAttemptsExceededError;
module.exports.EmailNotVerifiedError = EmailNotVerifiedError;
module.exports.PhoneNotVerifiedError = PhoneNotVerifiedError;
module.exports.SessionNotFoundError = SessionNotFoundError;
module.exports.SessionRevokedError = SessionRevokedError;
