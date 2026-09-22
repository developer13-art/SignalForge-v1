/**
 * Error Handler Middleware
 *
 * Centralized error handler. Formats errors consistently for API
 * responses, logs them at the appropriate level, and hides internal
 * details in production.
 *
 * @module signalforge/server/middleware/error-handler
 */

import appConfig from '../config/app.config.js';
import { getLogger } from '../bootstrap/initLogger.js';
import { AppError } from '../lib/errors/app-error.js';

const STATUS_MAP = {
  VALIDATION_FAILED: 400,
  AUTH_TOKEN_MISSING: 401,
  AUTH_TOKEN_INVALID: 401,
  AUTH_TOKEN_EXPIRED: 401,
  AUTH_REQUIRED: 401,
  INVALID_CREDENTIALS: 401,
  SIGNATURE_MISSING: 401,
  SIGNATURE_INVALID: 401,
  WEBHOOK_SIGNATURE_INVALID: 401,
  WEBHOOK_VERIFICATION_FAILED: 401,
  PERMISSION_DENIED: 403,
  ROLE_DENIED: 403,
  ADMIN_ROLE_REQUIRED: 403,
  COMPLIANCE_ROLE_REQUIRED: 403,
  PROVIDER_ROLE_REQUIRED: 403,
  TRADER_ROLE_REQUIRED: 403,
  ACCOUNT_NOT_ACTIVE: 403,
  EMAIL_NOT_VERIFIED: 403,
  PHONE_NOT_VERIFIED: 403,
  KYC_REQUIRED: 403,
  SUBSCRIPTION_REQUIRED: 403,
  FEATURE_NOT_AVAILABLE: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  DUPLICATE: 409,
  RATE_LIMIT_EXCEEDED: 429,
};

function statusFromError(error) {
  if (error.statusCode && Number.isInteger(error.statusCode)) {
    return error.statusCode;
  }
  if (error.status && Number.isInteger(error.status)) {
    return error.status;
  }
  if (error.code && STATUS_MAP[error.code]) {
    return STATUS_MAP[error.code];
  }
  if (error.name === 'ValidationError') {
    return 400;
  }
  if (error.name === 'AuthenticationError') {
    return 401;
  }
  if (error.name === 'AuthorizationError') {
    return 403;
  }
  return 500;
}

export function errorHandlerMiddleware() {
  const logger = getLogger('error-handler');

  return function errorHandler(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }

    const status = statusFromError(error);
    const isInternal = status >= 500;

    const logContext = {
      err: error,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status,
      userId: req.user?.id,
    };

    if (isInternal) {
      logger.error(logContext, 'Request failed with internal error');
    } else if (status >= 400) {
      logger.warn(logContext, 'Request failed');
    }

    const errorCode = error.code || (error instanceof AppError ? error.code : 'INTERNAL_ERROR');

    const responseBody = {
      error: {
        code: errorCode,
        message:
          isInternal && appConfig.isProduction
            ? 'Internal server error'
            : error.message || 'An error occurred',
        requestId: req.id,
        timestamp: new Date().toISOString(),
      },
    };

    if (error.details && !appConfig.isProduction) {
      responseBody.error.details = error.details;
    } else if (error.details && !isInternal) {
      responseBody.error.details = error.details;
    }

    if (!appConfig.isProduction && isInternal && error.stack) {
      responseBody.error.stack = error.stack;
    }

    return res.status(status).json(responseBody);
  };
}

export default errorHandlerMiddleware;