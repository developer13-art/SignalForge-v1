/**
 * Validator Factory
 *
 * Thin wrapper around Joi (or another schema library) that produces a
 * reusable validator with a consistent error shape.
 *
 * @module server/lib/validators/validator.factory
 */
const { ValidationError } = require('../errors/validation-error');
function createValidator({ schema, options = {} }) {
  if (!schema || typeof schema.validate !== 'function') {
    throw new Error('schema with a validate method is required');
  }

  return function validate(input) {
    const { error, value } = schema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
      ...options,
    });

    if (error) {
      const details = error.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message,
        type: d.type,
      }));

      throw new ValidationError('Validation failed', details);
    }

    return value;
  };
}
module.exports = createValidator;
module.exports.createValidator = createValidator;
