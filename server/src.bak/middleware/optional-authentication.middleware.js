/**
 * Optional Authentication Middleware
 *
 * Attempts to authenticate the request but does not reject the
 * request if the token is missing or invalid. Useful for endpoints
 * that behave differently for authenticated users but are also
 * publicly accessible.
 *
 * @module signalforge/server/middleware/optional-authentication
 */

import jwt from 'jsonwebtoken';

import jwtConfig from '../config/jwt.config.js';

export function optionalAuthenticationMiddleware() {
  return function optionalAuthenticate(req, res, next) {
    const header = req.headers[jwtConfig.accessToken.headerName];
    let token = null;

    if (typeof header === 'string' && header.startsWith(jwtConfig.accessToken.headerPrefix)) {
      token = header.substring(jwtConfig.accessToken.headerPrefix.length);
    } else if (typeof req.query.access_token === 'string') {
      token = req.query.access_token;
    }

    if (!token) {
      req.user = null;
      return next();
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
    } catch {
      req.user = null;
      req.auth = null;
    }

    next();
  };
}

export default optionalAuthenticationMiddleware;