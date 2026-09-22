/**
 * Email Verification Token Service
 *
 * @module signalforge/server/modules/auth/tokens/email-token
 */

import crypto from 'node:crypto';

import jwtConfig from '../../../config/jwt.config.js';

export class EmailTokenService {
  generate() {
    return crypto.randomBytes(32).toString('base64url');
  }

  hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getExpiry() {
    const hours = jwtConfig.emailVerificationToken.expiresInHours;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  isExpired(expiresAt) {
    return new Date(expiresAt).getTime() < Date.now();
  }
}

export const emailTokenService = new EmailTokenService();

export default emailTokenService;