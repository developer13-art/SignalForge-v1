/**
 * Access Token Service
 *
 * @module signalforge/server/modules/auth/tokens/access-token
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt.config.js');
class AccessTokenService {
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
const accessTokenService = new AccessTokenService();
module.exports = accessTokenService;
module.exports.accessTokenService = accessTokenService;
