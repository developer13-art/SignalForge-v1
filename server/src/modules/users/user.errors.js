/**
 * User Module Errors
 *
 * @module signalforge/server/modules/users/errors
 */

import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found', details = {}) {
    super(message, { code: 'USER_NOT_FOUND', details });
    this.name = 'UserNotFoundError';
  }
}

export class ProfileNotFoundError extends NotFoundError {
  constructor(message = 'Profile not found', details = {}) {
    super(message, { code: 'PROFILE_NOT_FOUND', details });
    this.name = 'ProfileNotFoundError';
  }
}

export class UsernameAlreadyTakenError extends ConflictError {
  constructor(message = 'Username is already taken') {
    super(message, { code: 'USERNAME_ALREADY_TAKEN' });
    this.name = 'UsernameAlreadyTakenError';
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Email is already registered') {
    super(message, { code: 'EMAIL_ALREADY_REGISTERED' });
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class PhoneAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Phone number is already registered') {
    super(message, { code: 'PHONE_ALREADY_REGISTERED' });
    this.name = 'PhoneAlreadyRegisteredError';
  }
}

export class InvalidAvatarError extends ValidationError {
  constructor(message = 'Avatar file is invalid', details = {}) {
    super(message, { code: 'INVALID_AVATAR', details });
    this.name = 'InvalidAvatarError';
  }
}

export class AvatarTooLargeError extends ValidationError {
  constructor(message = 'Avatar file is too large', details = {}) {
    super(message, { code: 'AVATAR_TOO_LARGE', details });
    this.name = 'AvatarTooLargeError';
  }
}

export class CannotDeleteOwnAccountError extends AuthorizationError {
  constructor(message = 'Cannot delete your own account through this endpoint') {
    super(message, { code: 'CANNOT_DELETE_OWN_ACCOUNT' });
    this.name = 'CannotDeleteOwnAccountError';
  }
}

export class AccountAlreadyDeactivatedError extends ConflictError {
  constructor(message = 'Account is already deactivated') {
    super(message, { code: 'ACCOUNT_ALREADY_DEACTIVATED' });
    this.name = 'AccountAlreadyDeactivatedError';
  }
}

export class AccountNotDeactivatedError extends ConflictError {
  constructor(message = 'Account is not deactivated') {
    super(message, { code: 'ACCOUNT_NOT_DEACTIVATED' });
    this.name = 'AccountNotDeactivatedError';
  }
}