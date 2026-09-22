/**
 * Validation Middleware
 *
 * Validates request body, query, and params using the provided
 * schema functions. The schema can be a Joi-like object or a custom
 * validation function that returns `{ valid, errors }`.
 *
 * @module signalforge/server/middleware/validation
 */

import { ValidationError } from '../lib/errors/validation-error.js';

export function validationMiddleware(schemas = {}) {
  const { body, query, params } = schemas;

  return function validate(req, res, next) {
    const errors = [];

    if (body && typeof body === 'function') {
      const result = body(req.body);
      if (result && result.valid === false) {
        errors.push(...(result.errors || []).map((e) => `body: ${e}`));
      }
    }

    if (query && typeof query === 'function') {
      const result = query(req.query);
      if (result && result.valid === false) {
        errors.push(...(result.errors || []).map((e) => `query: ${e}`));
      }
    }

    if (params && typeof params === 'function') {
      const result = params(req.params);
      if (result && result.valid === false) {
        errors.push(...(result.errors || []).map((e) => `params: ${e}`));
      }
    }

    if (errors.length > 0) {
      return next(
        new ValidationError('Validation failed', {
          code: 'VALIDATION_FAILED',
          details: { errors },
        }),
      );
    }

    return next();
  };
}

export default validationMiddleware;