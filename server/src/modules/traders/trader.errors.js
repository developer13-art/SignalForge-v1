/**
 * Traders Module Errors
 *
 * @module signalforge/server/modules/traders/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class TraderNotFoundError extends NotFoundError {
  constructor(message = 'Trader not found', details = {}) {
    super(message, { code: 'TRADER_NOT_FOUND', details });
    this.name = 'TraderNotFoundError';
  }
}
class TraderProfileNotFoundError extends NotFoundError {
  constructor(message = 'Trader profile not found', details = {}) {
    super(message, { code: 'TRADER_PROFILE_NOT_FOUND', details });
    this.name = 'TraderProfileNotFoundError';
  }
}
class TraderAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Trader is already registered for this user') {
    super(message, { code: 'TRADER_ALREADY_REGISTERED' });
    this.name = 'TraderAlreadyRegisteredError';
  }
}
class TraderNotActiveError extends AuthorizationError {
  constructor(message = 'Trader is not active', details = {}) {
    super(message, { code: 'TRADER_NOT_ACTIVE', details });
    this.name = 'TraderNotActiveError';
  }
}
class TraderNotOwnedError extends AuthorizationError {
  constructor(message = 'Trader does not belong to this user') {
    super(message, { code: 'TRADER_NOT_OWNED' });
    this.name = 'TraderNotOwnedError';
  }
}
class FollowerNotFoundError extends NotFoundError {
  constructor(message = 'Follower relationship not found', details = {}) {
    super(message, { code: 'FOLLOWER_NOT_FOUND', details });
    this.name = 'FollowerNotFoundError';
  }
}
class FollowerAlreadyExistsError extends ConflictError {
  constructor(message = 'User is already following this trader') {
    super(message, { code: 'FOLLOWER_ALREADY_EXISTS' });
    this.name = 'FollowerAlreadyExistsError';
  }
}
class CannotFollowSelfError extends ValidationError {
  constructor(message = 'Users cannot follow themselves') {
    super(message, { code: 'CANNOT_FOLLOW_SELF' });
    this.name = 'CannotFollowSelfError';
  }
}
class CopySettingsNotFoundError extends NotFoundError {
  constructor(message = 'Copy settings not found', details = {}) {
    super(message, { code: 'COPY_SETTINGS_NOT_FOUND', details });
    this.name = 'CopySettingsNotFoundError';
  }
}
class InvalidCopySettingsError extends ValidationError {
  constructor(message = 'Copy settings are invalid', details = {}) {
    super(message, { code: 'INVALID_COPY_SETTINGS', details });
    this.name = 'InvalidCopySettingsError';
  }
}
class LeaderboardError extends Error {
  constructor(message = 'Leaderboard operation failed', details = {}) {
    super(message);
    this.name = 'LeaderboardError';
    this.code = 'LEADERBOARD_ERROR';
    this.details = details;
  }
}
class InvalidTraderPayloadError extends ValidationError {
  constructor(message = 'Trader payload is invalid', details = {}) {
    super(message, { code: 'INVALID_TRADER_PAYLOAD', details });
    this.name = 'InvalidTraderPayloadError';
  }
}
module.exports.TraderNotFoundError = TraderNotFoundError;
module.exports.TraderProfileNotFoundError = TraderProfileNotFoundError;
module.exports.TraderAlreadyRegisteredError = TraderAlreadyRegisteredError;
module.exports.TraderNotActiveError = TraderNotActiveError;
module.exports.TraderNotOwnedError = TraderNotOwnedError;
module.exports.FollowerNotFoundError = FollowerNotFoundError;
module.exports.FollowerAlreadyExistsError = FollowerAlreadyExistsError;
module.exports.CannotFollowSelfError = CannotFollowSelfError;
module.exports.CopySettingsNotFoundError = CopySettingsNotFoundError;
module.exports.InvalidCopySettingsError = InvalidCopySettingsError;
module.exports.LeaderboardError = LeaderboardError;
module.exports.InvalidTraderPayloadError = InvalidTraderPayloadError;
