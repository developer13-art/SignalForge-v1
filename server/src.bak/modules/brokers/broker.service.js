/**
 * Broker Service (facade)
 *
 * @module signalforge/server/modules/brokers/service
 */

import { BrokerRepository } from './broker.repository.js';
import { BrokerRegistryService } from './registry/broker-registry.service.js';
import { BrokerSpecService } from './registry/broker-spec.service.js';
import { BrokerMappingService } from './registry/broker-mapping.service.js';
import { AccountService } from './accounts/account.service.js';
import { ConnectionLogService } from './logs/connection-log.service.js';
import { BrokerNotFoundError } from './broker.errors.js';

export class BrokerService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new BrokerRepository();
    this.registry = dependencies.registry || new BrokerRegistryService(this.repository);
    this.spec = dependencies.spec || new BrokerSpecService();
    this.mapping = dependencies.mapping || new BrokerMappingService();
    this.accounts = dependencies.accounts || new AccountService();
    this.logs = dependencies.logs || new ConnectionLogService();
  }

  async listBrokers(filters = {}) {
    return this.registry.listBrokers(filters);
  }

  async getBrokerById(brokerId) {
    const row = await this.repository.findBrokerById(brokerId);
    if (!row) {
      throw new BrokerNotFoundError();
    }
    return this.serialize(row);
  }

  async createBroker(payload) {
    const created = await this.repository.createBroker(payload);
    return this.serialize(created);
  }

  async updateBroker(brokerId, payload) {
    const existing = await this.repository.findBrokerById(brokerId);
    if (!existing) {
      throw new BrokerNotFoundError();
    }
    await this.repository.updateBroker(brokerId, payload);
    const updated = await this.repository.findBrokerById(brokerId);
    return this.serialize(updated);
  }

  async deleteBroker(brokerId) {
    const existing = await this.repository.findBrokerById(brokerId);
    if (!existing) {
      throw new BrokerNotFoundError();
    }
    await this.repository.deleteBroker(brokerId);
    return { deleted: true };
  }

  getBrokerSpec(server) {
    return this.spec.getSpec(server);
  }

  getSymbolCandidates(platform, canonicalSymbol) {
    return this.mapping.getSymbolCandidates(platform, canonicalSymbol);
  }

  resolveSymbol(platform, brokerSymbol) {
    return this.mapping.resolveSymbol(platform, brokerSymbol);
  }

  async connectAccount(userId, payload) {
    return this.accounts.connectAccount(userId, payload);
  }

  async listAccounts(userId, filters) {
    return this.accounts.listAccounts(userId, filters);
  }

  async getAccount(userId, accountId) {
    return this.accounts.getAccount(userId, accountId);
  }

  async removeAccount(userId, accountId) {
    return this.accounts.removeAccount(userId, accountId);
  }

  async disconnectAccount(userId, accountId) {
    return this.accounts.disconnectAccount(userId, accountId);
  }

  async syncAccount(userId, accountId) {
    return this.accounts.syncAccount(userId, accountId);
  }

  async listSnapshots(accountId, filters, pagination) {
    return this.accounts.listSnapshots(accountId, filters, pagination);
  }

  async listConnectionLogs(accountId, pagination) {
    return this.logs.list(accountId, pagination);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      name: row.name,
      platform: row.platform,
      server: row.server,
      country: row.country,
      website: row.website,
      description: row.description,
      isActive: row.is_active,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default BrokerService;