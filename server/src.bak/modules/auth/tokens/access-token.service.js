/**
 * Access Token Service
 *
 * @module signalforge/server/modules/auth/tokens/access-token
 */

import jwt from 'jsonwebtoken';

import jwtConfig from '../../../config/jwt.config.js';

export class AccessTokenService {
  sign(payload, options = {}) {
    const {
      expiresIn = jwtConfig.accessExpiresIn,
      subject,
      audience = jwtConfig.audience,
      issuer = jwtConfig.issuer,
    } = options;

    const claims = {
      ...payload,
      sub: subject || payload.sub || payload.userId,
    };

    return jwt.sign(claims, jwtConfig.secret, {
      algorithm: jwtConfig.algorithm,
      expiresIn,
      issuer,
      audience,
    });
  }

  verify(token) {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      clockTolerance: jwtConfig.clockToleranceSeconds,
    });
  }

  decode(token) {
    return jwt.decode(token, { complete: true });
  }
}

export const accessTokenService = new AccessTokenService();

export default accessTokenService;