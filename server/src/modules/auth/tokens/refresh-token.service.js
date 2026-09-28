/**
 * Refresh Token Service
 *
 * @module signalforge/server/modules/auth/tokens/refresh-token
 */
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt.config.js');
class RefreshTokenService {
  generate() {
    return crypto.randomBytes(48).toString('base64url');
  }

  hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  signJwt(payload, options = {}) {
    const {
      expiresIn = jwtConfig.refreshExpiresIn,
      subject,
    } = options;

    return jwt.sign(
      {
        ...payload,
        sub: subject || payload.sub || payload.userId,
        type: 'refresh',
      },
      jwtConfig.secret,
      {
        algorithm: jwtConfig.algorithm,
        expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      },
    );
  }

  verifyJwt(token) {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      clockTolerance: jwtConfig.clockToleranceSeconds,
    });
  }
}
const refreshTokenService = new RefreshTokenService();
module.exports = refreshTokenService;
module.exports.refreshTokenService = refreshTokenService;
