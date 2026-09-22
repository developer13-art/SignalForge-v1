/**
 * Phone Verification Token Service
 *
 * @module signalforge/server/modules/auth/tokens/phone-token
 */

import crypto from 'node:crypto';

import jwtConfig from '../../../config/jwt.config.js';
import { OTP_CODE_LENGTH } from '../auth.constants.js';

export class PhoneTokenService {
  generateOtp(length = OTP_CODE_LENGTH) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = crypto.randomInt(min, max + 1);
    return String(code).padStart(length, '0');
  }

  hash(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  getExpiry() {
    const minutes = jwtConfig.phoneVerificationToken.expiresInMinutes;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  isExpired(expiresAt) {
    return new Date(expiresAt).getTime() < Date.now();
  }

  verify(code, hash) {
    const codeHash = this.hash(code);
    if (codeHash.length !== hash.length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(codeHash),
      Buffer.from(hash),
    );
  }
}

export const phoneTokenService = new PhoneTokenService();

export default phoneTokenService;