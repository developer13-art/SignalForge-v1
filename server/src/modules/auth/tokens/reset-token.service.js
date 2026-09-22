/**
 * Password Reset Token Service
 *
 * @module signalforge/server/modules/auth/tokens/reset-token
 */

import crypto from 'node:crypto';

import jwtConfig from '../../../config/jwt.config.js';

export class ResetTokenService {
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

export const resetTokenService = new ResetTokenService();

export default resetTokenService;