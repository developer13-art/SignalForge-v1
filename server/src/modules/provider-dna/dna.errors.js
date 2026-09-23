/**
 * Provider DNA Errors
 *
 * @module signalforge/server/modules/provider-dna/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class DnaNotFoundError extends NotFoundError {
  constructor(message = 'Provider DNA not found', details = {}) {
    super(message, { code: 'DNA_NOT_FOUND', details });
    this.name = 'DnaNotFoundError';
  }
}

export class DnaRuleNotFoundError extends NotFoundError {
  constructor(message = 'Provider DNA rule not found', details = {}) {
    super(message, { code: 'DNA_RULE_NOT_FOUND', details });
    this.name = 'DnaRuleNotFoundError';
  }
}

export class DnaRuleAlreadyExistsError extends ConflictError {
  constructor(message = 'Provider DNA rule already exists') {
    super(message, { code: 'DNA_RULE_ALREADY_EXISTS' });
    this.name = 'DnaRuleAlreadyExistsError';
  }
}

export class DnaVersionNotFoundError extends NotFoundError {
  constructor(message = 'Provider DNA version not found', details = {}) {
    super(message, { code: 'DNA_VERSION_NOT_FOUND', details });
    this.name = 'DnaVersionNotFoundError';
  }
}

export class DnaLearningFailedError extends Error {
  constructor(message = 'Provider DNA learning failed', details = {}) {
    super(message);
    this.name = 'DnaLearningFailedError';
    this.code = 'DNA_LEARNING_FAILED';
    this.details = details;
  }
}

export class DnaRuleInvalidError extends ValidationError {
  constructor(message = 'Provider DNA rule is invalid', details = {}) {
    super(message, { code: 'DNA_RULE_INVALID', details });
    this.name = 'DnaRuleInvalidError';
  }
}

export class DnaInsufficientHistoryError extends ValidationError {
  constructor(message = 'Insufficient historical messages to build DNA', details = {}) {
    super(message, { code: 'DNA_INSUFFICIENT_HISTORY', details });
    this.name = 'DnaInsufficientHistoryError';
  }
}

export class DnaProfileNotFoundError extends NotFoundError {
  constructor(message = 'Provider DNA profile not found', details = {}) {
    super(message, { code: 'DNA_PROFILE_NOT_FOUND', details });
    this.name = 'DnaProfileNotFoundError';
  }
}