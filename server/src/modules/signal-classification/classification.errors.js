/**
 * Signal Classification Errors
 *
 * @module signalforge/server/modules/signal-classification/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class ClassificationNotFoundError extends NotFoundError {
  constructor(message = 'Classification record not found', details = {}) {
    super(message, { code: 'CLASSIFICATION_NOT_FOUND', details });
    this.name = 'ClassificationNotFoundError';
  }
}
class ClassificationFailedError extends Error {
  constructor(message = 'Classification failed', details = {}) {
    super(message);
    this.name = 'ClassificationFailedError';
    this.code = 'CLASSIFICATION_FAILED';
    this.details = details;
  }
}
class ClassifierNotRegisteredError extends NotFoundError {
  constructor(message = 'Classifier is not registered', details = {}) {
    super(message, { code: 'CLASSIFIER_NOT_REGISTERED', details });
    this.name = 'ClassifierNotRegisteredError';
  }
}
class ClassificationTimeoutError extends Error {
  constructor(message = 'Classification timed out', details = {}) {
    super(message);
    this.name = 'ClassificationTimeoutError';
    this.code = 'CLASSIFICATION_TIMEOUT';
    this.details = details;
  }
}
class ClassificationInputError extends ValidationError {
  constructor(message = 'Classification input is invalid', details = {}) {
    super(message, { code: 'CLASSIFICATION_INPUT_INVALID', details });
    this.name = 'ClassificationInputError';
  }
}
class ClassificationAlreadyExistsError extends ConflictError {
  constructor(message = 'Classification already exists for this message') {
    super(message, { code: 'CLASSIFICATION_ALREADY_EXISTS' });
    this.name = 'ClassificationAlreadyExistsError';
  }
}
module.exports.ClassificationNotFoundError = ClassificationNotFoundError;
module.exports.ClassificationFailedError = ClassificationFailedError;
module.exports.ClassifierNotRegisteredError = ClassifierNotRegisteredError;
module.exports.ClassificationTimeoutError = ClassificationTimeoutError;
module.exports.ClassificationInputError = ClassificationInputError;
module.exports.ClassificationAlreadyExistsError = ClassificationAlreadyExistsError;
