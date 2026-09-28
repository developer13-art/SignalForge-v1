/**
 * Joi To Error
 *
 * Converts a Joi validation error into an AppError with a normalized
 * shape for the HTTP error middleware.
 *
 * @module server/lib/validators/joi-to-error
 */
const { ValidationError } = require('../errors/validation-error');
function joiToError(error) {
  if (!error || !error.details) {
    return new ValidationError('Validation failed');
  }

  const details = error.details.map((d) => ({
    path: d.path.join('.'),
    message: d.message,
    type: d.type,
  }));

  return new ValidationError('Validation failed', details);
}
module.exports = joiToError;
module.exports.joiToError = joiToError;
