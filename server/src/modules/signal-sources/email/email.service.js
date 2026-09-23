/**
 * Email Service
 *
 * @module signalforge/server/modules/signal-sources/email/service
 */

import crypto from 'node:crypto';

import { EmailRepository } from './email.repository.js';
import securityConfig from '../../../config/security.config.js';

export class EmailService {
  constructor(repository = null) {
    this.repository = repository || new EmailRepository();
  }

  encryptPassword(password) {
    const key = securityConfig.encryption.key;
    if (!key) {
      throw new Error('Encryption key is not configured');
    }
    const keyBuffer = /^[a-f0-9]{64}$/i.test(key) ? Buffer.from(key, 'hex') : Buffer.from(key, 'base64');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv, { authTagLength: 16 });
    const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  async createConnection(userId, payload) {
    const encrypted = this.encryptPassword(payload.password);
    const created = await this.repository.createConnection({
      userId,
      sourceId: payload.sourceId || null,
      host: payload.host,
      port: payload.port || 993,
      secure: payload.secure !== false,
      mailbox: payload.mailbox || 'INBOX',
      username: payload.username,
      passwordEncrypted: encrypted,
      status: 'CONNECTED',
    });
    return created;
  }

  async getConnection(userId) {
    return this.repository.findConnectionByUser(userId);
  }

  async updateConnection(userId, payload) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new Error('Email connection not found');
    }
    await this.repository.updateConnection(connection.id, payload);
    return { updated: true };
  }

  async deleteConnection(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return { deleted: false };
    }
    await this.repository.deleteConnection(connection.id);
    return { deleted: true };
  }
}

export default EmailService;