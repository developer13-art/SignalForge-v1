/**
 * User Module Errors
 *
 * @module signalforge/server/modules/users/errors
 */
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found', details = {}) {
    super(message, { code: 'USER_NOT_FOUND', details });
    this.name = 'UserNotFoundError';
  }
}
class ProfileNotFoundError extends NotFoundError {
  constructor(message = 'Profile not found', details = {}) {
    super(message, { code: 'PROFILE_NOT_FOUND', details });
    this.name = 'ProfileNotFoundError';
  }
}
class UsernameAlreadyTakenError extends ConflictError {
  constructor(message = 'Username is already taken') {
    super(message, { code: 'USERNAME_ALREADY_TAKEN' });
    this.name = 'UsernameAlreadyTakenError';
  }
}
class EmailAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Email is already registered') {
    super(message, { code: 'EMAIL_ALREADY_REGISTERED' });
    this.name = 'EmailAlreadyRegisteredError';
  }
}
class PhoneAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Phone number is already registered') {
    super(message, { code: 'PHONE_ALREADY_REGISTERED' });
    this.name = 'PhoneAlreadyRegisteredError';
  }
}
class InvalidAvatarError extends ValidationError {
  constructor(message = 'Avatar file is invalid', details = {}) {
    super(message, { code: 'INVALID_AVATAR', details });
    this.name = 'InvalidAvatarError';
  }
}
class AvatarTooLargeError extends ValidationError {
  constructor(message = 'Avatar file is too large', details = {}) {
    super(message, { code: 'AVATAR_TOO_LARGE', details });
    this.name = 'AvatarTooLargeError';
  }
}
class CannotDeleteOwnAccountError extends AuthorizationError {
  constructor(message = 'Cannot delete your own account through this endpoint') {
    super(message, { code: 'CANNOT_DELETE_OWN_ACCOUNT' });
    this.name = 'CannotDeleteOwnAccountError';
  }
}
class AccountAlreadyDeactivatedError extends ConflictError {
  constructor(message = 'Account is already deactivated') {
    super(message, { code: 'ACCOUNT_ALREADY_DEACTIVATED' });
    this.name = 'AccountAlreadyDeactivatedError';
  }
}
class AccountNotDeactivatedError extends ConflictError {
  constructor(message = 'Account is not deactivated') {
    super(message, { code: 'ACCOUNT_NOT_DEACTIVATED' });
    this.name = 'AccountNotDeactivatedError';
  }
}
module.exports.UserNotFoundError = UserNotFoundError;
module.exports.ProfileNotFoundError = ProfileNotFoundError;
module.exports.UsernameAlreadyTakenError = UsernameAlreadyTakenError;
module.exports.EmailAlreadyRegisteredError = EmailAlreadyRegisteredError;
module.exports.PhoneAlreadyRegisteredError = PhoneAlreadyRegisteredError;
module.exports.InvalidAvatarError = InvalidAvatarError;
module.exports.AvatarTooLargeError = AvatarTooLargeError;
module.exports.CannotDeleteOwnAccountError = CannotDeleteOwnAccountError;
module.exports.AccountAlreadyDeactivatedError = AccountAlreadyDeactivatedError;
module.exports.AccountNotDeactivatedError = AccountNotDeactivatedError;
