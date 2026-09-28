/**
 * Authentication Middleware
 *
 * Verifies the access token attached to the request and attaches
 * the authenticated user to `req.user`. Rejects unauthenticated
 * requests with HTTP 401.
 *
 * @module signalforge/server/middleware/authentication
 */

import jwt from 'jsonwebtoken';

import jwtConfig from '../config/jwt.config.js';
import { AuthenticationError } from '../lib/errors/authentication-error.js';

function extractToken(req) {
  const header = req.headers[jwtConfig.accessToken.headerName];
  if (typeof header === 'string' && header.startsWith(jwtConfig.accessToken.headerPrefix)) {
    return header.substring(jwtConfig.accessToken.headerPrefix.length);
  }

  if (typeof req.query.access_token === 'string') {
    return req.query.access_token;
  }

  return null;
}

export function authenticationMiddleware(options = {}) {
  return function authenticate(req, res, next) {
    const token = extractToken(req);

    if (!token) {
      return next(
        new AuthenticationError('Authentication required', {
          code: 'AUTH_TOKEN_MISSING',
        }),
      );
    }

    try {
      const payload = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        algorithms: [jwtConfig.algorithm],
        clockTolerance: jwtConfig.clockToleranceSeconds,
      });

      req.user = {
        id: payload.sub || payload.userId,
        role: payload.role || null,
        roles: payload.roles || [],
        sessionId: payload.sessionId || null,
        kycStatus: payload.kycStatus || null,
        accountStatus: payload.accountStatus || null,
        emailVerified: payload.emailVerified === true,
        phoneVerified: payload.phoneVerified === true,
      };

      req.auth = {
        token,
        payload,
        method: 'jwt',
      };

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(
          new AuthenticationError('Access token expired', {
            code: 'AUTH_TOKEN_EXPIRED',
          }),
        );
      }
      if (error.name === 'JsonWebTokenError') {
        return next(
          new AuthenticationError('Access token invalid', {
            code: 'AUTH_TOKEN_INVALID',
          }),
        );
      }
      return next(error);
    }
  };
}

export default authenticationMiddleware;