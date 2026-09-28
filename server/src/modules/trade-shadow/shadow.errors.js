/**
 * Trade Shadow Module Errors
 *
 * @module signalforge/server/modules/trade-shadow/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class ShadowNotFoundError extends NotFoundError {
  constructor(message = 'Trade shadow not found', details = {}) {
    super(message, { code: 'SHADOW_NOT_FOUND', details });
    this.name = 'ShadowNotFoundError';
  }
}
class ShadowAlreadyExistsError extends ConflictError {
  constructor(message = 'Trade shadow already exists for this trade pair') {
    super(message, { code: 'SHADOW_ALREADY_EXISTS' });
    this.name = 'ShadowAlreadyExistsError';
  }
}
class ShadowComparisonError extends Error {
  constructor(message = 'Trade shadow comparison failed', details = {}) {
    super(message);
    this.name = 'ShadowComparisonError';
    this.code = 'SHADOW_COMPARISON_FAILED';
    this.details = details;
  }
}
class ShadowInvalidError extends ValidationError {
  constructor(message = 'Trade shadow is invalid', details = {}) {
    super(message, { code: 'SHADOW_INVALID', details });
    this.name = 'ShadowInvalidError';
  }
}
class ShadowDivergenceError extends Error {
  constructor(message = 'Divergence analysis failed', details = {}) {
    super(message);
    this.name = 'ShadowDivergenceError';
    this.code = 'SHADOW_DIVERGENCE_FAILED';
    this.details = details;
  }
}
module.exports.ShadowNotFoundError = ShadowNotFoundError;
module.exports.ShadowAlreadyExistsError = ShadowAlreadyExistsError;
module.exports.ShadowComparisonError = ShadowComparisonError;
module.exports.ShadowInvalidError = ShadowInvalidError;
module.exports.ShadowDivergenceError = ShadowDivergenceError;
