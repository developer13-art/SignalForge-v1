/**
 * Telegram Session Encryption Service
 *
 * Encrypts and decrypts Telegram session strings before storing them
 * in the database. Session strings grant full access to the user's
 * Telegram account, so they are never stored in plaintext.
 *
 * @module signalforge/server/modules/signal-sources/telegram/session-encryption
 */

import crypto from 'node:crypto';

import telegramConfig from '../../../config/telegram.config.js';

export class TelegramSessionEncryptionService {
  constructor(key = null) {
    this.key = key || telegramConfig.session.encryptionKey;
  }

  parseKey() {
    if (!this.key) {
      throw new Error('Telegram session encryption key is not configured');
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

  encrypt(sessionString) {
    if (typeof sessionString !== 'string') {
      throw new Error('Session must be a string');
    }
    const keyBuffer = this.parseKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv, {
      authTagLength: 16,
    });
    const ciphertext = Buffer.concat([
      cipher.update(sessionString, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  decrypt(encrypted) {
    if (!encrypted || typeof encrypted !== 'string') {
      throw new Error('Encrypted session is required');
    }
    const buffer = Buffer.from(encrypted, 'base64');
    if (buffer.length < 28) {
      throw new Error('Encrypted session is malformed');
    }
    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const ciphertext = buffer.subarray(28);

    const keyBuffer = this.parseKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}

export default TelegramSessionEncryptionService;