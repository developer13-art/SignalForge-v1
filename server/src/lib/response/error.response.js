/**
 * Error Response
 *
 * @module server/lib/response/error.response
 */

export function errorResponse(res, { statusCode = 500, code = 'INTERNAL_ERROR', message = 'Internal server error', details = null } = {}) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

export default errorResponse;