/**
 * Traders Module Errors
 *
 * @module signalforge/server/modules/traders/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class TraderNotFoundError extends NotFoundError {
  constructor(message = 'Trader not found', details = {}) {
    super(message, { code: 'TRADER_NOT_FOUND', details });
    this.name = 'TraderNotFoundError';
  }
}

export class TraderProfileNotFoundError extends NotFoundError {
  constructor(message = 'Trader profile not found', details = {}) {
    super(message, { code: 'TRADER_PROFILE_NOT_FOUND', details });
    this.name = 'TraderProfileNotFoundError';
  }
}

export class TraderAlreadyRegisteredError extends ConflictError {
  constructor(message = 'Trader is already registered for this user') {
    super(message, { code: 'TRADER_ALREADY_REGISTERED' });
    this.name = 'TraderAlreadyRegisteredError';
  }
}

export class TraderNotActiveError extends AuthorizationError {
  constructor(message = 'Trader is not active', details = {}) {
    super(message, { code: 'TRADER_NOT_ACTIVE', details });
    this.name = 'TraderNotActiveError';
  }
}

export class TraderNotOwnedError extends AuthorizationError {
  constructor(message = 'Trader does not belong to this user') {
    super(message, { code: 'TRADER_NOT_OWNED' });
    this.name = 'TraderNotOwnedError';
  }
}

export class FollowerNotFoundError extends NotFoundError {
  constructor(message = 'Follower relationship not found', details = {}) {
    super(message, { code: 'FOLLOWER_NOT_FOUND', details });
    this.name = 'FollowerNotFoundError';
  }
}

export class FollowerAlreadyExistsError extends ConflictError {
  constructor(message = 'User is already following this trader') {
    super(message, { code: 'FOLLOWER_ALREADY_EXISTS' });
    this.name = 'FollowerAlreadyExistsError';
  }
}

export class CannotFollowSelfError extends ValidationError {
  constructor(message = 'Users cannot follow themselves') {
    super(message, { code: 'CANNOT_FOLLOW_SELF' });
    this.name = 'CannotFollowSelfError';
  }
}

export class CopySettingsNotFoundError extends NotFoundError {
  constructor(message = 'Copy settings not found', details = {}) {
    super(message, { code: 'COPY_SETTINGS_NOT_FOUND', details });
    this.name = 'CopySettingsNotFoundError';
  }
}

export class InvalidCopySettingsError extends ValidationError {
  constructor(message = 'Copy settings are invalid', details = {}) {
    super(message, { code: 'INVALID_COPY_SETTINGS', details });
    this.name = 'InvalidCopySettingsError';
  }
}

export class LeaderboardError extends Error {
  constructor(message = 'Leaderboard operation failed', details = {}) {
    super(message);
    this.name = 'LeaderboardError';
    this.code = 'LEADERBOARD_ERROR';
    this.details = details;
  }
}

export class InvalidTraderPayloadError extends ValidationError {
  constructor(message = 'Trader payload is invalid', details = {}) {
    super(message, { code: 'INVALID_TRADER_PAYLOAD', details });
    this.name = 'InvalidTraderPayloadError';
  }
}