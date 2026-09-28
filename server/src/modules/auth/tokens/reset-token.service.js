/**
 * Password Reset Token Service
 *
 * @module signalforge/server/modules/auth/tokens/reset-token
 */
const crypto = require('node:crypto');
const jwtConfig = require('../../../config/jwt.config.js');
class ResetTokenService {
  generate() {
    return crypto.randomBytes(32).toString('base64url');
  }

  hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getExpiry() {
    const minutes = jwtConfig.passwordResetToken.expiresInMinutes;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  isExpired(expiresAt) {
    return new Date(expiresAt).getTime() < Date.now();
  }
}
const resetTokenService = new ResetTokenService();
module.exports = resetTokenService;
module.exports.resetTokenService = resetTokenService;
