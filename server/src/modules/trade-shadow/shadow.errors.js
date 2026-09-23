/**
 * Trade Shadow Module Errors
 *
 * @module signalforge/server/modules/trade-shadow/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class ShadowNotFoundError extends NotFoundError {
  constructor(message = 'Trade shadow not found', details = {}) {
    super(message, { code: 'SHADOW_NOT_FOUND', details });
    this.name = 'ShadowNotFoundError';
  }
}

export class ShadowAlreadyExistsError extends ConflictError {
  constructor(message = 'Trade shadow already exists for this trade pair') {
    super(message, { code: 'SHADOW_ALREADY_EXISTS' });
    this.name = 'ShadowAlreadyExistsError';
  }
}

export class ShadowComparisonError extends Error {
  constructor(message = 'Trade shadow comparison failed', details = {}) {
    super(message);
    this.name = 'ShadowComparisonError';
    this.code = 'SHADOW_COMPARISON_FAILED';
    this.details = details;
  }
}

export class ShadowInvalidError extends ValidationError {
  constructor(message = 'Trade shadow is invalid', details = {}) {
    super(message, { code: 'SHADOW_INVALID', details });
    this.name = 'ShadowInvalidError';
  }
}

export class ShadowDivergenceError extends Error {
  constructor(message = 'Divergence analysis failed', details = {}) {
    super(message);
    this.name = 'ShadowDivergenceError';
    this.code = 'SHADOW_DIVERGENCE_FAILED';
    this.details = details;
  }
}