/**
 * Withdrawal Service (facade)
 *
 * @module signalforge/server/modules/withdrawals/service
 */

import { WithdrawalRepository } from './withdrawal.repository.js';
import { WithdrawalRequestService } from './requests/withdrawal-request.service.js';
import { WithdrawalMethodFactory } from './methods/method.factory.js';
import {
  WithdrawalNotFoundError,
  WithdrawalAccountNotFoundError,
} from './withdrawal.errors.js';
import {
  emitWithdrawalMethodAdded,
  emitWithdrawalMethodRemoved,
  emitWithdrawalMethodVerified,
} from './withdrawal.events.js';

export class WithdrawalService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new WithdrawalRepository();
    this.requests =
      dependencies.requests ||
      new WithdrawalRequestService({
        repository: dependencies.requestRepository,
        withdrawalRepository: this.repository,
        walletService: dependencies.walletService,
        kycCheck: dependencies.kycCheck,
      });
  }

  async addAccount(userId, payload) {
    const method = WithdrawalMethodFactory.create(payload.methodType);
    const validation = await method.validateAccountDetails(payload.details);
    if (!validation.valid) {
      throw new Error(`Withdrawal method validation failed: ${validation.errors.join(', ')}`);
    }

    const created = await this.repository.createAccount({
      userId,
      methodType: payload.methodType,
      label: payload.label || null,
      details: payload.details,
      status: 'PENDING',
      isDefault: payload.isDefault === true,
      metadata: payload.metadata || null,
    });

    await emitWithdrawalMethodAdded(userId, created.id, payload.methodType);

    return this.getAccount(userId, created.id);
  }

  async getAccount(userId, accountId) {
    const account = await this.repository.findAccountByIdForUser(accountId, userId);
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }
    return this.serializeAccount(account);
  }

  async listAccounts(userId, filters = {}) {
    const rows = await this.repository.listAccounts(userId, filters);
    return rows.map((row) => this.serializeAccount(row));
  }

  async updateAccount(userId, accountId, payload) {
    const account = await this.repository.findAccountByIdForUser(accountId, userId);
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }
    await this.repository.updateAccount(account.id, payload);
    const updated = await this.repository.findAccountById(account.id);
    return this.serializeAccount(updated);
  }

  async verifyAccount(userId, accountId) {
    const account = await this.repository.findAccountByIdForUser(accountId, userId);
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }
    await this.repository.updateAccount(account.id, {
      status: 'VERIFIED',
      verifiedAt: new Date(),
    });
    await emitWithdrawalMethodVerified(userId, account.id);
    const updated = await this.repository.findAccountById(account.id);
    return this.serializeAccount(updated);
  }

  async removeAccount(userId, accountId) {
    const account = await this.repository.findAccountByIdForUser(accountId, userId);
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }
    await this.repository.deleteAccount(account.id);
    await emitWithdrawalMethodRemoved(userId, account.id);
    return { deleted: true };
  }

  async requestWithdrawal(userId, payload) {
    return this.requests.createRequest(userId, payload);
  }

  async getRequest(userId, requestId) {
    return this.requests.getRequestByIdForUser(requestId, userId);
  }

  async listRequests(userId, filters, pagination) {
    return this.requests.listRequests(userId, filters, pagination);
  }

  async listAllRequests(filters, pagination) {
    return this.requests.listAllRequests(filters, pagination);
  }

  async approveRequest(requestId, actorId) {
    return this.requests.approve(requestId, actorId);
  }

  async rejectRequest(requestId, actorId, reason) {
    return this.requests.reject(requestId, actorId, reason);
  }

  async processRequest(requestId, actorId) {
    return this.requests.process(requestId, actorId);
  }

  async cancelRequest(userId, requestId) {
    return this.requests.cancel(requestId, userId);
  }

  async getStatusCounts(filters) {
    return this.requests.getStatusCounts(filters);
  }

  async getMethodBreakdown(filters) {
    return this.requests.getMethodBreakdown(filters);
  }

  listSupportedMethods() {
    return WithdrawalMethodFactory.list();
  }

  serializeAccount(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      methodType: row.method_type,
      label: row.label,
      details: this.parseJson(row.details),
      status: row.status,
      verifiedAt: row.verified_at,
      isDefault: row.is_default,
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

export default WithdrawalService;