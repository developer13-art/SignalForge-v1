/**
 * Schema Runner
 *
 * Executes a set of named validators against a payload and returns
 * the merged validated output, throwing a ValidationError if any fail.
 *
 * @module server/lib/validators/schema-runner
 */

import { ValidationError } from '../errors/validation-error';

export function runSchemas({ validators, payload }) {
  if (!validators || typeof validators !== 'object') {
    throw new Error('validators object is required');
  }

  const errors = [];
  const output = {};

  for (const [field, validator] of Object.entries(validators)) {
    if (typeof validator !== 'function') {
      continue;
    }

    try {
      output[field] = validator(payload[field]);
    } catch (err) {
      if (err instanceof ValidationError) {
        errors.push(...err.details.map((d) => ({ ...d, field })));
      } else {
        errors.push({ field, message: err.message });
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return output;
}

export default runSchemas;