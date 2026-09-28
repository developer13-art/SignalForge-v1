/**
 * Signal Sources Errors
 *
 * @module signalforge/server/modules/signal-sources/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class SourceNotFoundError extends NotFoundError {
  constructor(message = 'Signal source not found', details = {}) {
    super(message, { code: 'SOURCE_NOT_FOUND', details });
    this.name = 'SourceNotFoundError';
  }
}

export class SourceAlreadyExistsError extends ConflictError {
  constructor(message = 'Signal source already exists') {
    super(message, { code: 'SOURCE_ALREADY_EXISTS' });
    this.name = 'SourceAlreadyExistsError';
  }
}

export class SourceNotOwnedError extends AuthorizationError {
  constructor(message = 'Signal source does not belong to this user') {
    super(message, { code: 'SOURCE_NOT_OWNED' });
    this.name = 'SourceNotOwnedError';
  }
}

export class SourceConnectionError extends Error {
  constructor(message = 'Failed to connect to signal source', details = {}) {
    super(message);
    this.name = 'SourceConnectionError';
    this.code = 'SOURCE_CONNECTION_ERROR';
    this.details = details;
  }
}

export class SourceDisconnectedError extends Error {
  constructor(message = 'Signal source is disconnected') {
    super(message);
    this.name = 'SourceDisconnectedError';
    this.code = 'SOURCE_DISCONNECTED';
  }
}

export class SourceNotConfiguredError extends Error {
  constructor(message = 'Signal source is not configured', details = {}) {
    super(message);
    this.name = 'SourceNotConfiguredError';
    this.code = 'SOURCE_NOT_CONFIGURED';
    this.details = details;
  }
}

export class MessageNotFoundError extends NotFoundError {
  constructor(message = 'Message not found', details = {}) {
    super(message, { code: 'MESSAGE_NOT_FOUND', details });
    this.name = 'MessageNotFoundError';
  }
}

export class MessageInvalidFormatError extends ValidationError {
  constructor(message = 'Message format is invalid', details = {}) {
    super(message, { code: 'MESSAGE_INVALID_FORMAT', details });
    this.name = 'MessageInvalidFormatError';
  }
}

export class ChannelNotOptedInError extends ValidationError {
  constructor(message = 'Channel is not opted in') {
    super(message, { code: 'CHANNEL_NOT_OPTED_IN' });
    this.name = 'ChannelNotOptedInError';
  }
}

export class ChannelAlreadyOptedInError extends ConflictError {
  constructor(message = 'Channel is already opted in') {
    super(message, { code: 'CHANNEL_ALREADY_OPTED_IN' });
    this.name = 'ChannelAlreadyOptedInError';
  }
}

export class UnsupportedSourceTypeError extends ValidationError {
  constructor(message = 'Unsupported source type', details = {}) {
    super(message, { code: 'UNSUPPORTED_SOURCE_TYPE', details });
    this.name = 'UnsupportedSourceTypeError';
  }
}