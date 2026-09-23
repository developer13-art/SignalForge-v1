/**
 * Execution Request Service
 *
 * @module signalforge/server/modules/execution/request/service
 */

import { ExecutionRequestRepository } from './execution-request.repository.js';
import { ExecutionRequestValidatorService } from './execution-request-validator.service.js';
import { OpenPositionOperation } from '../operations/open-position.operation.js';
import { ClosePositionOperation } from '../operations/close-position.operation.js';
import { ModifyPositionOperation } from '../operations/modify-position.operation.js';
import { PartialCloseOperation } from '../operations/partial-close.operation.js';
import { PendingOrderOperation } from '../operations/pending-order.operation.js';
import { SyncPositionsOperation } from '../operations/sync-positions.operation.js';
import { GatewayFactory } from '../gateway/gateway.factory.js';
import {
  GATEWAY_TYPES,
  OPERATION_TYPES,
  EXECUTION_STATUSES,
  DEFAULT_EXECUTION_TIMEOUT_MS,
  DEFAULT_LATENCY_ALERT_MS,
  isRetryableGatewayError,
} from '../execution.constants.js';
import {
  ExecutionRequestNotFoundError,
  ExecutionFailedError,
  GatewayError,
  UnsupportedOperationError,
} from '../execution.errors.js';
import {
  emitRequestCreated,
  emitRequestAccepted,
  emitRequestRejected,
  emitRequestFailed,
  emitRequestDeadLettered,
  emitOrderPlaced,
  emitOrderAccepted,
  emitOrderRejected,
  emitPositionOpened,
  emitPositionModified,
  emitPositionClosed,
  emitPartialCloseExecuted,
  emitPendingOrderPlaced,
  emitPendingOrderCancelled,
  emitLatencyAlert,
} from '../execution.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class ExecutionRequestService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ExecutionRequestRepository();
    this.validator = dependencies.validator || new ExecutionRequestValidatorService();
    this.gatewayFactory = dependencies.gatewayFactory || GatewayFactory;
    this.openPositionOperation = dependencies.openPositionOperation || new OpenPositionOperation(this.gatewayFactory);
    this.closePositionOperation = dependencies.closePositionOperation || new ClosePositionOperation(this.gatewayFactory);
    this.modifyPositionOperation = dependencies.modifyPositionOperation || new ModifyPositionOperation(this.gatewayFactory);
    this.partialCloseOperation = dependencies.partialCloseOperation || new PartialCloseOperation(this.gatewayFactory);
    this.pendingOrderOperation = dependencies.pendingOrderOperation || new PendingOrderOperation(this.gatewayFactory);
    this.syncPositionsOperation = dependencies.syncPositionsOperation || new SyncPositionsOperation(this.gatewayFactory);
    this.logger = getLogger('execution-request');
  }

  async executeOpenPosition(request, options = {}) {
    this.validator.assertValid(request);

    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;

    const created = await this.repository.create({
      tradeId: request.tradeId,
      signalId: request.signalId || null,
      userId: request.userId,
      brokerAccountId: request.brokerAccountId,
      metaApiAccountId: request.metaApiAccountId || null,
      platform: request.platform || null,
      symbol: request.symbol,
      direction: request.direction,
      entryType: request.entryType || 'MARKET',
      volume: request.volume,
      price: request.price ?? null,
      stopLoss: request.stopLoss ?? null,
      takeProfit: request.takeProfit ?? null,
      comment: request.comment || 'SignalForge',
      magicNumber: request.magicNumber ?? null,
      slippage: request.slippage ?? null,
      status: EXECUTION_STATUSES.PENDING,
      attempt: 1,
      maxAttempts: request.maxAttempts || 3,
      requestedAt: new Date(),
    });

    await emitRequestCreated(created.id, request.tradeId, request.userId, {
      symbol: request.symbol,
    });

    const startedAt = Date.now();

    try {
      const result = await this.withTimeout(
        this.openPositionOperation.execute(request, gatewayType),
        options.timeoutMs || DEFAULT_EXECUTION_TIMEOUT_MS,
        `open_position:${created.id}`,
      );

      const durationMs = Date.now() - startedAt;

      if (durationMs > DEFAULT_LATENCY_ALERT_MS) {
        await emitLatencyAlert(created.id, durationMs, DEFAULT_LATENCY_ALERT_MS);
      }

      const updated = await this.repository.update(created.id, {
        status: EXECUTION_STATUSES.COMPLETED,
        brokerOrderId: result.result.brokerOrderId || null,
        brokerPositionId: result.result.brokerPositionId || null,
        brokerTicket: result.result.brokerTicket || null,
        executedPrice: result.result.executedPrice ?? null,
        executedVolume: result.result.executedVolume ?? null,
        brokerResponse: result.result.raw || null,
        durationMs,
        completedAt: new Date(),
      });

      await emitOrderPlaced(created.id, result.result.brokerOrderId || null);
      await emitOrderAccepted(created.id, result.result.brokerOrderId || null);
      await emitRequestAccepted(created.id, result.result.brokerOrderId || null);
      await emitPositionOpened(request.tradeId);

      return {
        requestId: updated.id,
        status: updated.status,
        brokerOrderId: updated.broker_order_id,
        brokerPositionId: updated.broker_position_id,
        brokerTicket: updated.broker_ticket,
        executedPrice: updated.executed_price,
        executedVolume: updated.executed_volume,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      return this.handleFailure(created, error, durationMs, gatewayType);
    }
  }

  async executeClosePosition(trade, options = {}) {
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;
    const startedAt = Date.now();

    try {
      const result = await this.withTimeout(
        this.closePositionOperation.execute(trade, gatewayType),
        options.timeoutMs || DEFAULT_EXECUTION_TIMEOUT_MS,
        `close_position:${trade.id}`,
      );

      await emitPositionClosed(trade.id);

      return {
        tradeId: trade.id,
        operation: 'CLOSE_POSITION',
        result: result.result,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      throw new ExecutionFailedError('Close position failed', {
        tradeId: trade.id,
        cause: error.message,
      });
    }
  }

  async executeModifyPosition(trade, modifications, options = {}) {
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;

    try {
      const result = await this.modifyPositionOperation.execute(
        trade,
        modifications,
        gatewayType,
      );
      await emitPositionModified(trade.id, modifications);
      return {
        tradeId: trade.id,
        operation: 'MODIFY_POSITION',
        result: result.result,
      };
    } catch (error) {
      throw new ExecutionFailedError('Modify position failed', {
        tradeId: trade.id,
        cause: error.message,
      });
    }
  }

  async executePartialClose(trade, percentage, options = {}) {
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;

    try {
      const result = await this.partialCloseOperation.execute(
        trade,
        percentage,
        gatewayType,
      );
      await emitPartialCloseExecuted(trade.id, percentage);
      return {
        tradeId: trade.id,
        operation: 'PARTIAL_CLOSE',
        percentage,
        result: result.result,
      };
    } catch (error) {
      throw new ExecutionFailedError('Partial close failed', {
        tradeId: trade.id,
        cause: error.message,
      });
    }
  }

  async executePendingOrder(request, options = {}) {
    this.validator.assertValid(request);
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;

    const created = await this.repository.create({
      tradeId: request.tradeId,
      signalId: request.signalId || null,
      userId: request.userId,
      brokerAccountId: request.brokerAccountId,
      metaApiAccountId: request.metaApiAccountId || null,
      platform: request.platform || null,
      symbol: request.symbol,
      direction: request.direction,
      entryType: request.entryType || 'LIMIT',
      volume: request.volume,
      price: request.price ?? null,
      stopLoss: request.stopLoss ?? null,
      takeProfit: request.takeProfit ?? null,
      comment: request.comment || 'SignalForge',
      magicNumber: request.magicNumber ?? null,
      status: EXECUTION_STATUSES.PENDING,
      attempt: 1,
      maxAttempts: request.maxAttempts || 3,
      requestedAt: new Date(),
    });

    try {
      const result = await this.pendingOrderOperation.place(request, gatewayType);
      await this.repository.update(created.id, {
        status: EXECUTION_STATUSES.COMPLETED,
        brokerOrderId: result.result.brokerOrderId || null,
        brokerResponse: result.result.raw || null,
        completedAt: new Date(),
      });
      await emitPendingOrderPlaced(created.id);
      return {
        requestId: created.id,
        operation: 'PENDING_ORDER',
        result: result.result,
      };
    } catch (error) {
      throw new ExecutionFailedError('Pending order failed', {
        requestId: created.id,
        cause: error.message,
      });
    }
  }

  async executeCancelPendingOrder(request, options = {}) {
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;
    const result = await this.pendingOrderOperation.cancel(request, gatewayType);
    await emitPendingOrderCancelled(request.id);
    return {
      requestId: request.id,
      operation: 'CANCEL_PENDING',
      result: result.result,
    };
  }

  async executeSyncPositions(brokerAccount, options = {}) {
    const gatewayType = options.gatewayType || GATEWAY_TYPES.METAAPI;
    const result = await this.syncPositionsOperation.execute(brokerAccount, gatewayType);
    return result;
  }

  async handleFailure(request, error, durationMs, gatewayType) {
    const isRetryable =
      error instanceof GatewayError && isRetryableGatewayError(error.errorType);

    if (isRetryable && request.attempt < request.max_attempts) {
      await this.repository.incrementAttempt(request.id);
      return {
        requestId: request.id,
        status: EXECUTION_STATUSES.RETRYING,
        attempt: request.attempt + 1,
        error: error.message,
        retryable: true,
      };
    }

    const finalStatus = isRetryable
      ? EXECUTION_STATUSES.DEAD_LETTER
      : EXECUTION_STATUSES.REJECTED;

    await this.repository.update(request.id, {
      status: finalStatus,
      rejectionReason: error.message,
      error: error.message,
      durationMs,
      failedAt: new Date(),
    });

    await emitOrderRejected(request.id, error.message);
    await emitRequestFailed(request.id, error);

    if (finalStatus === EXECUTION_STATUSES.DEAD_LETTER) {
      await emitRequestDeadLettered(request.id, error);
    } else {
      await emitRequestRejected(request.id, error.message);
    }

    return {
      requestId: request.id,
      status: finalStatus,
      error: error.message,
      retryable: false,
    };
  }

  async withTimeout(promise, timeoutMs, label) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new GatewayError(`${label} exceeded ${timeoutMs}ms`, {
          errorType: 'TIMEOUT',
        }));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }

  async getRequestById(requestId) {
    const request = await this.repository.findById(requestId);
    if (!request) {
      throw new ExecutionRequestNotFoundError();
    }
    return this.serialize(request);
  }

  async listRequestsByTrade(tradeId) {
    const requests = await this.repository.findByTrade(tradeId);
    return requests.map((r) => this.serialize(r));
  }

  async listRequests(filters, pagination) {
    const result = await this.repository.list(filters, pagination);
    return {
      requests: result.requests.map((r) => this.serialize(r)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async countByStatus(filters) {
    return this.repository.countByStatus(filters);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tradeId: row.trade_id,
      signalId: row.signal_id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      metaApiAccountId: row.metaapi_account_id,
      platform: row.platform,
      symbol: row.symbol,
      direction: row.direction,
      entryType: row.entry_type,
      volume: row.volume,
      price: row.price,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      comment: row.comment,
      magicNumber: row.magic_number,
      slippage: row.slippage,
      status: row.status,
      attempt: row.attempt,
      maxAttempts: row.max_attempts,
      brokerOrderId: row.broker_order_id,
      brokerPositionId: row.broker_position_id,
      brokerTicket: row.broker_ticket,
      executedPrice: row.executed_price,
      executedVolume: row.executed_volume,
      rejectionReason: row.rejection_reason,
      brokerResponse: row.broker_response,
      error: row.error,
      durationMs: row.duration_ms,
      requestedAt: row.requested_at,
      submittedAt: row.submitted_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export { OPERATION_TYPES };

export default ExecutionRequestService;