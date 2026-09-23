/**
 * Execution Service (facade)
 *
 * @module signalforge/server/modules/execution/service
 */

import { ExecutionRepository } from './execution.repository.js';
import { ExecutionRequestService } from './request/execution-request.service.js';
import { ExecutionRequestRepository } from './request/execution-request.repository.js';
import { ExecutionRequestValidatorService } from './request/execution-request-validator.service.js';
import { ExecutionLogService } from './logs/execution-log.service.js';
import { ExecutionLogRepository } from './logs/execution-log.repository.js';
import { RetryService } from './retry/retry.service.js';
import { DeadLetterService } from './retry/dead-letter.service.js';
import { BackoffService } from './retry/backoff.service.js';
import { FailureNotificationService } from './retry/failure-notification.service.js';
import { GatewayFactory } from './gateway/gateway.factory.js';
import { GATEWAY_TYPES } from './execution.constants.js';

export class ExecutionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ExecutionRepository();
    this.requestRepository =
      dependencies.requestRepository || new ExecutionRequestRepository();
    this.validator = dependencies.validator || new ExecutionRequestValidatorService();

    this.logs = dependencies.logs || new ExecutionLogService(new ExecutionLogRepository());
    this.retry = dependencies.retry || new RetryService({
      repository: this.requestRepository,
      backoff: new BackoffService(),
      deadLetter: new DeadLetterService(this.requestRepository),
      failureNotification: new FailureNotificationService(dependencies.notificationService),
    });

    this.requestService =
      dependencies.requestService ||
      new ExecutionRequestService({
        repository: this.requestRepository,
        validator: this.validator,
        gatewayFactory: dependencies.gatewayFactory || GatewayFactory,
      });
  }

  async openPosition(request, options = {}) {
    return this.requestService.executeOpenPosition(request, options);
  }

  async closePosition(trade, options = {}) {
    return this.requestService.executeClosePosition(trade, options);
  }

  async modifyPosition(trade, modifications, options = {}) {
    return this.requestService.executeModifyPosition(trade, modifications, options);
  }

  async partialClose(trade, percentage, options = {}) {
    return this.requestService.executePartialClose(trade, percentage, options);
  }

  async placePendingOrder(request, options = {}) {
    return this.requestService.executePendingOrder(request, options);
  }

  async cancelPendingOrder(request, options = {}) {
    return this.requestService.executeCancelPendingOrder(request, options);
  }

  async syncPositions(brokerAccount, options = {}) {
    return this.requestService.executeSyncPositions(brokerAccount, options);
  }

  async getRequestById(requestId) {
    return this.requestService.getRequestById(requestId);
  }

  async listRequestsByTrade(tradeId) {
    return this.requestService.listRequestsByTrade(tradeId);
  }

  async listRequests(filters, pagination) {
    return this.requestService.listRequests(filters, pagination);
  }

  async countByStatus(filters) {
    return this.requestService.countByStatus(filters);
  }

  async listLogs(filters, pagination) {
    return this.logs.list(filters, pagination);
  }

  async latencyStats(filters) {
    return this.logs.latencyStats(filters);
  }

  async symbolBreakdown(filters, limit) {
    return this.logs.symbolBreakdown(filters, limit);
  }

  async retryDeadLetterRequest(requestId) {
    return this.retry.deadLetter.retryDeadLetter(requestId);
  }

  listGateways() {
    return GatewayFactory.list();
  }

  async checkGatewayAvailability(gatewayType = GATEWAY_TYPES.METAAPI) {
    const gateway = GatewayFactory.create(gatewayType);
    const available = await gateway.isAvailable();
    return { gateway: gatewayType, available };
  }
}

export default ExecutionService;