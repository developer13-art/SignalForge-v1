/**
 * Signal Collection Errors
 *
 * @module signalforge/server/modules/signal-collection/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class CollectionItemNotFoundError extends NotFoundError {
  constructor(message = 'Collection item not found', details = {}) {
    super(message, { code: 'COLLECTION_ITEM_NOT_FOUND', details });
    this.name = 'CollectionItemNotFoundError';
  }
}

export class CollectionItemAlreadyProcessingError extends ConflictError {
  constructor(message = 'Collection item is already processing') {
    super(message, { code: 'COLLECTION_ITEM_ALREADY_PROCESSING' });
    this.name = 'CollectionItemAlreadyProcessingError';
  }
}

export class CollectionQueueFullError extends ConflictError {
  constructor(message = 'Collection queue is at capacity') {
    super(message, { code: 'COLLECTION_QUEUE_FULL' });
    this.name = 'CollectionQueueFullError';
  }
}

export class CollectionItemInvalidError extends ValidationError {
  constructor(message = 'Collection item is invalid', details = {}) {
    super(message, { code: 'COLLECTION_ITEM_INVALID', details });
    this.name = 'CollectionItemInvalidError';
  }
}

export class CollectionDispatcherError extends Error {
  constructor(message = 'Collection dispatcher failed', details = {}) {
    super(message);
    this.name = 'CollectionDispatcherError';
    this.code = 'COLLECTION_DISPATCHER_ERROR';
    this.details = details;
  }
}