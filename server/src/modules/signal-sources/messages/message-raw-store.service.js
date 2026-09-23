/**
 * Message Raw Store Service
 *
 * Encrypts and persists raw message payloads so that historical
 * messages can be reprocessed with improved models without loss.
 *
 * @module signalforge/server/modules/signal-sources/messages/raw-store
 */

import crypto from 'node:crypto';

import securityConfig from '../../../config/security.config.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class MessageRawStoreService {
  constructor(key = null) {
    this.key = key || securityConfig.encryption.key;
    this.logger = getLogger('message-raw-store');
  }

  parseKey() {
    if (!this.key) {
      throw new Error('Encryption key is not configured');
    }
    if (Buffer.isBuffer(this.key)) {
      return this.key;
    }
    if (/^[a-f0-9]{64}$/i.test(this.key)) {
      return Buffer.from(this.key, 'hex');
    }
    return Buffer.from(this.key, 'base64');
  }

  encrypt(payload) {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const keyBuffer = this.parseKey();
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv, {
      authTagLength: 16,
    });

    const ciphertext = Buffer.concat([
      cipher.update(serialized, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  decrypt(encrypted) {
    if (!encrypted || typeof encrypted !== 'string') {
      return null;
    }
    const buffer = Buffer.from(encrypted, 'base64');
    if (buffer.length < 28) {
      return null;
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
      return plaintext;
    }
  }
}

export default MessageRawStoreService;