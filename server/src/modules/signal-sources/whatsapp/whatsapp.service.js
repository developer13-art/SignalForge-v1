/**
 * WhatsApp Service
 *
 * @module signalforge/server/modules/signal-sources/whatsapp/service
 */

import { WhatsAppRepository } from './whatsapp.repository.js';
import whatsAppConfig from '../../../config/whatsapp.config.js';
import { SourceNotConfiguredError } from '../source.errors.js';

export class WhatsAppService {
  constructor(repository = null) {
    this.repository = repository || new WhatsAppRepository();
  }

  assertConfigured() {
    if (!whatsAppConfig.phoneNumberId || !whatsAppConfig.accessToken) {
      throw new SourceNotConfiguredError('WhatsApp Cloud API is not configured');
    }
  }

  async connect(userId, payload = {}) {
    this.assertConfigured();

    let connection = await this.repository.findConnectionByUser(userId);
    if (connection) {
      await this.repository.updateConnection(connection.id, {
        status: 'CONNECTED',
        lastConnectedAt: new Date(),
      });
      return { connected: true, connectionId: connection.id };
    }

    connection = await this.repository.createConnection({
      userId,
      phoneNumberId: whatsAppConfig.phoneNumberId,
      businessAccountId: whatsAppConfig.businessAccountId,
      groupIds: payload.groupIds || [],
      accessTokenEncrypted: whatsAppConfig.accessToken,
      verifyToken: whatsAppConfig.verifyToken,
      status: 'CONNECTED',
    });

    return { connected: true, connectionId: connection.id };
  }

  async disconnect(userId) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      return { disconnected: false };
    }
    await this.repository.updateConnection(connection.id, { status: 'DISCONNECTED' });
    return { disconnected: true };
  }

  async updateGroups(userId, groupIds) {
    const connection = await this.repository.findConnectionByUser(userId);
    if (!connection) {
      throw new Error('WhatsApp connection not found');
    }
    await this.repository.updateConnection(connection.id, { groupIds });
    return { updated: true, groupCount: groupIds.length };
  }

  async handleWebhook(payload) {
    if (!payload || typeof payload !== 'object') {
      return { handled: false };
    }
    return { handled: true, entries: (payload.entry || []).length };
  }
}

export default WhatsAppService;