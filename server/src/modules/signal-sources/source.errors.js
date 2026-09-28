/**
 * Signal Sources Errors
 *
 * @module signalforge/server/modules/signal-sources/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class SourceNotFoundError extends NotFoundError {
  constructor(message = 'Signal source not found', details = {}) {
    super(message, { code: 'SOURCE_NOT_FOUND', details });
    this.name = 'SourceNotFoundError';
  }
}
class SourceAlreadyExistsError extends ConflictError {
  constructor(message = 'Signal source already exists') {
    super(message, { code: 'SOURCE_ALREADY_EXISTS' });
    this.name = 'SourceAlreadyExistsError';
  }
}
class SourceNotOwnedError extends AuthorizationError {
  constructor(message = 'Signal source does not belong to this user') {
    super(message, { code: 'SOURCE_NOT_OWNED' });
    this.name = 'SourceNotOwnedError';
  }
}
class SourceConnectionError extends Error {
  constructor(message = 'Failed to connect to signal source', details = {}) {
    super(message);
    this.name = 'SourceConnectionError';
    this.code = 'SOURCE_CONNECTION_ERROR';
    this.details = details;
  }
}
class SourceDisconnectedError extends Error {
  constructor(message = 'Signal source is disconnected') {
    super(message);
    this.name = 'SourceDisconnectedError';
    this.code = 'SOURCE_DISCONNECTED';
  }
}
class SourceNotConfiguredError extends Error {
  constructor(message = 'Signal source is not configured', details = {}) {
    super(message);
    this.name = 'SourceNotConfiguredError';
    this.code = 'SOURCE_NOT_CONFIGURED';
    this.details = details;
  }
}
class MessageNotFoundError extends NotFoundError {
  constructor(message = 'Message not found', details = {}) {
    super(message, { code: 'MESSAGE_NOT_FOUND', details });
    this.name = 'MessageNotFoundError';
  }
}
class MessageInvalidFormatError extends ValidationError {
  constructor(message = 'Message format is invalid', details = {}) {
    super(message, { code: 'MESSAGE_INVALID_FORMAT', details });
    this.name = 'MessageInvalidFormatError';
  }
}
class ChannelNotOptedInError extends ValidationError {
  constructor(message = 'Channel is not opted in') {
    super(message, { code: 'CHANNEL_NOT_OPTED_IN' });
    this.name = 'ChannelNotOptedInError';
  }
}
class ChannelAlreadyOptedInError extends ConflictError {
  constructor(message = 'Channel is already opted in') {
    super(message, { code: 'CHANNEL_ALREADY_OPTED_IN' });
    this.name = 'ChannelAlreadyOptedInError';
  }
}
class UnsupportedSourceTypeError extends ValidationError {
  constructor(message = 'Unsupported source type', details = {}) {
    super(message, { code: 'UNSUPPORTED_SOURCE_TYPE', details });
    this.name = 'UnsupportedSourceTypeError';
  }
}
module.exports.SourceNotFoundError = SourceNotFoundError;
module.exports.SourceAlreadyExistsError = SourceAlreadyExistsError;
module.exports.SourceNotOwnedError = SourceNotOwnedError;
module.exports.SourceConnectionError = SourceConnectionError;
module.exports.SourceDisconnectedError = SourceDisconnectedError;
module.exports.SourceNotConfiguredError = SourceNotConfiguredError;
module.exports.MessageNotFoundError = MessageNotFoundError;
module.exports.MessageInvalidFormatError = MessageInvalidFormatError;
module.exports.ChannelNotOptedInError = ChannelNotOptedInError;
module.exports.ChannelAlreadyOptedInError = ChannelAlreadyOptedInError;
module.exports.UnsupportedSourceTypeError = UnsupportedSourceTypeError;
