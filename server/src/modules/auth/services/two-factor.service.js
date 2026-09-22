/**
 * Two-Factor Service
 *
 * @module signalforge/server/modules/auth/services/two-factor
 */

import bcrypt from 'bcrypt';

import { TotpService } from './totp.service.js';
import {
  TwoFactorAlreadyEnabledError,
  TwoFactorNotEnabledError,
  InvalidTwoFactorCodeError,
} from '../auth.errors.js';
import {
  emitTwoFactorEnabled,
  emitTwoFactorDisabled,
} from '../auth.events.js';

export class TwoFactorService {
  constructor(repository) {
    this.repository = repository;
    this.totp = new TotpService();
  }

  async startSetup(userId, userEmail, method = 'TOTP') {
    const existing = await this.repository.findTwoFactorByUserId(userId);
    if (existing && existing.enabled === true) {
      throw new TwoFactorAlreadyEnabledError();
    }

    if (method !== 'TOTP') {
      throw new Error(`Two-factor method ${method} is not yet supported`);
    }

    const secret = this.totp.generateSecret(userEmail);
    const backupCodes = this.totp.generateBackupCodes();

    if (existing) {
      await this.repository.updateTwoFactor(userId, {
        secret: secret.base32,
        backupCodes,
        enabled: false,
        verifiedAt: null,
      });
    } else {
      await this.repository.createTwoFactor({
        userId,
        method: 'TOTP',
        secret: secret.base32,
        backupCodes,
        enabled: false,
      });
    }

    return {
      method: 'TOTP',
      secret: secret.base32,
      otpauthUrl: secret.otpauthUrl,
      qrCodeUrl: this.totp.generateQrCodeUrl(secret.base32, userEmail),
      backupCodes,
    };
  }

  async confirmSetup(userId, code) {
    const record = await this.repository.findTwoFactorByUserId(userId);
    if (!record || !record.secret) {
      throw new TwoFactorNotEnabledError('Two-factor setup has not been started');
    }

    if (record.enabled === true) {
      throw new TwoFactorAlreadyEnabledError();
    }

    const valid = this.totp.verifyCode(record.secret, code);
    if (!valid) {
      throw new InvalidTwoFactorCodeError();
    }

    await this.repository.updateTwoFactor(userId, {
      enabled: true,
      verifiedAt: new Date(),
    });

    await emitTwoFactorEnabled(userId, record.method);

    return { enabled: true, method: record.method };
  }

  async verifyCode(userId, code) {
    const record = await this.repository.findTwoFactorByUserId(userId);
    if (!record || record.enabled !== true) {
      throw new TwoFactorNotEnabledError();
    }

    if (this.totp.verifyCode(record.secret, code)) {
      return { valid: true, method: 'TOTP' };
    }

    const backupCodeValid = await this.verifyBackupCode(record, code);
    if (backupCodeValid.valid) {
      return backupCodeValid;
    }

    throw new InvalidTwoFactorCodeError();
  }

  async verifyBackupCode(record, code) {
    if (!Array.isArray(record.backup_codes) || record.backup_codes.length === 0) {
      return { valid: false };
    }

    for (let i = 0; i < record.backup_codes.length; i++) {
      const storedCode = record.backup_codes[i];
      if (!storedCode) {
        continue;
      }

      const match = storedCode === code || (await bcrypt.compare(code, storedCode));
      if (match) {
        const remaining = record.backup_codes.slice();
        remaining.splice(i, 1);
        await this.repository.updateTwoFactor(record.user_id, {
          backupCodes: remaining,
        });
        return { valid: true, method: 'BACKUP_CODE', remainingCodes: remaining.length };
      }
    }

    return { valid: false };
  }

  async disable(userId, password, code) {
    const record = await this.repository.findTwoFactorByUserId(userId);
    if (!record || record.enabled !== true) {
      throw new TwoFactorNotEnabledError();
    }

    const user = await this.repository.findUserById(userId);
    if (!user || !user.password_hash) {
      throw new Error('Cannot verify password for user without stored hash');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new InvalidTwoFactorCodeError('Password is incorrect');
    }

    const valid = this.totp.verifyCode(record.secret, code);
    if (!valid) {
      throw new InvalidTwoFactorCodeError();
    }

    await this.repository.deleteTwoFactor(userId);
    await emitTwoFactorDisabled(userId);

    return { disabled: true };
  }

  async getStatus(userId) {
    const record = await this.repository.findTwoFactorByUserId(userId);
    if (!record) {
      return { enabled: false, method: null, backupCodesRemaining: 0 };
    }
    return {
      enabled: record.enabled === true,
      method: record.method,
      verifiedAt: record.verified_at,
      backupCodesRemaining: Array.isArray(record.backup_codes) ? record.backup_codes.length : 0,
    };
  }

  async regenerateBackupCodes(userId, code) {
    const record = await this.repository.findTwoFactorByUserId(userId);
    if (!record || record.enabled !== true) {
      throw new TwoFactorNotEnabledError();
    }

    const valid = this.totp.verifyCode(record.secret, code);
    if (!valid) {
      throw new InvalidTwoFactorCodeError();
    }

    const newBackupCodes = this.totp.generateBackupCodes();
    await this.repository.updateTwoFactor(userId, { backupCodes: newBackupCodes });

    return { backupCodes: newBackupCodes };
  }
}

export default TwoFactorService;