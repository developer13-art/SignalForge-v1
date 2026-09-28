/**
 * Signal Collection Errors
 *
 * @module signalforge/server/modules/signal-collection/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
class CollectionItemNotFoundError extends NotFoundError {
  constructor(message = 'Collection item not found', details = {}) {
    super(message, { code: 'COLLECTION_ITEM_NOT_FOUND', details });
    this.name = 'CollectionItemNotFoundError';
  }
}
class CollectionItemAlreadyProcessingError extends ConflictError {
  constructor(message = 'Collection item is already processing') {
    super(message, { code: 'COLLECTION_ITEM_ALREADY_PROCESSING' });
    this.name = 'CollectionItemAlreadyProcessingError';
  }
}
class CollectionQueueFullError extends ConflictError {
  constructor(message = 'Collection queue is at capacity') {
    super(message, { code: 'COLLECTION_QUEUE_FULL' });
    this.name = 'CollectionQueueFullError';
  }
}
class CollectionItemInvalidError extends ValidationError {
  constructor(message = 'Collection item is invalid', details = {}) {
    super(message, { code: 'COLLECTION_ITEM_INVALID', details });
    this.name = 'CollectionItemInvalidError';
  }
}
class CollectionDispatcherError extends Error {
  constructor(message = 'Collection dispatcher failed', details = {}) {
    super(message);
    this.name = 'CollectionDispatcherError';
    this.code = 'COLLECTION_DISPATCHER_ERROR';
    this.details = details;
  }
}
module.exports.CollectionItemNotFoundError = CollectionItemNotFoundError;
module.exports.CollectionItemAlreadyProcessingError = CollectionItemAlreadyProcessingError;
module.exports.CollectionQueueFullError = CollectionQueueFullError;
module.exports.CollectionItemInvalidError = CollectionItemInvalidError;
module.exports.CollectionDispatcherError = CollectionDispatcherError;
