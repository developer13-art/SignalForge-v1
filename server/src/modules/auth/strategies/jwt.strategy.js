/**
 * JWT Strategy
 *
 * Verifies access tokens and loads the associated user record.
 *
 * @module signalforge/server/modules/auth/strategies/jwt
 */
const { accessTokenService } = require('../tokens/access-token.service.js');
const { InvalidTokenError, TokenExpiredError } = require('../auth.errors.js');
class JwtStrategy {
  constructor(repository) {
    this.repository = repository;
  }

  async authenticate(token) {
    if (!token || typeof token !== 'string') {
      throw new InvalidTokenError('Token is missing');
    }

    let payload;
    try {
      payload = accessTokenService.verify(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError('Token is invalid');
    }

    const userId = payload.sub || payload.userId;
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new InvalidTokenError('User not found');
    }

    return { user, payload };
  }
}
module.exports = JwtStrategy;
module.exports.JwtStrategy = JwtStrategy;
