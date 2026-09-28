/**
 * Async Handler
 *
 * Wraps an Express route handler so that thrown errors and rejected
 * promises are forwarded to the next error middleware. Removes the
 * need for try/catch in every controller.
 *
 * @module server/lib/async-handler
 */

export function asyncHandler(handler) {
  if (typeof handler !== 'function') {
    throw new Error('handler must be a function');
  }

  return function wrappedHandler(req, res, next) {
    try {
      const result = handler(req, res, next);
      if (result && typeof result.catch === 'function') {
        result.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
}

export default asyncHandler;