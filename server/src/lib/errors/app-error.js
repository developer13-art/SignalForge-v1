/**
 * App Error
 *
 * Base class for all application errors. Subclasses provide specific
 * codes and default HTTP statuses. The error middleware uses these
 * fields to produce consistent API responses.
 *
 * @module server/lib/errors/app-error
 */

export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export default AppError;