/**
 * Signal Classification Errors
 *
 * @module signalforge/server/modules/signal-classification/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class ClassificationNotFoundError extends NotFoundError {
  constructor(message = 'Classification record not found', details = {}) {
    super(message, { code: 'CLASSIFICATION_NOT_FOUND', details });
    this.name = 'ClassificationNotFoundError';
  }
}

export class ClassificationFailedError extends Error {
  constructor(message = 'Classification failed', details = {}) {
    super(message);
    this.name = 'ClassificationFailedError';
    this.code = 'CLASSIFICATION_FAILED';
    this.details = details;
  }
}

export class ClassifierNotRegisteredError extends NotFoundError {
  constructor(message = 'Classifier is not registered', details = {}) {
    super(message, { code: 'CLASSIFIER_NOT_REGISTERED', details });
    this.name = 'ClassifierNotRegisteredError';
  }
}

export class ClassificationTimeoutError extends Error {
  constructor(message = 'Classification timed out', details = {}) {
    super(message);
    this.name = 'ClassificationTimeoutError';
    this.code = 'CLASSIFICATION_TIMEOUT';
    this.details = details;
  }
}

export class ClassificationInputError extends ValidationError {
  constructor(message = 'Classification input is invalid', details = {}) {
    super(message, { code: 'CLASSIFICATION_INPUT_INVALID', details });
    this.name = 'ClassificationInputError';
  }
}

export class ClassificationAlreadyExistsError extends ConflictError {
  constructor(message = 'Classification already exists for this message') {
    super(message, { code: 'CLASSIFICATION_ALREADY_EXISTS' });
    this.name = 'ClassificationAlreadyExistsError';
  }
}