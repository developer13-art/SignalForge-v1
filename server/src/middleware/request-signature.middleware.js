/**
 * Request Signature Middleware
 *
 * Verifies the HMAC signature on incoming requests. The signature
 * is computed over the raw request body using a shared secret.
 *
 * @module signalforge/server/middleware/request-signature
 */

import crypto from 'node:crypto';

import { AuthenticationError } from '../lib/errors/authentication-error.js';
import { getLogger } from '../bootstrap/initLogger.js';

export function requestSignatureMiddleware(options = {}) {
  const {
    secret,
    headerName = 'x-signature',
    algorithm = 'sha256',
    encoding = 'hex',
  } = options;

  const logger = getLogger('request-signature');

  return function verifySignature(req, res, next) {
    if (!secret) {
      return next(new Error('Request signature secret is not configured'));
    }

    const provided = req.headers[headerName];
    if (typeof provided !== 'string' || provided.length === 0) {
      return next(
        new AuthenticationError('Request signature missing', {
          code: 'SIGNATURE_MISSING',
        }),
      );
    }

    const raw = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {}));

    const expected = crypto.createHmac(algorithm, secret).update(raw).digest(encoding);

    let valid = false;
    try {
      const providedBuffer = Buffer.from(provided, encoding);
      const expectedBuffer = Buffer.from(expected, encoding);
      valid =
        providedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(providedBuffer, expectedBuffer);
    } catch (error) {
      logger.warn({ err: error }, 'Signature comparison failed');
      valid = false;
    }

    if (!valid) {
      return next(
        new AuthenticationError('Request signature invalid', {
          code: 'SIGNATURE_INVALID',
        }),
      );
    }

    req.signature = {
      valid: true,
      algorithm,
      headerName,
    };

    return next();
  };
}

export default requestSignatureMiddleware;