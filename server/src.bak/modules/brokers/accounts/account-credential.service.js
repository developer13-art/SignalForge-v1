/**
 * Broker Account Credential Service
 *
 * Handles encryption and decryption of broker account credentials.
 * Credentials are never stored or transmitted in plaintext.
 *
 * @module signalforge/server/modules/brokers/accounts/credential
 */

import crypto from 'node:crypto';

import securityConfig from '../../../config/security.config.js';
import { BrokerCredentialError } from '../broker.errors.js';

export class AccountCredentialService {
  constructor(key = null) {
    this.key = key || securityConfig.encryption.key;
  }

  parseKey() {
    if (!this.key) {
      throw new BrokerCredentialError('Encryption key is not configured');
    }
    if (Buffer.isBuffer(this.key)) {
      return this.key;
    }
    if (/^[a-f0-9]{64}$/i.test(this.key)) {
      return Buffer.from(this.key, 'hex');
    }
    const buffer = Buffer.from(this.key, 'base64');
    if (buffer.length === 32) {
      return buffer;
    }
    return crypto.createHash('sha256').update(this.key).digest();
  }

  encrypt(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new BrokerCredentialError('Credentials must be an object');
    }

    const payload = JSON.stringify({
      accountNumber: credentials.accountNumber,
      password: credentials.password,
      server: credentials.server,
      platform: credentials.platform,
    });

    const keyBuffer = this.parseKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv, {
      authTagLength: 16,
    });

    const ciphertext = Buffer.concat([
      cipher.update(payload, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  decrypt(encrypted) {
    if (!encrypted || typeof encrypted !== 'string') {
      throw new BrokerCredentialError('Encrypted credentials are required');
    }

    const buffer = Buffer.from(encrypted, 'base64');
    if (buffer.length < 28) {
      throw new BrokerCredentialError('Encrypted credentials are malformed');
    }

    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const ciphertext = buffer.subarray(28);

    const keyBuffer = this.parseKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');

    try {
      return JSON.parse(plaintext);
    } catch {
      throw new BrokerCredentialError('Decrypted credentials are invalid');
    }
  }

  maskCredentials(credentials) {
    if (!credentials) {
      return null;
    }
    return {
      accountNumber: credentials.accountNumber
        ? `${credentials.accountNumber.substring(0, 2)}****${credentials.accountNumber.substring(credentials.accountNumber.length - 2)}`
        : null,
      password: '********',
      server: credentials.server || null,
      platform: credentials.platform || null,
    };
  }
}

export default AccountCredentialService;