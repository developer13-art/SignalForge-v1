/**
 * Withdrawal Request Service
 *
 * @module signalforge/server/modules/withdrawals/requests/service
 */

import { WithdrawalRequestRepository } from './repository.js';
import { WithdrawalRepository } from '../withdrawal.repository.js';
import { WithdrawalMethodFactory } from '../methods/method.factory.js';
import {
  WITHDRAWAL_STATUSES,
  DEFAULT_MIN_WITHDRAWAL_USD,
  DEFAULT_MAX_WITHDRAWAL_USD,
  DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD,
  DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD,
  DEFAULT_MANUAL_REVIEW_THRESHOLD_USD,
  requiresManualReview,
} from '../withdrawal.constants.js';
import {
  WithdrawalNotFoundError,
  WithdrawalAccountNotFoundError,
  WithdrawalAccountNotVerifiedError,
  InsufficientWithdrawableBalanceError,
  WithdrawalBelowMinimumError,
  WithdrawalAboveMaximumError,
  WithdrawalLimitExceededError,
  WithdrawalNotCancellableError,
  WithdrawalAlreadyDecidedError,
} from '../withdrawal.errors.js';
import {
  emitWithdrawalRequested,
  emitWithdrawalUnderReview,
  emitWithdrawalApproved,
  emitWithdrawalRejected,
  emitWithdrawalCompleted,
  emitWithdrawalFailed,
  emitWithdrawalCancelled,
  emitWithdrawalProcessing,
  emitWithdrawalLimitExceeded,
} from '../withdrawal.events.js';

const EXCHANGE_RATES_USD = Object.freeze({
  USD: 1,
  NGN: 1 / 1500,
  GHS: 1 / 12,
  ZAR: 1 / 18,
  KES: 1 / 130,
  EUR: 1.08,
  GBP: 1.27,
});

export class WithdrawalRequestService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new WithdrawalRequestRepository();
    this.withdrawalRepository =
      dependencies.withdrawalRepository || new WithdrawalRepository();
    this.walletService = dependencies.walletService || null;
    this.kycCheck = dependencies.kycCheck || null;
  }

  toUsd(amount, currency) {
    const rate = EXCHANGE_RATES_USD[currency] ?? 1;
    return Number((amount * rate).toFixed(2));
  }

  async assertKyc(userId) {
    if (!this.kycCheck) {
      return true;
    }
    const result = await this.kycCheck(userId);
    if (!result || result.verified !== true) {
      const { KycRequiredForWithdrawalError } = await import('../withdrawal.errors.js');
      throw new KycRequiredForWithdrawalError();
    }
    return true;
  }

  async createRequest(userId, payload) {
    await this.assertKyc(userId);

    const account = await this.withdrawalRepository.findAccountByIdForUser(
      payload.accountId,
      userId,
    );
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }

    if (account.status !== 'VERIFIED') {
      throw new WithdrawalAccountNotVerifiedError(undefined, {
        status: account.status,
      });
    }

    const method = WithdrawalMethodFactory.create(account.method_type);

    const amountUsd = this.toUsd(payload.amount, payload.currency || 'USD');

    if (amountUsd < DEFAULT_MIN_WITHDRAWAL_USD) {
      throw new WithdrawalBelowMinimumError(undefined, {
        amountUsd,
        minimum: DEFAULT_MIN_WITHDRAWAL_USD,
      });
    }

    if (amountUsd > DEFAULT_MAX_WITHDRAWAL_USD) {
      throw new WithdrawalAboveMaximumError(undefined, {
        amountUsd,
        maximum: DEFAULT_MAX_WITHDRAWAL_USD,
      });
    }

    const daily = await this.repository.sumForPeriod(
      userId,
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    );
    if (daily.total + amountUsd > DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD) {
      await emitWithdrawalLimitExceeded(
        userId,
        'DAILY',
        daily.total + amountUsd,
        DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD,
      );
      throw new WithdrawalLimitExceededError(undefined, {
        period: 'daily',
        current: daily.total,
        requested: amountUsd,
        limit: DEFAULT_DAILY_WITHDRAWAL_LIMIT_USD,
      });
    }

    const monthly = await this.repository.sumForPeriod(
      userId,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    );
    if (monthly.total + amountUsd > DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD) {
      await emitWithdrawalLimitExceeded(
        userId,
        'MONTHLY',
        monthly.total + amountUsd,
        DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD,
      );
      throw new WithdrawalLimitExceededError(undefined, {
        period: 'monthly',
        current: monthly.total,
        requested: amountUsd,
        limit: DEFAULT_MONTHLY_WITHDRAWAL_LIMIT_USD,
      });
    }

    if (this.walletService && payload.sourceWalletId) {
      try {
        await this.walletService.getWallet(userId, payload.sourceWalletId);
      } catch {
        throw new InsufficientWithdrawableBalanceError('Source wallet not found');
      }
    }

    const feeAmount = method.calculateFee(payload.amount, account);
    const netAmount = Number((payload.amount - feeAmount).toFixed(4));
    const reviewRequired = requiresManualReview(amountUsd, DEFAULT_MANUAL_REVIEW_THRESHOLD_USD);

    const created = await this.repository.create({
      userId,
      accountId: account.id,
      purpose: payload.purpose,
      methodType: account.method_type,
      amount: payload.amount,
      currency: payload.currency || 'USD',
      amountUsd,
      feeAmount,
      netAmount,
      status: reviewRequired
        ? WITHDRAWAL_STATUSES.UNDER_REVIEW
        : WITHDRAWAL_STATUSES.PENDING,
      requiresReview: reviewRequired,
      sourceWalletId: payload.sourceWalletId || null,
      requestedAt: new Date(),
      metadata: payload.metadata || null,
    });

    await emitWithdrawalRequested(userId, created.id, payload.amount, payload.purpose, {
      methodType: account.method_type,
      requiresReview: reviewRequired,
    });

    if (reviewRequired) {
      await emitWithdrawalUnderReview(userId, created.id);
    }

    return this.getRequestByIdForUser(created.id, userId);
  }

  async getRequestByIdForUser(requestId, userId) {
    const row = await this.repository.findByIdForUser(requestId, userId);
    if (!row) {
      throw new WithdrawalNotFoundError();
    }
    return this.serialize(row);
  }

  async getRequestById(requestId) {
    const row = await this.repository.findById(requestId);
    if (!row) {
      throw new WithdrawalNotFoundError();
    }
    return this.serialize(row);
  }

  async listRequests(userId, filters = {}, pagination = {}) {
    const result = await this.repository.list({ ...filters, userId }, pagination);
    return {
      requests: result.requests.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listAllRequests(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      requests: result.requests.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async approve(requestId, actorId) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new WithdrawalNotFoundError();
    }
    if (
      ![
        WITHDRAWAL_STATUSES.PENDING,
        WITHDRAWAL_STATUSES.UNDER_REVIEW,
      ].includes(request.status)
    ) {
      throw new WithdrawalAlreadyDecidedError();
    }

    await this.repository.update(request.id, {
      status: WITHDRAWAL_STATUSES.APPROVED,
      reviewedBy: actorId,
      reviewedAt: new Date(),
    });

    await emitWithdrawalApproved(request.user_id, request.id, actorId);

    const updated = await this.repository.findById(request.id);
    return this.serialize(updated);
  }

  async reject(requestId, actorId, reason) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new WithdrawalNotFoundError();
    }
    if (
      ![
        WITHDRAWAL_STATUSES.PENDING,
        WITHDRAWAL_STATUSES.UNDER_REVIEW,
        WITHDRAWAL_STATUSES.APPROVED,
      ].includes(request.status)
    ) {
      throw new WithdrawalAlreadyDecidedError();
    }

    await this.repository.update(request.id, {
      status: WITHDRAWAL_STATUSES.REJECTED,
      reviewedBy: actorId,
      reviewedAt: new Date(),
      reviewedReason: reason || null,
    });

    await emitWithdrawalRejected(request.user_id, request.id, actorId, reason);

    const updated = await this.repository.findById(request.id);
    return this.serialize(updated);
  }

  async process(requestId, actorId) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new WithdrawalNotFoundError();
    }
    if (request.status !== WITHDRAWAL_STATUSES.APPROVED) {
      throw new WithdrawalAlreadyDecidedError(
        'Only approved withdrawals can be processed',
        { status: request.status },
      );
    }

    const account = await this.withdrawalRepository.findAccountById(request.account_id);
    if (!account) {
      throw new WithdrawalAccountNotFoundError();
    }

    await this.repository.update(request.id, {
      status: WITHDRAWAL_STATUSES.PROCESSING,
      processedBy: actorId,
      processedAt: new Date(),
    });

    await emitWithdrawalProcessing(request.user_id, request.id);

    try {
      const method = WithdrawalMethodFactory.create(request.method_type);
      const result = await method.processPayout(request, account);

      await this.repository.update(request.id, {
        status: WITHDRAWAL_STATUSES.COMPLETED,
        externalReference: result.externalReference || null,
        externalTransactionId: result.externalTransactionId || null,
      });

      if (this.walletService && request.source_wallet_id) {
        try {
          await this.walletService.debitWallet(request.source_wallet_id, request.net_amount, {
            entryType: 'REFERRAL_WITHDRAWAL_DEBIT',
            referenceType: 'WITHDRAWAL',
            referenceId: request.id,
            description: `Withdrawal payout ${request.id}`,
            actorId,
            actorType: 'SYSTEM',
          });
        } catch (walletError) {
          await this.repository.update(request.id, {
            status: WITHDRAWAL_STATUSES.FAILED,
            failureReason: walletError.message,
          });
          await emitWithdrawalFailed(request.user_id, request.id, walletError.message);
          return this.serialize(await this.repository.findById(request.id));
        }
      }

      await emitWithdrawalCompleted(request.user_id, request.id);

      const updated = await this.repository.findById(request.id);
      return this.serialize(updated);
    } catch (error) {
      await this.repository.update(request.id, {
        status: WITHDRAWAL_STATUSES.FAILED,
        failureReason: error.message,
      });
      await emitWithdrawalFailed(request.user_id, request.id, error.message);
      throw error;
    }
  }

  async cancel(requestId, userId) {
    const request = await this.repository.findByIdForUser(requestId, userId);
    if (!request) {
      throw new WithdrawalNotFoundError();
    }
    if (
      ![
        WITHDRAWAL_STATUSES.PENDING,
        WITHDRAWAL_STATUSES.UNDER_REVIEW,
      ].includes(request.status)
    ) {
      throw new WithdrawalNotCancellableError(undefined, { status: request.status });
    }

    await this.repository.update(request.id, {
      status: WITHDRAWAL_STATUSES.CANCELLED,
    });

    await emitWithdrawalCancelled(userId, request.id);

    const updated = await this.repository.findById(request.id);
    return this.serialize(updated);
  }

  async getStatusCounts(filters) {
    return this.repository.countByStatus(filters);
  }

  async getMethodBreakdown(filters) {
    return this.repository.sumByMethodType(filters);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      accountId: row.account_id,
      purpose: row.purpose,
      methodType: row.method_type,
      amount: row.amount,
      currency: row.currency,
      amountUsd: row.amount_usd,
      feeAmount: row.fee_amount,
      netAmount: row.net_amount,
      status: row.status,
      requiresReview: row.requires_review,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reviewedReason: row.reviewed_reason,
      processedBy: row.processed_by,
      processedAt: row.processed_at,
      externalReference: row.external_reference,
      externalTransactionId: row.external_transaction_id,
      failureReason: row.failure_reason,
      metadata: this.parseJson(row.metadata),
      requestedAt: row.requested_at,
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

export default WithdrawalRequestService;