/**
 * Not Found Middleware
 *
 * Handles requests that do not match any registered route. Returns
 * a structured 404 response.
 *
 * @module signalforge/server/middleware/not-found
 */
function notFoundMiddleware(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  });
}
module.exports = notFoundMiddleware;
module.exports.notFoundMiddleware = notFoundMiddleware;
