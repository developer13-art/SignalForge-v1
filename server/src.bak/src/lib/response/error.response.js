/**
 * Error Response
 *
 * @module server/lib/response/error.response
 */
function errorResponse(res, { statusCode = 500, code = 'INTERNAL_ERROR', message = 'Internal server error', details = null } = {}) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
module.exports = errorResponse;
module.exports.errorResponse = errorResponse;
