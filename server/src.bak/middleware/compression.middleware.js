/**
 * Compression Middleware
 *
 * Applies gzip or deflate compression to responses. Webhook routes
 * are excluded because their signature verification requires the
 * raw request body.
 *
 * @module signalforge/server/middleware/compression
 */

import compression from 'compression';

export function compressionMiddleware() {
  return compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      if (req.path.startsWith('/api/webhooks')) {
        return false;
      }
      return compression.filter(req, res);
    },
  });
}

export default compressionMiddleware;