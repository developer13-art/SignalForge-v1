/**
 * Telegram Session Store Service
 *
 * Persists and retrieves encrypted Telegram sessions for a user.
 *
 * @module signalforge/server/modules/signal-sources/telegram/session-store
 */

import { TelegramRepository } from './telegram.repository.js';
import { TelegramSessionEncryptionService } from './telegram-session-encryption.service.js';
import { TELEGRAM_SESSION_STATUSES } from './telegram.constants.js';

export class TelegramSessionStoreService {
  constructor(repository = null, encryption = null) {
    this.repository = repository || new TelegramRepository();
    this.encryption = encryption || new TelegramSessionEncryptionService();
  }

  async storeSession(connectionId, sessionString) {
    const encrypted = this.encryption.encrypt(sessionString);
    await this.repository.updateConnection(connectionId, {
      sessionEncrypted: encrypted,
      status: TELEGRAM_SESSION_STATUSES.ACTIVE,
      lastConnectedAt: new Date(),
    });
    return { stored: true };
  }

  async retrieveSession(connectionId) {
    const connection = await this.repository.findConnectionById(connectionId);
    if (!connection || !connection.session_encrypted) {
      return null;
    }
    return this.encryption.decrypt(connection.session_encrypted);
  }

  async markExpired(connectionId, reason) {
    await this.repository.updateConnection(connectionId, {
      status: TELEGRAM_SESSION_STATUSES.EXPIRED,
      lastError: reason,
      lastErrorAt: new Date(),
    });
  }

  async markRevoked(connectionId) {
    await this.repository.updateConnection(connectionId, {
      status: TELEGRAM_SESSION_STATUSES.REVOKED,
    });
  }

  async getStatus(connectionId) {
    const connection = await this.repository.findConnectionById(connectionId);
    if (!connection) {
      return null;
    }
    return {
      id: connection.id,
      status: connection.status,
      phoneNumber: connection.phone_number,
      lastConnectedAt: connection.last_connected_at,
      lastError: connection.last_error,
    };
  }
}

export default TelegramSessionStoreService;