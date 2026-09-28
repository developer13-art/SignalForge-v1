/**
 * TOTP Service
 *
 * Provides Time-Based One-Time Password generation and verification
 * for two-factor authentication. Uses speakeasy under the hood.
 *
 * @module signalforge/server/modules/auth/services/totp
 */

import crypto from 'node:crypto';

import speakeasy from 'speakeasy';

import securityConfig from '../../../config/security.config.js';

export class TotpService {
  generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      length: 32,
      name: `SignalForge (${userEmail})`,
      issuer: securityConfig.twoFactor.issuer,
    });

    return {
      base32: secret.base32,
      otpauthUrl: secret.otpauth_url,
      ascii: secret.ascii,
      hex: secret.hex,
    };
  }

  generateQrCodeUrl(secretBase32, userEmail) {
    const label = encodeURIComponent(`SignalForge:${userEmail}`);
    const issuer = encodeURIComponent(securityConfig.twoFactor.issuer);
    return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${issuer}`;
  }

  verifyCode(secretBase32, token, options = {}) {
    if (!secretBase32 || !token) {
      return false;
    }

    const window = options.window ?? securityConfig.twoFactor.window;

    return speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: String(token),
      window,
      step: securityConfig.twoFactor.step,
      digits: securityConfig.twoFactor.digits,
    });
  }

  generateCurrentCode(secretBase32) {
    return speakeasy.totp({
      secret: secretBase32,
      encoding: 'base32',
      step: securityConfig.twoFactor.step,
      digits: securityConfig.twoFactor.digits,
    });
  }

  generateBackupCodes(count = securityConfig.twoFactor.backupCodesCount) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 5)}-${code.slice(5, 10)}`);
    }
    return codes;
  }
}

export default TotpService;